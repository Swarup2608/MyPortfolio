import mongoose from "mongoose";
import {env} from "./env.js";

export async function connectDB() : Promise<void> {
    if(mongoose.connection.readyState === 1) {
        return;
    }
    if(mongoose.connection.readyState === 2) {
        return;
    }
    try{
        await mongoose.connect(env.MONGODB_URI,{
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`[db] Connected to MongoDB`);
    }
    catch(error) {
        console.error(`[db] Error connecting to MongoDB: ${error}`);
        throw error;
    }
}
