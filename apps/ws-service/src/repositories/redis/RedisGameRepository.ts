import { redisClient } from "@/config/Redis";
import { Move } from "@/types/GameTypes";
import { IGameStateRepository } from "../interfaces/IGameStateRepository";

export class RedisGameStateRepository implements IGameStateRepository {
  private getGameKey(gameId: string) {
    return `game:${gameId}`;
  }

  private getMovesKey(gameId: string) {
    return `game:${gameId}:moves`;
  }

  async createGame(gameId: string): Promise<void> {
    await redisClient.hSet(this.getGameKey(gameId), {
      status: "ACTIVE",
      createdAt: Date.now().toString(),
    });
  }

  async appendMove(gameId: string, move: Move): Promise<void> {
    await redisClient.rPush(this.getMovesKey(gameId), JSON.stringify(move));
  }

  async getMoves(gameId: string): Promise<Move[]> {
    const moves = await redisClient.lRange(this.getMovesKey(gameId), 0, -1);
    return moves.map((move) => JSON.parse(move) as Move);
  }

  async setGameOver(
    gameId: string,
    winnerEmail?: string,
    reason?: string,
  ): Promise<void> {
    await redisClient.hSet(this.getGameKey(gameId), {
      status: "COMPLETED",
      winnerEmail: winnerEmail ?? "",
      reason: reason ?? "",
      completedAt: Date.now().toString(),
    });
  }

  async deleteGame(gameId: string): Promise<void> {
    await redisClient.del([this.getGameKey(gameId), this.getMovesKey(gameId)]);
  }
}
