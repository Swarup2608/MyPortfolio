import bcrypt from "bcryptjs";
import {connectDB} from "../config/database.js";
import {env} from "../config/env.js";
import {User} from "../models/User.model.js";

async function createAdminUser(): Promise<void> {
    await connectDB();
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME;
    if(!email || !password || !name){
        throw new Error("[create-admin] Missing environment variables for admin user creation");
    }
    const existingAdmin = await User.findOne({email: email.toLowerCase().trim()});
    if(existingAdmin){
        throw new Error("[create-admin] Admin user already exists");
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
        name,
        email : email.toLowerCase().trim(),
        passwordHash,
        role: "ADMIN",
        isActive: true,
    });
    console.log(`[create-admin] Admin user created: ${user.email}`);
    console.log(`[create-admin] id: ${user._id.toString()} , email : ${user.email} , name : ${user.name} , role : ${user.role}`);
    process.exit(0);
}

createAdminUser().catch((error) => {
    console.error("[create-admin] Error creating admin user:", error);
    process.exit(1);
});