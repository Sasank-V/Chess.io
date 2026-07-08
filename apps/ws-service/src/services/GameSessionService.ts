import { WebSocket } from "ws";
import {
  INIT_GAME,
  MOVE,
  PLAYER_RESIGN,
  WEB_STREAM,
} from "@chess.io/shared-types";

import { Player } from "@/types/GameTypes";
import { GameMessenger } from "@/websocket/GameMessenger";
import { RedisGameStateRepository } from "@/repositories/redis/RedisGameRepository";
import GameService from "./GameService";
import { logger } from "@/config/Logger";

export class GameSessionService {
  private readonly activeGames = new Map<string, GameService>();
  private readonly socketToGame = new Map<WebSocket, string>();
  private pendingUser: Player | null = null;

  private readonly messenger = new GameMessenger();
  private readonly gameStateRepository = new RedisGameStateRepository();

  addUser(socket: WebSocket) {
    this.addHandler(socket);
  }

  removeUser(socket: WebSocket) {
    const gameId = this.socketToGame.get(socket);
    if (!gameId) {
      if (this.pendingUser?.socket === socket) {
        this.pendingUser = null;
      }
      return;
    }

    const game = this.activeGames.get(gameId);
    if (!game) {
      return;
    }

    game.handlePlayerResign(socket).catch(logger.error);
    this.socketToGame.delete(socket);
    this.activeGames.delete(gameId);
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case INIT_GAME: {
            await this.handleInitGame(socket, message);
            break;
          }

          case MOVE: {
            await this.handleMove(socket, message.move);
            break;
          }

          case PLAYER_RESIGN: {
            await this.handleResign(socket);
            break;
          }

          case WEB_STREAM: {
            this.handleWebStream(socket, message.data);
            break;
          }
        }
      } catch (err) {
        logger.error(err);
      }
    });
  }

  private async handleInitGame(socket: WebSocket, message: any) {
    const { username, email } = message;

    if (
      this.pendingUser &&
      this.pendingUser.socket.readyState === WebSocket.OPEN
    ) {
      const game = new GameService(
        this.pendingUser,
        {
          socket,
          username,
          email,
        },
        this.messenger,
        this.gameStateRepository,
      );

      const gameId = await game.initializeGame();

      this.activeGames.set(gameId, game);
      this.socketToGame.set(this.pendingUser.socket, gameId);
      this.socketToGame.set(socket, gameId);
      this.pendingUser = null;
    } else {
      this.pendingUser = {
        socket,
        username,
        email,
      };
    }
  }

  private async handleMove(socket: WebSocket, move: any) {
    const gameId = this.socketToGame.get(socket);
    if (!gameId) return;

    const game = this.activeGames.get(gameId);
    if (!game) return;

    await game.handleMove(socket, move);
  }

  private async handleResign(socket: WebSocket) {
    const gameId = this.socketToGame.get(socket);
    if (!gameId) return;

    const game = this.activeGames.get(gameId);
    if (!game) return;

    await game.handlePlayerResign(socket);
    this.activeGames.delete(gameId);
  }

  private handleWebStream(socket: WebSocket, data: unknown) {
    const gameId = this.socketToGame.get(socket);
    if (!gameId) return;

    const game = this.activeGames.get(gameId);
    if (!game) return;

    game.handleWebStream(socket, data);
  }
}
