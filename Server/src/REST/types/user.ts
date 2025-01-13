export type JWTDecoded = {
  username: String;
  id: String;
  iat: Number;
  exp: Number;
};

export type GetAllResponse = {
  success: boolean;
  message: string;
  users: {
    name: string;
    id: string;
    rating: number;
    gamesPlayed: number;
  }[];
};

export type GetUserProfileResponse = {
  success: boolean;
  message: string;
  data?: {
    username: string;
    photo: string;
    rating: number;
    gamesPlayed: number;
    gamesWon: number;
    games: {
      white: string;
      black: string;
      total_moves: number;
      won: boolean;
      reason: string;
      id: string;
    }[];
  };
};
