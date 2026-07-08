import { WebSocketServer } from "ws";
import { GameSessionService } from "./services/GameSessionService";
import { connectRedis } from "./config/Redis";
import { logger } from "./config/Logger";

async function bootstrap() {
  await connectRedis();

  const wss = new WebSocketServer({ port: 8080 });
  const gameSessionService = new GameSessionService();

  wss.on("connection", (ws) => {
    logger.info("User Connected");

    gameSessionService.addUser(ws);

    ws.on("close", () => {
      logger.info("User Disconnected");
      gameSessionService.removeUser(ws);
    });

    ws.on("error", (error) => {
      logger.error("WebSocket error:" + error);
      gameSessionService.removeUser(ws);
    });
  });

  logger.info("WebSocket server listening on ws://localhost:8080");
}

bootstrap().catch((err) => {
  logger.error("Failed to start WebSocket server:", err);
  process.exit(1);
});
