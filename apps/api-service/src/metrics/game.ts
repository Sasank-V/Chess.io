import client from "prom-client";
import { register } from "./index";

export const gamesCreated = new client.Counter({
  name: "api_games_created_total",
  help: "Games created",
  registers: [register],
});

export const gamesFinished = new client.Counter({
  name: "api_games_finished_total",
  help: "Games completed",
  registers: [register],
});

export const movesSaved = new client.Counter({
  name: "api_moves_saved_total",
  help: "Moves persisted",
  registers: [register],
});

export const replayRequests = new client.Counter({
  name: "api_game_replay_requests_total",
  help: "Replay API requests",
  registers: [register],
});
