import {Schema, model, type Document} from 'mongoose';

export const USER_ROLES = [
    "ADMIN",
    "EDITOR",
    "VIEWER"
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: "VIEWER", required: true },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date, default: null },
},{
    timestamps: true,
});

export const User = model<IUser>('User', UserSchema);