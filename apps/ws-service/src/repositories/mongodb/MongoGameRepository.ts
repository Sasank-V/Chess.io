import { Move, Player } from "@/types/GameTypes";
import { axiosC } from "@/config/AxiosConfig";
import {
  AddMoveResponse,
  CreateGameResponse,
  GameOverResponse,
} from "@chess.io/shared-types";
import { IGameRepository } from "../interfaces";

export class MongoGameRepository implements IGameRepository {
  async addMove(gameId: string, move: Move): Promise<void> {
    const response = await axiosC.post<AddMoveResponse>("/game/move", {
      from: move.from,
      to: move.to,
      promotion: move.promotion || "",
      gameId,
    });
    const res = response.data;
    if (!res.success) {
      throw new Error(res.message || "Failed to add move to game");
    }
  }
  async setGameOver(
    gameId: string,
    winnerEmail?: string,
    reason?: string,
  ): Promise<void> {
    const response = await axiosC.post<GameOverResponse>("/game/over", {
      gameId,
      email: winnerEmail,
      reason,
    });
    const res = response.data;
    if (!res.success) {
      throw new Error(res.message || "Failed to set game over");
    }
  }
}
