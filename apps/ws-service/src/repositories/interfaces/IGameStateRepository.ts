import { Move } from "@/types/GameTypes";

export interface IGameStateRepository {
  createGame(gameId: string): Promise<void>;

  appendMove(gameId: string, move: Move): Promise<void>;

  getMoves(gameId: string): Promise<Move[]>;

  setGameOver(
    gameId: string,
    winnerEmail?: string,
    reason?: string,
  ): Promise<void>;

  deleteGame(gameId: string): Promise<void>;
}
