import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config()

export const connectToDB = async () => {
    try{
        if(!process.env.MONGODB_URL) return;
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MongoDB Connected");
    }catch(err){
        console.log("Error while connecting to MongoDB: " ,err);
        process.exit(1);
    }
}

