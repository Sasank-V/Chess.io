import client from "prom-client";

export const register = new client.Registry();

register.setDefaultLabels({
  service: "persistence-service",
});

client.collectDefaultMetrics({
  register,
});
