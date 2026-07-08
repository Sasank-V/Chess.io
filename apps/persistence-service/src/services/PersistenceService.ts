import { GameEvent } from "@chess.io/shared-types";
import { MongoGameRepository } from "../repositories/mongodb/MongoGameRepository.js";

export default class PersistenceService {
  constructor(private readonly repository = new MongoGameRepository()) {}

  async handle(event: GameEvent): Promise<void> {
    switch (event.type) {
      case "CREATE_GAME":
        await this.repository.addGame(event.player1, event.player2);
        break;

      case "ADD_MOVE":
        await this.repository.addMove(event.gameId, event.move);
        break;

      case "GAME_OVER":
        await this.repository.setGameOver(
          event.gameId,
          event.winnerEmail,
          event.reason,
        );
        break;
    }
  }
}
