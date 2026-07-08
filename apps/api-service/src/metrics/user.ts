import client from "prom-client";
import { register } from "./index";

export const usersRegistered = new client.Counter({
  name: "api_users_registered_total",
  help: "Registered users",
  registers: [register],
});

export const profileRequests = new client.Counter({
  name: "api_profile_requests_total",
  help: "Profile requests",
  registers: [register],
});
