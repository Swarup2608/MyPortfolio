import {z} from "zod";

export const createContactSchema = z.object({
    name: z.string().trim().min(2, "[validation] Name is too short").max(100, "[validation] Name is too long"),
    email: z.string().trim().email("[validation] Invalid email address").transform((value)=>value.toLowerCase()),
    // Optional; a blank field counts as not given. Digits plus + ( ) - and spaces, 7–15 digits in total.
    phone: z.preprocess(
        (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
        z.string().trim()
            .refine((value) => {
                const digits = value.replace(/\D/g, "").length;
                return /^\+?[\d\s()-]+$/.test(value) && digits >= 7 && digits <= 15;
            }, "[validation] Invalid mobile number")
            .optional(),
    ),
    subject: z.string().trim().max(200).optional(),
    message: z.string().trim().min(10,"[validation] Message too small").max(5000,"[validation] Message too large"),
    // Honeypot: hidden from real users, so anything in it means a bot filled the form.
    website: z.string().max(500).optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
