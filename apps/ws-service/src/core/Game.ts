import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { randomUUID } from "crypto";
import { Move, Player, GameOverInfo, Side } from "../types/GameTypes";
import {
  invalidMoves,
  movesValidated,
  moveValidationLatency,
} from "@/metrics/gameplay";

export class Game {
  public readonly gameId: string;
  public player1: Player;
  public player2: Player;
  private board: Chess | null;

  constructor(player1: Player, player2: Player) {
    this.gameId = randomUUID();
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
  }

  validateUser(socket: WebSocket): boolean {
    if (socket != this.player1.socket && socket != this.player2.socket)
      return false;
    if (socket == this.player1.socket && this.board?.turn() == "b")
      return false;
    if (socket == this.player2.socket && this.board?.turn() == "w")
      return false;
    return true;
  }

  validateMove(move: Move): boolean {
    const end = moveValidationLatency.startTimer();

    try {
      if (this.board == null) {
        invalidMoves.inc();
        return false;
      }

      this.board.move(move);

      movesValidated.inc();
      return true;
    } catch (error) {
      invalidMoves.inc();
      return false;
    } finally {
      end();
    }
  }

  makeMove(socket: WebSocket, move: Move) {
    const isValidUser = this.validateUser(socket);
    if (!isValidUser || !this.board) return false;

    return this.validateMove(move);
  }

  checkGameOver(): GameOverInfo {
    if (this.board?.isGameOver()) {
      let reason = "";
      if (this.board.isCheckmate()) reason = "Checkmate";
      else if (this.board.isStalemate()) reason = "Stalemate";
      else if (this.board.isDraw()) reason = "Draw";
      let winner: Side = this.board.turn() == "w" ? "b" : "w";
      let winnerPlayer, loserPlayer;
      if (winner == "w") {
        winnerPlayer = this.player1;
        loserPlayer = this.player2;
      } else {
        winnerPlayer = this.player2;
        loserPlayer = this.player1;
      }
      return {
        isGameOver: true,
        winnerPlayer,
        loserPlayer,
        winnerSide: winner,
        reason: reason,
      };
    } else {
      return {
        isGameOver: false,
        winnerPlayer: null,
        loserPlayer: null,
        winnerSide: "TBD",
        reason: "TBD",
      };
    }
  }
}
