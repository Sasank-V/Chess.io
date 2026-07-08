import client from "prom-client";

export const register = new client.Registry();

register.setDefaultLabels({
  service: "api-service",
});

client.collectDefaultMetrics({
  register,
});
