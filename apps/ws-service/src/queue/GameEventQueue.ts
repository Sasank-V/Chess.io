import { redisClient } from "@/config/Redis";
import { eventsPublished, redisPublishLatency } from "@/metrics/redis";
import { GameEvent } from "@chess.io/shared-types/src/events/game_events";

export async function publishGameEvent(event: GameEvent): Promise<void> {
  eventsPublished.inc();
  const end = redisPublishLatency.startTimer();
  await redisClient.xAdd("mq:game-events", "*", {
    payload: JSON.stringify(event),
  });
  end();
}
