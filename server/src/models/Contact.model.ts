import {Schema, model, type Document} from 'mongoose';

export const CONTACT_STATUSES = [
    "NEW",
    "READ",
    "ARCHIVED",
] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export interface IContact extends Document{
    name: string;
    email: string;
    subject: string;
    message: string;
    status : ContactStatus;
    ipHash: string;
    userAgent: string;
    createdAt: Date;
    updatedAt: Date;
};

const ContactSchema = new Schema<IContact>(
    {
        name: {type: String, required: true, trim: true, minlength: 2, maxlength: 100},
        email: {type: String, required: true, trim: true, lowercase: true, index: true},
        subject: {type: String, trim: true, maxlength: 200},
        message: {type: String, trim: true, maxlength: 5000, minlength: 10, required: true},
        status: {type: String, enum: CONTACT_STATUSES, default: "NEW", index: true},
        ipHash: {type: String, index: true},
        userAgent: {type: String, maxlength: 1000}
    },{
        timestamps: true,
});

ContactSchema.index({
    status: 1,
    createdAt: -1,
});

export const Contact = model<IContact>("Contact", ContactSchema);
