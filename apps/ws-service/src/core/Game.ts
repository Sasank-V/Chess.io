import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { Move, Player, GameOverInfo, Side } from "../types/GameTypes";

export class Game {
  public player1: Player;
  public player2: Player;
  private board: Chess | null;

  constructor(player1: Player, player2: Player) {
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
    try {
      if (this.board == null) return false;
      this.board.move(move);
      return true;
    } catch (error) {
      return false;
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
