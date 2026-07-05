import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectToDB } from "./database.js";
import http from "http";

import { default as authRouter } from "./routes/auth";
import { default as userRouter } from "./routes/user";
import { default as gameRouter } from "./routes/game";
// import { verifyJWT } from './REST/middleware/auth';

const app = express();

const server = http.createServer(app);

connectToDB();
dotenv.config();

const allowedOrigins = process.env.CLIENT_URLS?.split(",") ?? [];
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/game", gameRouter);

app.get("/", (req, res) => {
  res.send("Hello, I am groot !");
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "404 Route not found",
  });
});

server.listen(3000, () => {
  console.log("Express Server is listening on port 3000");
});
