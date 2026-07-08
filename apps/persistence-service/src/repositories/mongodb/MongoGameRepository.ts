import {
  AddMoveResponse,
  CreateGameResponse,
  GameOverResponse,
  Player,
  Move,
} from "@chess.io/shared-types";
import { IGameRepository } from "../interfaces/index.js";
import { axiosC } from "../../config/AxiosConfig.js";

export class MongoGameRepository implements IGameRepository {
  async addGame(player1Email: string, player2Email: string): Promise<string> {
    const response = await axiosC.post<CreateGameResponse>("/game/create", {
      player1: player1Email,
      player2: player2Email,
    });
    const res = response.data;
    if (!res.success || !res.gameId) {
      throw new Error(res.message || "Failed to create game");
    }
    return res.gameId;
  }
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
