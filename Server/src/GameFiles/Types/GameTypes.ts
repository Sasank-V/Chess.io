import WebSocket from "ws";

export type Move = {
  from: string;
  to: string;
  promotion?: string;
};

export type GameOverReply = {
  isGameOver: boolean;
  winner: string;
  reason: string;
};

export type Player = {
  socket: WebSocket;
  username: String;
  email: String;
};
