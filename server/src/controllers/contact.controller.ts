import type {Request, Response} from 'express';
import type { CreateContactInput } from '../schemas/contact.schema.js';
import { createContact } from '../services/contact.service.js';

const SUCCESS_MESSAGE = "[contact] Your message has been sent successfully";

export async function createContactController(_req: Request, res: Response) : Promise<void>{
    const { website, ...input } = _req.body as CreateContactInput;
    // Honeypot was filled in, so this is a bot: report success without saving anything.
    if(website){
        res.status(201).json({success: true, message: SUCCESS_MESSAGE});
        return;
    }
    const contact = await createContact(input, {ip: _req.ip  || "unknown",userAgent: _req.get("user-agent")});
    res.status(201).json({success: true, message: SUCCESS_MESSAGE,data: contact._id});
}
