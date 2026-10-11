import {PageView} from "../models/PageViews.model.js";
import { getPreviousPeriod } from "../utils/analytics-period.js";
import { calculateGrowth } from "../utils/growth.js";

interface AnalyticsRange{
    startDate: Date;
    endDate: Date;
}

export async function getAnalyticsOverview({startDate, endDate}: AnalyticsRange) {
    const match = {
        createdAt: {
            $gte: startDate,
            $lte: endDate,
        },
    };
    const [totalViews, uniqueVisitors, uniqueSessions] = await Promise.all([
        PageView.countDocuments(match),
        PageView.distinct("visitorId", match).then(visitors => visitors.length),
        PageView.distinct("sessionId", {...match, sessionId: {
            $exists: true,
            $ne: null,
        }}).then(sessions => sessions.length),
    ]);
    return {
        totalViews,
        uniqueVisitors,
        uniqueSessions,
    };
}

export async function getPopularPages({startDate, endDate}: AnalyticsRange, limit: number = 10) {
    return PageView.aggregate([
        {
            $match : {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        },
        {
            $group : {
                _id: "$path",
                views: { $sum: 1 },
                uniqueVisitors: { $addToSet: "$visitorId" },
            },
        },
        {
            $project : {
                _id: 0,
                path: "$_id",
                views: 1,
                uniqueVisitors: { $size: "$uniqueVisitors" },
            },
        },
        {
            $sort : { views: -1 },
        },
        {
            $limit : limit,
        }
    ]);
}

export async function getDeviceBreakdown({startDate, endDate}: AnalyticsRange) {
    return PageView.aggregate([
        {
            $match : {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        },
        {
            $group : {
                _id: "$deviceType",
                views: { $sum: 1 },
            },
        },
        {
            $project : {
                _id: 0,
                deviceType: "$_id",
                views: 1,
            },
        },
        {
            $sort : { views: -1 },
        }
    ]);
}

export async function getDailyAnalytics({startDate, endDate}: AnalyticsRange) {
    return PageView.aggregate([
        {
            $match : {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        },
        {
            $group : {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                views: { $sum: 1 },
                visitors: { $addToSet: "$visitorId" },
            },
        },
        {
            $project : {
                _id: 0,
                date: "$_id",
                views: 1,
                uniqueVisitors: { $size: "$visitors" },
            },
        },
        {
            $sort : { date: 1 },
        }
    ]);
}

export async function getPopularPosts({
    startDate, endDate, limit = 10
} : AnalyticsRange & {limit?: number}) {
    return PageView.aggregate([
        {
            $match : {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
                postId: { $exists: true, $ne: null },
            },
        },
        {
            $group : {
                _id: "$postId",
                views: { $sum: 1 },
                uniqueVisitors: { $addToSet: "$visitorId" },
            },
        },
        {
            $lookup:{
                from: "posts",
                localField: "_id",
                foreignField: "_id",
                as: "post",
            },
        },
        {
            $unwind: "$post",
        },
        {
            // Views can outlive a post's publish state (unpublished/archived,
            // or deleted-and-recreated slug) — keep analytics scoped to what's
            // actually live rather than leaking draft/archived titles.
            $match: {
                "post.status": "PUBLISHED",
            },
        },
        {
            $project : {
                _id: 0,
                postId: "$_id",
                title: "$post.title",
                views: 1,
                uniqueVisitors: { $size: "$uniqueVisitors" },
            },
        },
        {
            $sort : { views: -1 },
        },
        {
            $limit : limit,
        }
    ]);
}

export async function getTopReferrers({startDate, endDate}: AnalyticsRange, limit: number = 10) {
    return PageView.aggregate([
        {
            $match : {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
                referrer: { $exists: true, $nin: ["",null] },
            },
        },
        {
            $group : {
                _id: "$referrer",
                views: { $sum: 1 },
            },
        },
        {
            $project : {
                _id: 0,
                referrer: "$_id",
                views: 1,
            },
        },
        {
            $sort : { views: -1 },
        },
        {
            $limit : limit,
        }
    ]);
}

export async function getAveragePagesPerSession({startDate, endDate}: AnalyticsRange) {
    const sessions = await PageView.aggregate([
        {
            $match : {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
                sessionId: { $exists: true, $ne: null },
            },
        },
        {
            $group : {
                _id: "$sessionId",
                pages: { $sum: 1 },
            },
        },
        {
            $group : {
                _id: null,
                totalPages: { $avg: "$pages" },
                sessions: { $sum: 1 },
            },
        },
        {
            $project : {
                _id: 0,
                averagePages: {
                    $cond: {
                        if: { $eq: ["$sessions", 0] },
                        then: 0,
                        else: { $divide: ["$totalPages", "$sessions"] },
                    }
                }
            }
        }
    ]);
    return sessions.length > 0 ? sessions[0].averagePages : 0;
}

export async function getBounceRate({startDate, endDate}: AnalyticsRange) {
    const sessions = await PageView.aggregate([
        {
            $match : {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
                sessionId: { $exists: true, $ne: null },
            },
        },
        {
            $group : {
                _id: "$sessionId",
                pages: { $sum: 1 },
            },
        },
        {
            $group : {
                _id: null,
                bounces: { $sum: { $cond: [{ $eq: ["$pages", 1] }, 1, 0] } },
                sessions: { $sum: 1 },
            },
        },
        {
            $project : {
                _id: 0,
                bounceRate: {
                    $cond: {
                        if: { $eq: ["$sessions", 0] },
                        then: 0,
                        else: { $multiply: [{ $divide: ["$bounces", "$sessions"] }, 100] },
                    }
                }
            }
        }
    ]);
    return sessions.length > 0 ? sessions[0].bounceRate : 0;
}

export async function getAnalyticsDashboardData(currentRange : AnalyticsRange, ) {
    const previousRange = getPreviousPeriod(currentRange);
    const [currentOverview, previousOverview, averagePagesPerSession, bounceRate, daily, devices, popularPages, popularPosts, referrers] = await Promise.all([
        getAnalyticsOverview(currentRange),
        getAnalyticsOverview(previousRange),
        getAveragePagesPerSession(currentRange),
        getBounceRate(currentRange),
        getDailyAnalytics(currentRange),
        getDeviceBreakdown(currentRange),
        getPopularPages(currentRange),
        getPopularPosts(currentRange),
        getTopReferrers(currentRange)
    ]);
    return {
        overview: {
            totalViews: {
                value : currentOverview.totalViews,
                growth : calculateGrowth(currentOverview.totalViews, previousOverview.totalViews)
            },
            uniqueVisitors: {
                value : currentOverview.uniqueVisitors,
                growth : calculateGrowth(currentOverview.uniqueVisitors, previousOverview.uniqueVisitors)
            },
            uniqueSessions: {
                value : currentOverview.uniqueSessions,
                growth : calculateGrowth(currentOverview.uniqueSessions, previousOverview.uniqueSessions)
            },
            averagePagesPerSession: averagePagesPerSession,
            bounceRate: bounceRate,
        },
        daily,
        devices,
        popularPages,
        popularPosts,
        referrers
    };
}