import { CLOSING, WebSocket } from "ws";
import {
  GAME_OVER,
  INIT_GAME,
  MOVE,
  PLAYER_RESIGN,
  WEB_STREAM,
} from "./Messages";
import { Game } from "./Game";
import { Player } from "./Types/GameTypes";

export class GameManager {
  private games: Game[];
  private pendingUser: Player | null;
  private users: WebSocket[];
  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.users = [];
  }

  addUser(socket: WebSocket) {
    this.users.push(socket);
    this.addHandler(socket);
  }
  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user != socket);
    const game = this.findGameBySocket(socket);
    if (game) game.handlePlayerResign(socket);
    else if (this.pendingUser) {
      this.pendingUser =
        this.pendingUser.socket == socket ? null : this.pendingUser;
    }
  }
  findGameBySocket(socket: WebSocket): Game | undefined {
    const game = this.games.find(
      (game) => game.player1.socket === socket || game.player2.socket === socket
    );
    return game;
  }
  handleStream(socket: WebSocket, message: any) {
    const game = this.findGameBySocket(socket);
    if (!game) return;
    const oppnentPlayer =
      game?.player1.socket == socket ? game.player2 : game.player1;
    oppnentPlayer.socket.send(
      JSON.stringify({
        type: WEB_STREAM,
        data: message,
      })
    );
  }
  private addHandler(socket: WebSocket) {
    socket.on("message", (data) => {
      const messsage = JSON.parse(data.toString());
      if (messsage.type == INIT_GAME) {
        const { username, email } = messsage;
        const existingGame = this.findGameBySocket(socket);
        if (existingGame) {
          console.log("Already PLaying");
          return;
        }

        // Check if pending user is still connected
        if (
          this.pendingUser &&
          this.pendingUser.socket.readyState === WebSocket.OPEN
        ) {
          const game = new Game(this.pendingUser, { socket, username, email });
          this.games.push(game);
          this.pendingUser = null;
        } else {
          // Clear any stale pending user
          this.pendingUser = null;
          this.pendingUser = { socket, username, email };
        }
      }
      if (messsage.type === MOVE) {
        const game = this.findGameBySocket(socket);
        if (game) {
          game.makeMove(socket, messsage.move);
        }
      }
      if (messsage.type == PLAYER_RESIGN) {
        const game = this.findGameBySocket(socket);
        if (game) {
          game.handlePlayerResign(socket);
        }
      }
      if (messsage.type == WEB_STREAM) {
        this.handleStream(socket, messsage.data);
      }
    });
  }
}
