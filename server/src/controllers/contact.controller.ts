import type {Request, Response} from 'express';
import { createContact } from '../services/contact.service.js';

export async function createContactController(_req: Request, res: Response) : Promise<void>{
    const contact = await createContact(_req.body, {ip: _req.ip  || "unknown",userAgent: _req.get("user-agent")});
    res.status(201).json({success: true, message: "[contact] Your message has been sent successfully",data: contact._id});
}