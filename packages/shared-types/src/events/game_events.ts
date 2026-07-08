export interface CreateGameEvent {
  type: "CREATE_GAME";
  gameId: string;
  player1: string;
  player2: string;
}

export interface AddMoveEvent {
  type: "ADD_MOVE";
  gameId: string;
  move: {
    from: string;
    to: string;
    promotion?: string;
  };
}

export interface GameOverEvent {
  type: "GAME_OVER";
  gameId: string;
  winnerEmail?: string;
  reason?: string;
}

export type GameEvent = CreateGameEvent | AddMoveEvent | GameOverEvent;
