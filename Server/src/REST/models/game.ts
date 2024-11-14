import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./user";
import { IMove } from "./move";

export interface IGame extends Document{
    player1:mongoose.Types.ObjectId | IUser,
    player2:mongoose.Types.ObjectId | IUser,
    moves:mongoose.Types.ObjectId[] | IMove[],
    winner:number,
    reason:string
}

const gameSchema = new mongoose.Schema({
    player1 : {
        type: Schema.Types.ObjectId,
        ref : "User"
    },
    player2 : {
        type: Schema.Types.ObjectId,
        ref : "User"
    },
    moves : [{
        type:Schema.Types.ObjectId,
        ref : "Move"
    }],
    winner : {
        type: Number, // 1 - If player1 wins , 2 - If Player2 wins
        required:true,
    },
    reason : {
        type:String,
        required: true
    }
});
const Game = mongoose.model<IGame>("Game",gameSchema);
export default Game;