import { Move } from "./GameTypes"

export type WorkerMoveReply = {
    type:string,
    move : {
        from:string,
        to:string,
        promotion?:string
    },
    isValid:boolean
}

export type WorkerGameOverReply= {
    type:string,
    isGameOver:boolean,
    winner:string,
    reason:string,
}

export type ValidateMove = {
    move: Move,
    board:string
}

export type CheckGameOver = {
    board:string
}

export type WorkerMessage = {
    type: string,
    data: ValidateMove | CheckGameOver
}