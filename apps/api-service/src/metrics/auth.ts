import client from "prom-client";
import { register } from "./index";

export const googleLogins = new client.Counter({
  name: "api_auth_google_login_total",
  help: "Successful Google OAuth logins",
  registers: [register],
});

export const failedLogins = new client.Counter({
  name: "api_auth_failed_login_total",
  help: "Failed login attempts",
  registers: [register],
});
