import "dotenv/config";
import { z } from "zod";

const R2_KEYS = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_URL"] as const;

const envSchema = z.object({
    NODE_ENV : z.enum(["development","production","test"]).default("development"),
    PORT : z.coerce.number().int().positive().default(5000),
    // Comma-separate to allow more than one origin.
    FRONTEND_URL : z.string().default("http://localhost:3000")
        .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean))
        .pipe(z.array(z.string().url()).min(1)),
    // Publicly reachable base URL of this server, used to build local-disk upload URLs.
    PUBLIC_SERVER_URL : z.string().url().default("http://localhost:5000").transform((value) => value.replace(/\/$/, "")),
    MONGODB_URI : z.string().url().min(1, "[server] MONGODB_URI is required"),
    JWT_SECRET : z.string().min(32, "[server] JWT_SECRET is required"),
    IP_HASH_SECRET : z.string().min(32, "[server] IP_HASH_SECRET is required"),
    JWT_EXPIRES_IN : z.string().default("8h"),
    COOKIE_SAMESITE : z.enum(["lax","strict","none"]).default("lax"),
    COOKIE_SECURE : z.stringbool().default(false),
    STORAGE_DRIVER : z.enum(["local","r2"]).default("local"),
    LOCAL_UPLOAD_DIR : z.string().default("uploads"),
    R2_ACCOUNT_ID : z.string().default(""),
    R2_ACCESS_KEY_ID : z.string().default(""),
    R2_SECRET_ACCESS_KEY : z.string().default(""),
    R2_BUCKET : z.string().default(""),
    R2_PUBLIC_URL : z.string().default("").transform((value) => value.replace(/\/$/, "")),
}).superRefine((env, ctx) => {
    if (env.STORAGE_DRIVER !== "r2") return;
    for (const key of R2_KEYS) {
        if (!env[key]) {
            ctx.addIssue({ code: "custom", path: [key], message: `[server] ${key} is required when STORAGE_DRIVER=r2` });
        }
    }
});

const parsedEnv = envSchema.safeParse(process.env);

if(!parsedEnv.success) {
    console.error("[server] Invalid environment variables:", parsedEnv.error.flatten().fieldErrors);
    console.error("[server] Please check your .env file and ensure all required variables are set correctly.");
    process.exit(1);
}

export const env = parsedEnv.data;
