import crypto from "node:crypto";
import { Types } from "mongoose";
import { AnalyticsEvent, type AnalyticsEventType } from "../models/AnalyticsEvent.model.js";
import { Project } from "../models/Project.model.js";
import type { AnalyticsQuery, TrackEventInput } from "../schemas/analytics.schema.js";
import { env } from "../config/env.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// The date is part of the hash, so a visitor counts once per day and nothing
// stored can be used to follow them across days.
function hashVisitor(ip: string, userAgent: string): string{
    const day = new Date().toISOString().slice(0, 10);
    return crypto.createHmac("sha256", env.JWT_SECRET).update(`${day}|${ip}|${userAgent}`).digest("hex");
}

function normalizePath(path: string): string{
    const clean = (path.split(/[?#]/)[0] ?? "").replace(/\/+$/, "");
    return clean || "/";
}

export async function trackEvent(input: TrackEventInput, metadata: {ip: string; userAgent: string}){
    let project: Types.ObjectId | undefined;
    if(input.type !== "PAGE_VIEW"){
        // Drop clicks for unknown projects so made-up ids can't pollute the report.
        if(!(await Project.exists({_id: input.projectId}))) return;
        project = new Types.ObjectId(input.projectId);
    }
    await AnalyticsEvent.create({
        type: input.type,
        path: normalizePath(input.path),
        project,
        visitorHash: hashVisitor(metadata.ip, metadata.userAgent),
    });
}

function todayIn(timeZone: string){
    const parts = new Intl.DateTimeFormat("en-US", {timeZone, year: "numeric", month: "numeric", day: "numeric"}).formatToParts(new Date());
    const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
    return {year: get("year"), month: get("month"), day: get("day")};
}

// Bucket keys for the range, oldest first: one per day up to 90 days, one per month for a year.
function bucketKeys(range: AnalyticsQuery["range"], timeZone: string): string[]{
    const {year, month, day} = todayIn(timeZone);
    if(range === "365"){
        return Array.from({length: 12}, (_, i) =>
            new Date(Date.UTC(year, month - 12 + i, 1)).toISOString().slice(0, 7));
    }
    const days = Number(range);
    return Array.from({length: days}, (_, i) =>
        new Date(Date.UTC(year, month - 1, day - (days - 1 - i))).toISOString().slice(0, 10));
}

interface SummaryFacets {
    totals: {_id: AnalyticsEventType; count: number}[];
    visitors: {count: number}[];
    series: {_id: string; views: number; visitors: number}[];
    sections: {_id: string; views: number}[];
    pages: {_id: string; views: number; visitors: number}[];
    projects: {_id: Types.ObjectId; liveClicks: number; githubClicks: number}[];
}

const EMPTY_FACETS: SummaryFacets = {totals: [], visitors: [], series: [], sections: [], pages: [], projects: []};

export async function getAnalyticsSummary({range, tz}: AnalyticsQuery){
    const monthly = range === "365";
    const keys = bucketKeys(range, tz);
    // A loose lower bound so the index narrows the scan; the exact cut is on the bucket key.
    const since = new Date(Date.now() - (Number(range) + 32) * DAY_MS);
    const pageViewsOnly = {$match: {type: "PAGE_VIEW"}};

    const [facets = EMPTY_FACETS] = await AnalyticsEvent.aggregate<SummaryFacets>([
        {$match: {createdAt: {$gte: since}}},
        {$addFields: {bucket: {$dateToString: {format: monthly ? "%Y-%m" : "%Y-%m-%d", date: "$createdAt", timezone: tz}}}},
        {$match: {bucket: {$gte: keys[0]}}},
        {$facet: {
            totals: [{$group: {_id: "$type", count: {$sum: 1}}}],
            visitors: [pageViewsOnly, {$group: {_id: "$visitorHash"}}, {$count: "count"}],
            series: [
                pageViewsOnly,
                {$group: {_id: "$bucket", views: {$sum: 1}, visitors: {$addToSet: "$visitorHash"}}},
                {$project: {views: 1, visitors: {$size: "$visitors"}}},
            ],
            // First path segment: "" for the home page, "blog" for /blog and /blog/:slug, ...
            sections: [
                pageViewsOnly,
                {$group: {_id: {$arrayElemAt: [{$split: ["$path", "/"]}, 1]}, views: {$sum: 1}}},
                {$sort: {views: -1, _id: 1}},
            ],
            pages: [
                pageViewsOnly,
                {$group: {_id: "$path", views: {$sum: 1}, visitors: {$addToSet: "$visitorHash"}}},
                {$sort: {views: -1, _id: 1}},
                {$limit: 25},
                {$project: {views: 1, visitors: {$size: "$visitors"}}},
            ],
            projects: [
                {$match: {type: {$in: ["LIVE_CLICK", "GITHUB_CLICK"]}}},
                {$group: {
                    _id: "$project",
                    liveClicks: {$sum: {$cond: [{$eq: ["$type", "LIVE_CLICK"]}, 1, 0]}},
                    githubClicks: {$sum: {$cond: [{$eq: ["$type", "GITHUB_CLICK"]}, 1, 0]}},
                }},
                {$addFields: {total: {$add: ["$liveClicks", "$githubClicks"]}}},
                {$sort: {total: -1, liveClicks: -1}},
            ],
        }},
    ]);

    const totalsByType = new Map(facets.totals.map((total) => [total._id, total.count]));
    const seriesByKey = new Map(facets.series.map((point) => [point._id, point]));
    const projectDocs = await Project.find({_id: {$in: facets.projects.map((p) => p._id)}}).select("title slug").lean();
    const projectsById = new Map(projectDocs.map((project) => [project._id.toString(), project]));

    return {
        range,
        bucket: monthly ? "month" : "day",
        totals: {
            pageViews: totalsByType.get("PAGE_VIEW") ?? 0,
            visitors: facets.visitors[0]?.count ?? 0,
            liveClicks: totalsByType.get("LIVE_CLICK") ?? 0,
            githubClicks: totalsByType.get("GITHUB_CLICK") ?? 0,
        },
        series: keys.map((key) => ({
            key,
            views: seriesByKey.get(key)?.views ?? 0,
            visitors: seriesByKey.get(key)?.visitors ?? 0,
        })),
        sections: facets.sections.map((section) => ({section: section._id, views: section.views})),
        pages: facets.pages.map((page) => ({path: page._id, views: page.views, visitors: page.visitors})),
        projects: facets.projects.map((clicks) => {
            const project = projectsById.get(clicks._id.toString());
            return {
                projectId: clicks._id.toString(),
                title: project?.title ?? "Deleted project",
                slug: project?.slug ?? null,
                liveClicks: clicks.liveClicks,
                githubClicks: clicks.githubClicks,
            };
        }),
    };
}
