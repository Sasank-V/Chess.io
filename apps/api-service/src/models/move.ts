import mongoose, { Document } from "mongoose";

export interface IMove extends Document {
  from: string;
  to: string;
  promotion: string;
}

const moveSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  promotion: {
    type: String,
    default: "",
  },
});

const Move = mongoose.model<IMove>("Move", moveSchema);
export default Move;
