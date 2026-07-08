import client from "prom-client";
import { register } from "./index";

export const connectedClients = new client.Gauge({
  name: "ws_connected_clients",
  help: "Currently connected websocket clients",
  registers: [register],
});

export const activeGames = new client.Gauge({
  name: "ws_active_games",
  help: "Currently active games",
  registers: [register],
});

export const messagesReceived = new client.Counter({
  name: "ws_messages_received_total",
  help: "Incoming websocket messages",
  labelNames: ["type"],
  registers: [register],
});

export const messagesSent = new client.Counter({
  name: "ws_messages_sent_total",
  help: "Outgoing websocket messages",
  labelNames: ["type"],
  registers: [register],
});
