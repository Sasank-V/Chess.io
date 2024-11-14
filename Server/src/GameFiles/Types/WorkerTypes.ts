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

export type ValidateMove = {
    move: Move,
    board:string
}

export type WorkerMessage = {
    type: string,
    data: ValidateMove
}