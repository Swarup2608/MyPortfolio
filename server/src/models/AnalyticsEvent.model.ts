import {Schema, model, type Document, type Types} from 'mongoose';

export const ANALYTICS_EVENT_TYPES = [
    "PAGE_VIEW",
    "LIVE_CLICK",
    "GITHUB_CLICK",
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export interface IAnalyticsEvent extends Document{
    type: AnalyticsEventType;
    path: string;
    project?: Types.ObjectId;
    visitorHash: string;
    createdAt: Date;
};

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
    {
        type: {type: String, enum: ANALYTICS_EVENT_TYPES, required: true},
        path: {type: String, required: true, trim: true, maxlength: 300},
        // Only set for LIVE_CLICK / GITHUB_CLICK.
        project: {type: Schema.Types.ObjectId, ref: "Project"},
        visitorHash: {type: String, required: true},
    },{
        timestamps: {createdAt: true, updatedAt: false},
});

AnalyticsEventSchema.index({
    createdAt: 1,
    type: 1,
});

export const AnalyticsEvent = model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);
