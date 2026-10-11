import crypto from "node:crypto";
import { Contact, type ContactStatus } from "../models/Contact.model.js";
import type { CreateContactInput } from "../schemas/contact.schema.js";
import type { AdminListQuery } from "../schemas/list-query.schema.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import { validateObjectId } from "../utils/object-id.js";
import { paginate } from "../utils/pagination.js";

function HashIp(ip: string): string{
    return crypto.createHmac("sha256",env.JWT_SECRET).update(ip).digest("hex");
}

export async function createContact(input: Omit<CreateContactInput, "website">, metadata: {ip: string, userAgent?: string;}){
    const contact = await Contact.create({
        ...input, ipHash: HashIp(metadata.ip), userAgent: metadata.userAgent
    });
    return contact;
}

export async function getContacts({page, limit}: AdminListQuery){
    const [contacts, total] = await Promise.all([
        Contact.find().sort({createdAt: -1}).skip((page - 1) * limit).limit(limit).lean(),
        Contact.countDocuments(),
    ]);
    return { contacts, pagination: paginate(page, limit, total) };
}

export async function getContactById(contactId: string){
    validateObjectId(contactId);
    const contact = await Contact.findById(contactId).lean();
    if(!contact){
        throw new AppError("[validation] Contact not found", 404);
    }
    return contact;
}

export async function updateContactStatus(contactId: string, status: ContactStatus){
    validateObjectId(contactId);
    const contact = await Contact.findById(contactId);
     if(!contact){
        throw new AppError("[validation] Contact not found", 404);
    }
    contact.status = status;
    await contact.save();
    return contact;
}

export async function deleteContact(contactId: string){
    validateObjectId(contactId);
    const contact = await Contact.findById(contactId);
    if(!contact){
        throw new AppError("[validation] Contact not found", 404);
    }
    await contact.deleteOne();
}
