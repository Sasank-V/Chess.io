import client from "prom-client";
import { register } from "./index";

export const eventsConsumed = new client.Counter({
  name: "persistence_events_consumed_total",
  help: "Total Redis events consumed",
  registers: [register],
});

export const eventsByType = new client.Counter({
  name: "persistence_events_total",
  help: "Events consumed by type",
  labelNames: ["type"],
  registers: [register],
});

export const failedEvents = new client.Counter({
  name: "persistence_failed_events_total",
  help: "Failed event processing",
  registers: [register],
});
