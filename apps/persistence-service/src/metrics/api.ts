import client from "prom-client";
import { register } from "./index";

export const apiCalls = new client.Counter({
  name: "persistence_api_calls_total",
  help: "API calls made to API Service",
  labelNames: ["method", "endpoint", "status"],
  registers: [register],
});

export const apiFailures = new client.Counter({
  name: "persistence_api_failures_total",
  help: "Failed API calls",
  labelNames: ["method", "endpoint"],
  registers: [register],
});

export const apiLatency = new client.Histogram({
  name: "persistence_api_duration_seconds",
  help: "API request duration",
  labelNames: ["method", "endpoint"],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});
