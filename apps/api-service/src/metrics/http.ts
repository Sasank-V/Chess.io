import client from "prom-client";
import { register } from "./index";

export const httpRequestsTotal = new client.Counter({
  name: "api_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [register],
});

export const httpRequestDuration = new client.Histogram({
  name: "api_http_request_duration_seconds",
  help: "Duration of HTTP requests",
  labelNames: ["method", "route", "status"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

export const activeRequests = new client.Gauge({
  name: "api_http_active_requests",
  help: "Current active HTTP requests",
  registers: [register],
});

export const requestSize = new client.Histogram({
  name: "api_http_request_size_bytes",
  help: "Incoming request size",
  buckets: [512, 1024, 2048, 4096, 8192, 16384],
  registers: [register],
});

export const responseSize = new client.Histogram({
  name: "api_http_response_size_bytes",
  help: "Outgoing response size",
  buckets: [512, 1024, 2048, 4096, 8192, 16384],
  registers: [register],
});
