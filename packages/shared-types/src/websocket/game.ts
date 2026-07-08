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
