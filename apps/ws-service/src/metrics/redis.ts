import client from "prom-client";
import { register } from "./index";

export const eventsPublished = new client.Counter({
  name: "ws_events_published_total",
  help: "Events published to Redis",
  labelNames: ["event"],
  registers: [register],
});

export const redisPublishLatency = new client.Histogram({
  name: "ws_redis_publish_duration_seconds",
  help: "Redis publish latency",
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05],
  registers: [register],
});
