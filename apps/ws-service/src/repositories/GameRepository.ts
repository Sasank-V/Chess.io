import { Move, Player } from "@/types/GameTypes";
import { axiosC } from "@/utils/AxiosConfig";
import {
  AddMoveResponse,
  CreateGameResponse,
  GameOverResponse,
} from "@chess.io/shared-types";

class GameRepository {
  async addGame(player1: Player, player2: Player): Promise<string> {
    const response = await axiosC.post<CreateGameResponse>("/game/create", {
      player1: player1.username,
      player2: player2.username,
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

export default GameRepository;
