import { Contact } from "../models/Contact.model.js";
import { CreateContactInput } from "../schemas/contact.schema.js";
import { AppError } from "../utils/app-error.js";
import { validateObjectId } from "../utils/object-id.js";
import { hashIp } from "../utils/hash.js";

export async function createContact(input: CreateContactInput, metadata: {ip: string, userAgent?: string;}){
    // Honeypot: real visitors never see/fill this field, so a non-empty value
    // means a bot. Return success without persisting anything, so the bot
    // gets no signal it was caught (never reveal detection).
    if(input.website){
        return null;
    }
    const {website, ...contactData} = input;
    const contact = await Contact.create({
        ...contactData, ipHash: hashIp(metadata.ip), userAgent: metadata.userAgent
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