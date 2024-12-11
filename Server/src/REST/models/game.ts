import mongoose, { Document, Schema, Types } from "mongoose";
import { IUser } from "./user";
import { IMove } from "./move";

export interface IGame extends Document{
    player1:mongoose.Types.ObjectId | IUser,
    player2:mongoose.Types.ObjectId | IUser,
    moves:mongoose.Types.ObjectId[] | IMove[],
    isGameOver:Boolean,
    winner:Types.ObjectId,
    reason:String
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
    isGameOver : {
        type:Boolean,
        default:false,
    },
    winner : {
        type: Schema.Types.ObjectId,
        ref:"User",
    },
    reason : {
        type:String,
        default: "",
    }
});
const Game = mongoose.model<IGame>("Game",gameSchema);
export default Game;