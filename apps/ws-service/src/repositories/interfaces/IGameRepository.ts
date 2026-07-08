import { Move, Player } from "@/types/GameTypes";

export interface IGameRepository {
  addMove(gameId: string, move: Move): Promise<void>;
  setGameOver(
    gameId: string,
    winnerEmail?: string,
    reason?: string,
  ): Promise<void>;
}
