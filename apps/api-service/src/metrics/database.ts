import client from "prom-client";
import { register } from "./index";

export const mongoQueries = new client.Counter({
  name: "api_mongodb_queries_total",
  help: "MongoDB queries executed",
  labelNames: ["collection", "operation"],
  registers: [register],
});

export const mongoErrors = new client.Counter({
  name: "api_mongodb_errors_total",
  help: "MongoDB query failures",
  labelNames: ["collection", "operation"],
  registers: [register],
});

export const mongoLatency = new client.Histogram({
  name: "api_mongodb_query_duration_seconds",
  help: "MongoDB query duration",
  labelNames: ["collection", "operation"],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [register],
});
