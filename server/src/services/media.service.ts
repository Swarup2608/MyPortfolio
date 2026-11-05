import { Media } from "../models/Media.model.js";
import { Post } from "../models/Post.model.js";
import { Project } from "../models/Project.model.js";
import { FILE_KEY_PATTERN } from "./storage/common.js";
import { deleteStored } from "./storage/index.js";

// Uploads are tracked so images that never make it into a saved post can be cleaned up:
//   upload        -> Media row PENDING
//   save          -> keys found in the saved content/cover become ATTACHED;
//                    keys the record used to have and no longer does are deleted
//   leave / sweep -> PENDING uploads are deleted (see deletePendingMedia / sweepPendingMedia)
// Nothing that a saved post or project still references is ever deleted.

export const PENDING_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const KEY_IN_TEXT = /\/(\d{10,}-[0-9a-f]{16}\.(?:jpg|png|webp|gif))/g;

// Storage keys referenced by a block of Markdown/text plus any explicit keys (cover image).
export function mediaKeysOf(text?: string, ...explicitKeys: Array<string | null | undefined>): Set<string> {
    const keys = new Set<string>();
    for (const match of text?.matchAll(KEY_IN_TEXT) ?? []) {
        if (match[1]) keys.add(match[1]);
    }
    for (const key of explicitKeys) {
        if (key && FILE_KEY_PATTERN.test(key)) keys.add(key);
    }
    return keys;
}

export async function trackUpload(key: string, userId: string): Promise<void> {
    await Media.create({ key, uploadedBy: userId });
}

async function isReferenced(key: string): Promise<boolean> {
    const pattern = new RegExp(key.replace(/\./g, "\\."));
    const [post, project] = await Promise.all([
        Post.exists({ $or: [{ "coverImage.key": key }, { content: pattern }] }),
        Project.exists({ $or: [{ "image.key": key }, { description: pattern }] }),
    ]);
    return Boolean(post || project);
}

async function attach(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await Media.bulkWrite(keys.map((key) => ({
        updateOne: { filter: { key }, update: { $set: { status: "ATTACHED" as const } }, upsert: true },
    })));
}

async function remove(key: string): Promise<void> {
    try {
        await deleteStored(key);
        await Media.deleteOne({ key });
    } catch (err) {
        // Keep a PENDING row so the next sweep retries instead of leaking the file forever.
        console.error(`[media] Could not delete ${key}:`, err);
        await Media.updateOne({ key }, { $set: { status: "PENDING" } }, { upsert: true }).catch(() => {});
    }
}

// Deletes the file unless a saved post/project uses it (then it is just marked ATTACHED).
async function settle(key: string): Promise<boolean> {
    if (!FILE_KEY_PATTERN.test(key)) return false;
    if (await isReferenced(key)) {
        await attach([key]);
        return false;
    }
    await remove(key);
    return true;
}

// Call after a post/project is saved (or deleted). `before` is what it referenced previously,
// `after` what it references now. Never throws: the record is already saved.
export async function syncMedia(before: Set<string>, after: Set<string>): Promise<void> {
    try {
        await attach([...after]);
        for (const key of before) {
            if (!after.has(key)) await settle(key);
        }
    } catch (err) {
        console.error("[media] Failed to sync media after save:", err);
    }
}

// An editor leaving the page asks to drop this session's uploads. Only the caller's own
// still-PENDING uploads are eligible, so a saved image can't be deleted this way.
export async function deletePendingMedia(keys: string[], userId: string): Promise<number> {
    const rows = await Media.find({ key: { $in: keys }, status: "PENDING", uploadedBy: userId }).select("key").lean();
    let deleted = 0;
    for (const row of rows) {
        if (await settle(row.key)) deleted++;
    }
    return deleted;
}

// Scheduled cleanup of uploads that were never saved into anything.
export async function sweepPendingMedia(maxAgeMs = PENDING_MAX_AGE_MS, limit = 200): Promise<number> {
    const cutoff = new Date(Date.now() - maxAgeMs);
    const rows = await Media.find({ status: "PENDING", createdAt: { $lt: cutoff } }).sort({ createdAt: 1 }).limit(limit).select("key").lean();
    let deleted = 0;
    for (const row of rows) {
        if (await settle(row.key)) deleted++;
    }
    return deleted;
}
