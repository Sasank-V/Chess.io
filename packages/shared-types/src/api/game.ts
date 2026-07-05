export type CreateGameRequest = {
  player1: string;
  player2: string;
};

export type CreateGameResponse = {
  success: boolean;
  message: string;
  gameId?: string;
};

export type AddMoveRequest = {
  from: string;
  to: string;
  promotion: string;
  gameId: string;
};

export type AddMoveResponse = {
  success: boolean;
  message: string;
};

export type GameOverRequest = {
  gameId: string;
  email: string;
  reason: string;
};

export type GameOverResponse = AddMoveResponse;
