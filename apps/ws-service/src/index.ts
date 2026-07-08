import http from "http";
import { WebSocketServer } from "ws";

import { GameSessionService } from "./services/GameSessionService";
import { connectRedis } from "./config/Redis";
import { logger } from "./config/Logger";

import { register } from "./metrics";
import { connectedClients } from "./metrics/websocket";

async function bootstrap() {
  await connectRedis();

  const server = http.createServer(async (req, res) => {
    if (req.url === "/metrics") {
      res.writeHead(200, {
        "Content-Type": register.contentType,
      });

      res.end(await register.metrics());
      return;
    }

    if (req.url === "/health") {
      res.writeHead(200);
      res.end("OK");
      return;
    }

    res.writeHead(404);
    res.end();
  });
  const wss = new WebSocketServer({ server });
  const gameSessionService = new GameSessionService();

  wss.on("connection", (ws) => {
    connectedClients.inc();
    logger.info("User Connected");

    gameSessionService.addUser(ws);

    ws.on("close", () => {
      connectedClients.dec();
      logger.info("User Disconnected");
      gameSessionService.removeUser(ws);
    });

    ws.on("error", (error) => {
      connectedClients.dec();
      logger.error("WebSocket error:" + error);
      gameSessionService.removeUser(ws);
    });
  });

  server.listen(8080, () => {
    logger.info("WebSocket Server listening on ws://localhost:8080");
  });
}

bootstrap().catch((err) => {
  logger.error("Failed to start WebSocket server:", err);
  process.exit(1);
});
