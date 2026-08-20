import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV : z.enum(["development","production","test"]).default("development"),
    PORT : z.coerce.number().int().positive().default(5000),
    FRONTEND_URL : z.string().url().default("http://localhost:3000"),
    MONGODB_URI : z.string().url().min(1, "[server] MONGODB_URI is required"),
    JWT_SECRET : z.string().min(32, "[server] JWT_SECRET is required"),
    JWT_EXPIRES_IN : z.string().default("8h"),
    COOKIE_SAMESITE : z.enum(["lax","strict","none"]).default("lax"),
    COOKIE_SECURE : z.coerce.boolean().default(false).transform((val) => val === true),
});

const parsedEnv = envSchema.safeParse(process.env);

if(!parsedEnv.success) {
    console.error("[server] Invalid environment variables:", parsedEnv.error.flatten().fieldErrors);
    console.error("[server] Please check your .env file and ensure all required variables are set correctly.");
    process.exit(1);
}

export const env = parsedEnv.data;