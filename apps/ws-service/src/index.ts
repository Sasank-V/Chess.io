import { WebSocketServer } from "ws";
import { GameSessionService } from "./services/GameSessionService";
import dotenv from "dotenv";

dotenv.config();
const wss = new WebSocketServer({ port: 8080 });
const gameSessionService = new GameSessionService();

wss.on("connection", function connection(ws) {
  console.log("User Connected");
  gameSessionService.addUser(ws);

  // Handle client disconnection
  ws.on("close", () => {
    console.log("User Disconnected");
    gameSessionService.removeUser(ws);
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    gameSessionService.removeUser(ws);
  });
});
console.log("WebSocket server listening on ws://localhost:8080");
