import { GameEvent } from "@chess.io/shared-types";
import { MongoGameRepository } from "../repositories/mongodb/MongoGameRepository.js";

import {
  gamesSaved,
  movesSaved,
  gamesCompleted,
  persistenceLatency,
} from "../metrics/persistence.js";

export default class PersistenceService {
  constructor(private readonly repository = new MongoGameRepository()) {}

  async handle(event: GameEvent): Promise<void> {
    const end = persistenceLatency.startTimer({
      operation: event.type,
    });

    try {
      switch (event.type) {
        case "CREATE_GAME":
          await this.repository.addGame(
            event.player1,
            event.player2,
            event.gameId,
          );
          gamesSaved.inc();
          break;

        case "ADD_MOVE":
          await this.repository.addMove(event.gameId, event.move);
          movesSaved.inc();
          break;

        case "GAME_OVER":
          await this.repository.setGameOver(
            event.gameId,
            event.winnerEmail,
            event.reason,
          );
          gamesCompleted.inc();
          break;
      }
    } finally {
      end();
    }
  }
}
