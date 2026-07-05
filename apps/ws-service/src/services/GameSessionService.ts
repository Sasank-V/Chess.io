import { WebSocket } from "ws";
import {
  INIT_GAME,
  MOVE,
  PLAYER_RESIGN,
  WEB_STREAM,
} from "@chess.io/shared-types";
import { Player } from "@/types/GameTypes";
import { GameMessenger } from "@/websocket/GameMessenger";
import GameRepository from "@/repositories/GameRepository";
import GameService from "./GameService";

export class GameSessionService {
  private games: GameService[] = [];
  private pendingUser: Player | null = null;
  private users: WebSocket[] = [];

  // Shared across all games
  private readonly messenger = new GameMessenger();
  private readonly repository = new GameRepository();

  private findGameBySocket(socket: WebSocket): GameService | undefined {
    return this.games.find((game) => game.hasPlayer(socket));
  }

  addUser(socket: WebSocket) {
    this.users.push(socket);
    this.addHandler(socket);
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user !== socket);
    const game = this.findGameBySocket(socket);
    if (game) {
      game.handlePlayerResign(socket).catch((error) => {
        console.error("Error handling player disconnect:", error);
      });
    } else if (this.pendingUser?.socket === socket) {
      this.pendingUser = null;
    }
  }

  private addHandler(socket: WebSocket) {
    socket.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case INIT_GAME: {
            const { username, email } = message;
            if (this.findGameBySocket(socket)) {
              console.warn("Player is already in a game.");
              return;
            }
            if (
              this.pendingUser &&
              this.pendingUser.socket.readyState === WebSocket.OPEN
            ) {
              const game = new GameService(
                this.pendingUser,
                { socket, username, email },
                this.messenger,
                this.repository,
              );
              await game.initializeGame();
              this.games.push(game);
              this.pendingUser = null;
            } else {
              this.pendingUser = {
                socket,
                username,
                email,
              };
            }
            break;
          }

          case MOVE: {
            const game = this.findGameBySocket(socket);
            if (game) {
              await game.handleMove(socket, message.move);
            }
            break;
          }

          case PLAYER_RESIGN: {
            const game = this.findGameBySocket(socket);
            if (game) {
              await game.handlePlayerResign(socket);
            }
            break;
          }

          case WEB_STREAM: {
            const game = this.findGameBySocket(socket);
            if (game) {
              game.handleWebStream(socket, message.data);
            }
            break;
          }
        }
      } catch (error) {
        console.error("Error handling websocket message:", error);
      }
    });
  }
}
