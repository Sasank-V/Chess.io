export type Move = {
    from: string;
    to: string;
    promotion?: string;
  };

export type GameOverReply= {
    isGameOver:boolean,
    winner:string,
    reason:string,
}