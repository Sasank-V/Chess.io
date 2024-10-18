import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, INVALID_MOVE, MOVE } from "./Messages";

type Move = {
  from: string;
  to: string;
  promotion?: string;
};

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  private board: Chess | null;
  private startTime: Date;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "w",
        }
      })
    );
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "b",
        }
      })
    );
  }

  makeMove(socket: WebSocket, move: Move) {
    //Validate user
    if (socket != this.player1 && socket != this.player2) return;
    if (socket == this.player1 && this.board?.turn() == "b") return;
    if (socket == this.player2 && this.board?.turn() == "w") return;
    //Validate move
    try {
      this.board?.move(move);
      socket.send("");
    } catch (error) {
      console.log("Invalid move: ", error);
      return;
    }
    if (this.board?.isGameOver()) {
      this.player1.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() == "w" ? "b" : "w",
          }
        })
      );
      this.player2.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() == "w" ? "b" : "w",
          }
        })
      );
      return;
    }
    if (this.board?.turn() == "b") {
      this.player2.send(
        JSON.stringify({
          type: MOVE,
          payload: move
        })
      );
    } else {
      this.player1.send(
        JSON.stringify({
          type: MOVE,
          payload: move
        })
      );
    }
  }
  handlePlayerResign(socket: WebSocket) {
    const oppSocket = this.player1 == socket ? this.player2 : this.player1;
    socket.send(
      JSON.stringify({
        type: GAME_OVER,
        payload: {
            winner: socket == this.player1 ? 'b' : 'w'
        }
      })
    );
    oppSocket.send(JSON.stringify({
        type: GAME_OVER,
        payload : {
            winner: socket == this.player1 ? 'b' : 'w'
        }
    }))
  }
}
