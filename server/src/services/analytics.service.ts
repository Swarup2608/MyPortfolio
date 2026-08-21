import {PageView} from "../models/PageViews.model.js";

import {detectDevice} from "../utils/device.js";
import type { AnalyticsEventInput } from "../schemas/analytics.schema.js";
import { Types } from "mongoose";

interface CreateAnalyticsEventOptions {
    input : AnalyticsEventInput,
    userAgent?: string,
}

const DUPLICATE_WINDOW_MS = 30*1000; // 30 minutes in milliseconds

export async function createAnalyticsEvent({input, userAgent}: CreateAnalyticsEventOptions): Promise<boolean> {

    const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);

    const existingView = await PageView.exists({
        visitorId: input.visitorId,
        path: input.path,
        createdAt: { $gte: since },
    });
    if(existingView){
        return false;
    }
    const createData: any = {
        path: input.path,
        visitorId: input.visitorId,
        sessionId: input.sessionId,
        referrer: input.referrer,
        userAgent: userAgent,
        deviceType: userAgent ? detectDevice(userAgent) : undefined,
    };
    
    if (input.postId) {
        createData.postId = new Types.ObjectId(input.postId);
    }
    
    await PageView.create(createData);
    return true;
}