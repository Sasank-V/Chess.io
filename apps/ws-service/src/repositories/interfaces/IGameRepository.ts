import { Move, Player } from "@/types/GameTypes";

export interface IGameRepository {
  addGame(player1: Player, player2: Player): Promise<string>;
  addMove(gameId: string, move: Move): Promise<void>;
  setGameOver(
    gameId: string,
    winnerEmail?: string,
    reason?: string,
  ): Promise<void>;
}
