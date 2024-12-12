import mongoose, { Date, Document, Schema, Types } from "mongoose";
import { IGame } from "./game";

export interface IUser extends Document{
    _id: Types.ObjectId,
    username: string,
    email:string,
    picture:string,
    friends:Types.ObjectId[] | IUser[],
    games:Types.ObjectId[] | IGame[],
    gamesWon: Number,
    rating:number,
    refreshToken:string,
    OTP:string,
    OTPExpiry:Date
};

const userSchema = new mongoose.Schema({
    username : {
        type: String,
        required : true,
    },
    email : {
        type:String,
        required:true,
        unique:true,
    },
    picture : {
        type:String,
        default:"https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg?semt=ais_hybrid"
    },
    friends : [{
        type:Schema.Types.ObjectId,
        ref : "User"
    }],
    games : [{
        type:Schema.Types.ObjectId,
        ref : "Game"
    }],
    gamesWon : {
        type:Number,
        default:0,
    },
    rating : {
        type : Number,
        default : 500
    },
    refreshToken : {
        type:String,
        default:""
    }
});

const User = mongoose.model<IUser>("User",userSchema);
export default User