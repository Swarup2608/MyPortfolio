import {Schema, model, Types, type Document} from 'mongoose';

// PENDING: uploaded in an editor but not yet referenced by a saved post/project.
// ATTACHED: referenced by saved content, so it must not be deleted automatically.
export const MEDIA_STATUSES = ["PENDING", "ATTACHED"] as const;

export type MediaStatus = (typeof MEDIA_STATUSES)[number];

export interface IMedia extends Document{
    key: string;
    status: MediaStatus;
    uploadedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const mediaSchema = new Schema<IMedia>({
    key: {type: String, required: true, unique: true, trim: true},
    status: {type: String, enum: MEDIA_STATUSES, default: "PENDING"},
    uploadedBy: {type: Schema.Types.ObjectId, ref: "User"},
}, {timestamps: true});

// The cleanup sweep looks up old pending uploads.
mediaSchema.index({status: 1, createdAt: 1});

export const Media = model<IMedia>("Media", mediaSchema);
