import {Schema , model, type Document} from "mongoose";

export const DEVICE_TYPES = ["mobile", "desktop", "tablet", "bot", "other"] as const;

export type DeviceType = (typeof DEVICE_TYPES)[number];

export interface IPageView extends Document {
    path: string;
    visitorId: string;
    sessionId?: string;
    referrer?: string;
    userAgent?: string;
    deviceType?: DeviceType;
    country?: string;
    postId?: Schema.Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

const pageViewSchema = new Schema<IPageView>({
    path : { type: String, required: true, trim: true, maxlength: 500, index: true },
    visitorId : {type: String, required: true, index: true},
    sessionId : {type: String, index: true},
    referrer : {type: String, trim: true, maxlength: 1000},
    userAgent : {type: String, trim: true, maxlength: 1000},
    deviceType : {type: String, default:"other", enum: DEVICE_TYPES},
    country : {type: String, trim: true, maxlength: 100},
    postId : {type: Schema.Types.ObjectId, ref: "Post", index: true, sparse: true},
},{
    timestamps: true
});

pageViewSchema.index({
    createdAt: -1,
});

pageViewSchema.index({
    visitorId: 1,
    createdAt: -1,
});

pageViewSchema.index({
    sessionId: 1,
    createdAt: -1,
});

pageViewSchema.index({
    path: 1,
    createdAt: -1,
});

pageViewSchema.index({
    postId: 1,
    createdAt: -1,
});

export const PageView = model<IPageView>("PageView", pageViewSchema);