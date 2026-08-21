import {z} from "zod";

export const createContactSchema = z.object({
    name: z.string().trim().min(2, "[validation] Name is too short"),
    email: z.string().trim().email("[validation] Invalid email address").transform((value)=>value.toLowerCase()),
    subject: z.string().trim().max(200).optional(),
    message: z.string().trim().min(10,"[validation] Message too small").max(5000,"[validation] Message too large"),
    // Honeypot: a hidden field real visitors never fill in. Kept out of the
    // Contact model — see createContact, which no-ops instead of saving when set.
    website: z.string().trim().max(200).optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;