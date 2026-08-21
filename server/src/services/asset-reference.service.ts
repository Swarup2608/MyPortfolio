import { Post } from "../models/Post.model.js";
import { Project } from "../models/Project.model.js";

export async function isAssetReferenced(key: string): Promise<boolean> {
    const [post, project] = await Promise.all([
        Post.exists({ "coverImage.key": key }),
        Project.exists({ "image.key": key }),
    ]);

    return Boolean(post || project);
}
