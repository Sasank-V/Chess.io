import { connectRedis } from "./config/Redis";
import GameEventConsumer from "./consumers/GameEventConsumer";

async function bootstrap() {
  await connectRedis();

  const consumer = new GameEventConsumer();
  console.log("Starting GameEventConsumer...");
  await consumer.start();
}

bootstrap().catch(console.error);
