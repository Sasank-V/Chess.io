import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType;

export function getRedisClient() {
  if (!redisClient) {
    console.log("Creating Redis client:", process.env.REDIS_URL);

    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on("error", (err) => {
      console.error("Redis Error:", err);
    });
  }

  return redisClient;
}

export async function connectRedis() {
  const client = getRedisClient();

  if (!client.isOpen) {
    await client.connect();
  }
}

export { redisClient };
