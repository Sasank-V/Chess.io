import client from "prom-client";
import { register } from "./index";

export const movesValidated = new client.Counter({
  name: "ws_moves_validated_total",
  help: "Moves successfully validated",
  registers: [register],
});

export const invalidMoves = new client.Counter({
  name: "ws_invalid_moves_total",
  help: "Invalid move attempts",
  registers: [register],
});

export const moveValidationLatency = new client.Histogram({
  name: "ws_move_validation_duration_seconds",
  help: "Move validation latency",
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25],
  registers: [register],
});
