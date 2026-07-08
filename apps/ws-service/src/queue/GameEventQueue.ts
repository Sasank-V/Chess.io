import { redisClient } from "@/config/Redis";
import { GameEvent } from "@chess.io/shared-types/src/events/game_events";

export async function publishGameEvent(event: GameEvent): Promise<void> {
  await redisClient.xAdd("mq:game-events", "*", {
    payload: JSON.stringify(event),
  });
}
