import client from "prom-client";

export const register = new client.Registry();

register.setDefaultLabels({
  service: "ws-service",
});

client.collectDefaultMetrics({
  register,
});
