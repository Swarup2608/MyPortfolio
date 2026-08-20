import mongoose from "mongoose";
import {env} from "./env.js";

let isConnected = false;

export async function connectDB() : Promise<void> {
    if(isConnected && mongoose.connection.readyState === 1) {
        return;
    }
    try{
        await mongoose.connect(env.MONGODB_URI,{
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = true;
        console.log(`[db] Connected to MongoDB`);
    }
    catch(error) {
        console.error(`[db] Error connecting to MongoDB: ${error}`);
        throw error;
    }
}