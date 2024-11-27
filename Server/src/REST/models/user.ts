import mongoose, { Date, Document, Schema } from "mongoose";
import { IGame } from "./game";

export interface IUser extends Document {
    username: string,
    password:string,
    email:string,
    friends:mongoose.Types.ObjectId[] | IUser[],
    games:mongoose.Types.ObjectId[] | IGame[],
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
    password : {
        type:String,
        required : true,
    },
    email : {
        type:String,
        required:true,
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
    rating : {
        type : Number,
        default : 500
    },
    refreshToken : {
        type:String,
        default:""
    },
    OTP : {
        type:String,
        default:""
    }
});

const User = mongoose.model<IUser>("User",userSchema);
export default User