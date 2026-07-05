import WebSocket from "ws";

export type Player = {
  socket: WebSocket;
  username: string;
  email: string;
};

export type Move = {
  from: string;
  to: string;
  promotion?: string;
};

export type GameOverInfo = {
  isGameOver: boolean;
  winnerPlayer: Player | null;
  loserPlayer: Player | null;
  winnerSide: Side;
  reason: string;
};

export type Side = "w" | "b" | "TBD";
