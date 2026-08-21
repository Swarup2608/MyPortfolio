import crypto from "node:crypto";

import { env } from "../config/env.js";

export function hashIp(ip?: string): string | undefined {
  if (!ip) {
    return undefined;
  }

  return crypto.createHmac("sha256", env.IP_HASH_SECRET).update(ip).digest("hex");
}
