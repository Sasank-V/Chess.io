import http from "http";

import { connectRedis } from "./config/Redis.js";
import GameEventConsumer from "./consumers/GameEventConsumer.js";
import { register } from "./metrics/index.js";

async function bootstrap() {
  await connectRedis();

  const consumer = new GameEventConsumer();

  console.log("Starting GameEventConsumer...");
  consumer.start(); // Runs in the background

  const PORT = Number(process.env.PORT) || 4000;

  const server = http.createServer(async (req, res) => {
    try {
      switch (req.url) {
        case "/metrics":
          res.writeHead(200, {
            "Content-Type": register.contentType,
          });

          res.end(await register.metrics());
          break;

        case "/health":
          res.writeHead(200, {
            "Content-Type": "text/plain",
          });

          res.end("OK");
          break;

        default:
          res.writeHead(404, {
            "Content-Type": "application/json",
          });

          res.end(
            JSON.stringify({
              success: false,
              message: "Route not found",
            }),
          );
      }
    } catch (err) {
      console.error("Metrics endpoint failed:", err);

      res.writeHead(500, {
        "Content-Type": "text/plain",
      });

      res.end("Internal Server Error");
    }
  });

  server.listen(PORT, () => {
    console.log(`Persistence Service listening on port ${PORT}`);
    console.log(`Metrics: http://localhost:${PORT}/metrics`);
    console.log(`Health : http://localhost:${PORT}/health`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start persistence service:", err);
  process.exit(1);
});
