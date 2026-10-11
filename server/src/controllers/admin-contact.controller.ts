import type {Response} from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import type { AdminListQuery } from "../schemas/list-query.schema.js";
import { deleteContact,getContactById,getContacts,updateContactStatus } from "../services/contact.service.js";


export async function getContactsController(_req: AuthenticatedRequest, res: Response) : Promise<void>{
    const { contacts, pagination } = await getContacts(res.locals.query as AdminListQuery);
    res.status(200).json({ success: true, data: contacts, pagination });
}

export async function getContactByIdController(_req: AuthenticatedRequest & {params: {id: string}}, res: Response): Promise<void>{
    const contact = await getContactById(_req.params.id);
    res.status(200).json({success: true, data: contact});
}
export async function updateContactStatusController(_req: AuthenticatedRequest & {params: {id: string}},res: Response): Promise<void>{
    const contact = await updateContactStatus(_req.params.id,_req.body.status);
    res.status(200).json({success: true, data: contact});
}

export async function deleteContactController(_req: AuthenticatedRequest & {params: {id: string}},res: Response): Promise<void>{
    await deleteContact(_req.params.id);
    res.status(200).json({success: true, message: "[contact] Contact deleted successfully"});
}
