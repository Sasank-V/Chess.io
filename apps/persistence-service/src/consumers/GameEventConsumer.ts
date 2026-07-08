import { GameEvent } from "@chess.io/shared-types";
import PersistenceService from "../services/PersistenceService.js";
import { redisClient } from "../config/Redis.js";

export default class GameEventConsumer {
  private readonly STREAM = "mq:game-events";

  private readonly persistence = new PersistenceService();

  async start() {
    let lastId = "0";

    while (true) {
      const response = await redisClient.xRead(
        {
          key: this.STREAM,
          id: lastId,
        },
        {
          BLOCK: 0,
        },
      );

      if (!response) {
        continue;
      }

      for (const stream of response) {
        for (const message of stream.messages) {
          lastId = message.id;

          try {
            const event = JSON.parse(message.message.payload) as GameEvent;

            await this.persistence.handle(event);
          } catch (err) {
            console.error("Failed to process event", err);
          }
        }
      }
    }
  }
}
