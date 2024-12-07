export type CreateGameRequest = {
    player1 : String,
    player2 : String,
}

export type CreateGameResponse = {
    success : Boolean,
    message: String,
    gameId?: String
}

export type AddMoveRequest = {
    from : String,
    to : String,
    promotion:String,
    gameId:String,
}

export type AddMoveResponse = {
    success:Boolean,
    message:String
}

export type GameOverRequest = {
    gameId:String,
    winnerUsername:String,
    reason:String,
}

export type GameOverResponse = AddMoveResponse;