import { Move } from "@chess.io/shared-types";

export interface IGameRepository {
  addGame(player1Email: string, player2Email: string): Promise<string>;
  addMove(gameId: string, move: Move): Promise<void>;
  setGameOver(
    gameId: string,
    winnerEmail?: string,
    reason?: string,
  ): Promise<void>;
}
