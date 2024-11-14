import mongoose, { Document } from "mongoose";

export interface IMove extends Document{
    from:string,
    to:string,
    fen:string,
}

const moveSchema = new mongoose.Schema({
    from : {
        type: String,
        required: true 
    },
    to : {
        type: String,
        required : true,
    },
    fen : {
        type:String,
        required : true
    }
});

const Move = mongoose.model<IMove>("Move",moveSchema);
export default Move;