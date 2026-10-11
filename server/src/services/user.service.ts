import bcrypt from "bcryptjs";
import  mongoose from "mongoose";
import { User, type UserRole } from "../models/User.model.js";
import type {UpdateUserInput} from '../schemas/user-update.schema.js';
import type { UpdateUserStatusInput } from "../schemas/user-status.schema.js";
import  type {UpdateUserPasswordInput} from  "../schemas/user-password.schema.js";
import { validateObjectId } from "../utils/object-id.js";
import { CreateUserInput } from "../schemas/user.schema.js";
import { AppError } from "../utils/app-error.js";

const BCRYPT_ROUNDS = 12;

function sanitizeUser(user : {_id: mongoose.Types.ObjectId,name: string, email: string, role: UserRole, isActive: boolean,lastLoginAt?: Date, createdAt: Date, updatedAt: Date }){
    return {
        _id: user._id.toString(),
        name: user.name,
        email : user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }
}

export async function listUsers(){
    return (await User.find().sort({createdAt:-1}).lean()).map(sanitizeUser);
}

export async function getUserById(userId: string){
    validateObjectId(userId);
    const user = await User.findById(userId).lean();
    if(!user){
        return null;
    }
    return sanitizeUser(user);
}

export async function createUser(input : CreateUserInput){
    const existingUser = await User.findOne({email: input.email});
    if(existingUser){
        throw new AppError("[user] Already user with email exists",409);
    }
    const passwordHash = await bcrypt.hash(input.password,BCRYPT_ROUNDS);
    const user = await User.create({
        name: input.name,
        email: input.email,
        role: input.role,
        isActive: true,
        passwordHash: passwordHash
    });
    return sanitizeUser(user);
}

export async function updateUser(userId: string, input: UpdateUserInput){
    validateObjectId(userId);
    if(input.email){
        const exisitingUser = await User.findOne({email: input.email, _id: {$ne: userId}});
        if(exisitingUser){
            throw new Error("USER_ALREADY_EXISTS");
        }
    }
    const user = await User.findByIdAndUpdate(userId, {$set: input},{new: true, runValidators: true});
    if(!user){
        return null;
    }
    return sanitizeUser(user);
}

export async function updateUserStatus(userId: string, input: UpdateUserStatusInput){
    validateObjectId(userId);
    const user = await User.findByIdAndUpdate(userId, {$set: {isActive : input.isActive}},{new: true, runValidators: true}).lean();
    if(!user){
        return null;
    }
    return sanitizeUser(user);
}

export async function updateUserPassword(userId: string, input: UpdateUserPasswordInput){
    validateObjectId(userId);
    const passwordHash = await bcrypt.hash(input.password,BCRYPT_ROUNDS);
    const user = await User.findByIdAndUpdate(userId, {$set: {passwordHash}},{new: true}).lean();
    if(!user){
        return null;
    }
    return sanitizeUser(user);
}

// Counts currently-active ADMINs, optionally excluding one user (the target
// of a deactivate/delete action) so callers can check "would this leave zero".
export async function countActiveAdmins(excludeUserId?: string){
    if(excludeUserId){
        validateObjectId(excludeUserId);
    }
    const filter: Record<string, unknown> = { role: "ADMIN", isActive: true };
    if(excludeUserId){
        filter._id = { $ne: excludeUserId };
    }
    return User.countDocuments(filter);
}

export async function deleteUser(userId: string){
    validateObjectId(userId);
    const user = await User.findByIdAndDelete(userId).lean();
    if(!user){
        return null;
    }
    return sanitizeUser(user);
}