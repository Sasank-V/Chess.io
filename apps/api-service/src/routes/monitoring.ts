import { Router } from "express";
import { register } from "../metrics";

const router = Router();

router.get("/metrics", async (_, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

router.get("/health", (_, res) => {
  res.json({
    status: "UP",
    service: "api-service",
    timestamp: new Date().toISOString(),
  });
});

export default router;
