import client from "prom-client";
import { register } from "./index";

export const gamesSaved = new client.Counter({
  name: "persistence_games_saved_total",
  help: "Games persisted",
  registers: [register],
});

export const movesSaved = new client.Counter({
  name: "persistence_moves_saved_total",
  help: "Moves persisted",
  registers: [register],
});

export const gamesCompleted = new client.Counter({
  name: "persistence_games_completed_total",
  help: "Games completed",
  registers: [register],
});

export const persistenceLatency = new client.Histogram({
  name: "persistence_save_duration_seconds",
  help: "Persistence operation duration",
  labelNames: ["operation"],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [register],
});
