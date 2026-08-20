import crypto from "node:crypto";
import { Contact } from "../models/Contact.model.js";
import { CreateContactInput } from "../schemas/contact.schema.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import { validateObjectId } from "../utils/object-id.js";

function HashIp(ip: string): string{
    return crypto.createHmac("sha256",env.JWT_SECRET).update(ip).digest("hex");
}

export async function createContact(input: CreateContactInput, metadata: {ip: string, userAgent?: string;}){
    const contact = await Contact.create({
        ...input, ipHash: HashIp(metadata.ip), userAgent: metadata.userAgent
    });
    return contact;
}

export async function getContacts(){
    return Contact.find().sort({createdAt: -1}).lean();
}

export async function getContactById(contactId: string){
    validateObjectId(contactId);
    const contact = await Contact.findById(contactId).lean();
    if(!contact){
        throw new AppError("[validation] Contact not found", 404);
    }
    return contact;
}

export async function updateContactStatus(contactId: string, status: "NEW" | "READ" | "ARCHIVED"){
    validateObjectId(contactId);
    const contact = await Contact.findById(contactId);
     if(!contact){
        throw new AppError("[validation] Contact not found", 404);
    }
    contact.status = status;
    await contact.save();
    return contact;
}