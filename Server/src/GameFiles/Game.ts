import { WebSocket } from "ws";
import { Chess } from "chess.js";
import {
  GAME_OVER,
  INIT_GAME,
  INVALID_MOVE,
  MOVE,
  VALIDATE_MOVE,
} from "./Messages";
import { Worker } from "worker_threads";
import { Move, GameOverReply } from "./Types/GameTypes";
import { WorkerMoveReply } from "./Types/WorkerTypes";
import path from "path";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  private board: Chess | null;
  private startTime: Date;
  private worker: Worker;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    const workerPath = path.join(__dirname, "Worker.js");
    this.worker = new Worker(workerPath);

    // Setup worker message listener only once in the constructor
    this.worker.on("message", (message: WorkerMoveReply) => {
      this.handleWorkerMessage(message);
    });

    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "w",
        },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "b",
        },
      })
    );
  }

  validateUser(socket: WebSocket): boolean {
    if (socket != this.player1 && socket != this.player2) return false;
    if (socket == this.player1 && this.board?.turn() == "b") return false;
    if (socket == this.player2 && this.board?.turn() == "w") return false;
    return true;
  }

  checkGameover(): GameOverReply {
    if (this.board?.isGameOver()) {
      let reason = "";
      if (this.board.isCheckmate()) reason = "Checkmate";
      else if (this.board.isStalemate()) reason = "Stalemate";
      else if (this.board.isDraw()) reason = "Draw";
      let winner = this.board.turn() == "w" ? "b" : "w";
      return {
        isGameOver: true,
        winner: winner,
        reason: reason,
      };
    } else {
      return {
        isGameOver: false,
        winner: "TBD",
        reason: "TBD",
      };
    }
  }

  handleGameOver() {
    const { isGameOver, winner, reason } = this.checkGameover();
    if (isGameOver) {
      this.player1.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner,
            reason,
          },
        })
      );
      this.player2.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner,
            reason,
          },
        })
      );
      // Terminate worker after the game is over
      this.worker.terminate();
    }
  }

  sendValidMove(socket: WebSocket, move: Move) {
    const oppSocket = socket == this.player1 ? this.player2 : this.player1;
    this.board?.move(move);
    oppSocket.send(
      JSON.stringify({
        type: MOVE,
        payload: move,
      })
    );
  }

  makeMove(socket: WebSocket, move: Move) {
    // Validate user
    const isValidUser = this.validateUser(socket);
    if (!isValidUser) return;

    // Validate move using worker threads
    this.worker.postMessage({
      type: VALIDATE_MOVE,
      data: {
        move,
        board: this.board?.fen(),
      },
    });
  }

  handleWorkerMessage(message: WorkerMoveReply) {
    const { move, isValid } = message;
    const socket = this.board?.turn() === 'w' ? this.player1 : this.player2;

    if (isValid) {
      // Send valid move to opponent
      this.sendValidMove(socket!, move);
      this.handleGameOver();
    } else {
      socket!.send(
        JSON.stringify({
          type: INVALID_MOVE,
          payload: {
            reason: "Invalid move",
          },
        })
      );
      console.log("Invalid Move");
    }
  }

  handlePlayerResign(socket: WebSocket) {
    const oppSocket = this.player1 == socket ? this.player2 : this.player1;
    socket.send(
      JSON.stringify({
        type: GAME_OVER,
        payload: {
          winner: socket == this.player1 ? "b" : "w",
          reason: "You resigned",
        },
      })
    );
    oppSocket.send(
      JSON.stringify({
        type: GAME_OVER,
        payload: {
          winner: socket == this.player1 ? "b" : "w",
          reason: "Opponent resigned",
        },
      })
    );
    this.worker.terminate();
  }
}
