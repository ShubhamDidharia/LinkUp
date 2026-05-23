import mongoose from "mongoose";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Report from "../models/Report.js";
import SystemSetting, { getSetting } from "../models/SystemSetting.js";
import RateLimitViolation from "../models/RateLimitViolation.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// GET /api/admin/users-at-risk
export const getUsersAtRisk = async (req, res) => {
    try {
        const suspended = await User.find({ status: "suspended" })
            .select("username fullName profileImage email strikes autoFlaggedPosts createdAt status role")
            .sort({ updatedAt: -1 });

        const underReview = await User.find({ status: "under_review" })
            .select("username fullName profileImage email strikes autoFlaggedPosts createdAt status role")
            .sort({ updatedAt: -1 });

        res.status(200).json({ suspended, underReview });
    } catch (error) {
        console.error("Error in getUsersAtRisk:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
    try {
        // Users stats
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: "active" });
        const underReviewUsers = await User.countDocuments({ status: "under_review" });
        const suspendedUsers = await User.countDocuments({ status: "suspended" });

        // Posts stats
        const totalPosts = await Post.countDocuments();
        const nsfwPosts = await Post.countDocuments({ isNSFW: true });
        const autoFlaggedPosts = await Post.countDocuments({ autoFlagged: true });

        // Reports stats
        const totalReports = await Report.countDocuments();
        const pendingReports = await Report.countDocuments({ status: "pending" });
        const actionedReports = await Report.countDocuments({ status: "actioned" });
        const dismissedReports = await Report.countDocuments({ status: "dismissed" });
        const reviewedReports = await Report.countDocuments({ status: "reviewed" });

        // Report type distribution aggregation
        const rawReportTypes = await Report.aggregate([
            { $group: { _id: "$reportType", count: { $sum: 1 } } }
        ]);

        const reportTypes = {
            post: 0,
            comment: 0,
            profileImage: 0,
            coverImage: 0,
            username: 0
        };
        rawReportTypes.forEach(type => {
            if (reportTypes[type._id] !== undefined) {
                reportTypes[type._id] = type.count;
            }
        });

        // 7 days trend aggregation
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const rawTrend = await Report.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            } },
            { $sort: { _id: 1 } }
        ]);

        // Build list of last 7 days to fill in gaps with 0
        const trend = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toISOString().split("T")[0];
            const found = rawTrend.find(item => item._id === dateStr);
            trend.push({
                date: dateStr,
                count: found ? found.count : 0
            });
        }

        res.status(200).json({
            users: { total: totalUsers, active: activeUsers, underReview: underReviewUsers, suspended: suspendedUsers },
            posts: { total: totalPosts, nsfw: nsfwPosts, autoFlagged: autoFlaggedPosts },
            reports: { total: totalReports, pending: pendingReports, actioned: actionedReports, dismissed: dismissedReports, reviewed: reviewedReports },
            reportTypes,
            trend
        });
    } catch (error) {
        console.error("Error in getAdminStats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// GET /api/admin/health
export const getSystemHealth = async (req, res) => {
    try {
        const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
        const cloudinaryStatus = (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) ? "connected" : "disconnected";
        const geminiStatus = process.env.GEMINI_API_KEY ? "connected" : "disconnected";
        const activeSocketSessions = req.onlineUsers ? req.onlineUsers.size : 0;

        res.status(200).json({
            mongoStatus,
            cloudinaryStatus,
            geminiStatus,
            activeSocketSessions
        });
    } catch (error) {
        console.error("Error in getSystemHealth:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// GET /api/admin/settings
export const getSystemSettings = async (req, res) => {
    try {
        const bannedWords = await getSetting("bannedWords", ["sex", "porn", "hentai", "slur", "fuck", "bitch", "shit", "asshole"]);
        const strikeLimitReview = await getSetting("strikeLimitReview", 3);
        const strikeLimitSuspend = await getSetting("strikeLimitSuspend", 5);
        const imageModerationEnabled = await getSetting("imageModerationEnabled", true);
        const textModerationEnabled = await getSetting("textModerationEnabled", true);

        res.status(200).json({
            bannedWords,
            strikeLimitReview,
            strikeLimitSuspend,
            imageModerationEnabled,
            textModerationEnabled
        });
    } catch (error) {
        console.error("Error in getSystemSettings:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// POST /api/admin/settings
export const updateSystemSettings = async (req, res) => {
    try {
        const { bannedWords, strikeLimitReview, strikeLimitSuspend, imageModerationEnabled, textModerationEnabled } = req.body;

        if (bannedWords !== undefined) {
            await SystemSetting.findOneAndUpdate({ key: "bannedWords" }, { value: bannedWords }, { upsert: true });
        }
        if (strikeLimitReview !== undefined) {
            await SystemSetting.findOneAndUpdate({ key: "strikeLimitReview" }, { value: Number(strikeLimitReview) }, { upsert: true });
        }
        if (strikeLimitSuspend !== undefined) {
            await SystemSetting.findOneAndUpdate({ key: "strikeLimitSuspend" }, { value: Number(strikeLimitSuspend) }, { upsert: true });
        }
        if (imageModerationEnabled !== undefined) {
            await SystemSetting.findOneAndUpdate({ key: "imageModerationEnabled" }, { value: !!imageModerationEnabled }, { upsert: true });
        }
        if (textModerationEnabled !== undefined) {
            await SystemSetting.findOneAndUpdate({ key: "textModerationEnabled" }, { value: !!textModerationEnabled }, { upsert: true });
        }

        res.status(200).json({ message: "System settings updated successfully" });
    } catch (error) {
        console.error("Error in updateSystemSettings:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// GET /api/admin/activity
export const getAuditLogs = async (req, res) => {
    try {
        const logs = await Report.find({ status: { $ne: "pending" } })
            .sort({ resolvedAt: -1 })
            .limit(30)
            .populate("resolvedBy", "username profileImage")
            .populate("reportedUser", "username profileImage")
            .populate("reportedBy", "username profileImage");
        res.status(200).json(logs);
    } catch (error) {
        console.error("Error in getAuditLogs:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// GET /api/admin/rate-limit-violations
export const getRateLimitViolations = async (req, res) => {
    try {
        const violations = await RateLimitViolation.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("user", "username profileImage email status strikes role");
        res.status(200).json(violations);
    } catch (error) {
        console.error("Error in getRateLimitViolations:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// DELETE /api/admin/rate-limit-violations/:id
export const deleteRateLimitViolation = async (req, res) => {
    try {
        const { id } = req.params;
        await RateLimitViolation.findByIdAndDelete(id);
        res.status(200).json({ message: "Violation alert dismissed" });
    } catch (error) {
        console.error("Error in deleteRateLimitViolation:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// POST /api/admin/rate-limit-violations/:id/ai-analyze
export const analyzeRateLimitViolationAI = async (req, res) => {
    try {
        const { id } = req.params;
        const violation = await RateLimitViolation.findById(id)
            .populate("user", "username email status strikes role createdAt autoFlaggedPosts");

        if (!violation) {
            return res.status(404).json({ error: "Violation record not found" });
        }

        // Gather supporting signals for AI analysis
        const sameIpHistory = await RateLimitViolation.find({ ip: violation.ip }).sort({ createdAt: -1 });
        const totalViolationsFromIp = sameIpHistory.length;
        const endpointsHit = [...new Set(sameIpHistory.map(v => v.endpoint))];
        const firstSeenAt = sameIpHistory[sameIpHistory.length - 1]?.createdAt;

        let userContext = null;
        if (violation.user) {
            const u = violation.user;
            const postCount = await Post.countDocuments({ user: u._id });
            const reportCount = await Report.countDocuments({ reportedUser: u._id });
            userContext = {
                username: u.username,
                email: u.email,
                accountStatus: u.status,
                role: u.role,
                strikes: u.strikes,
                autoFlaggedPosts: u.autoFlaggedPosts,
                accountCreatedAt: u.createdAt,
                totalPosts: postCount,
                totalReportsAgainstUser: reportCount,
            };
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Gemini AI API key not configured" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

        const prompt = `You are a security analyst for a social media platform. Analyze this rate-limit violation incident and determine whether it is a BOT/automated attacker or an AUTHENTIC HUMAN user.

INCIDENT DETAILS:
- IP Address: ${violation.ip}
- Endpoint targeted: ${violation.endpoint}
- Attempted username/email: ${violation.attemptedUsername || "N/A"}
- Violation count in this session: ${violation.violationCount}
- First occurrence: ${violation.createdAt}

HISTORICAL IP BEHAVIOR:
- Total violations from this IP: ${totalViolationsFromIp}
- Unique endpoints hit from this IP: ${endpointsHit.join(", ")}
- First ever seen: ${firstSeenAt || "N/A"}

${userContext ? `LINKED USER ACCOUNT:
- Username: ${userContext.username}
- Account status: ${userContext.accountStatus}
- Strikes: ${userContext.strikes}
- Auto-flagged posts: ${userContext.autoFlaggedPosts}
- Account age: created ${userContext.accountCreatedAt}
- Total posts: ${userContext.totalPosts}
- Total reports against user: ${userContext.totalReportsAgainstUser}` : "NO LINKED USER ACCOUNT (anonymous/unauthenticated attacker)"}

Please provide a concise analysis with EXACTLY this structure:
1. VERDICT: [BOT | SUSPICIOUS | AUTHENTIC]
2. CONFIDENCE: [Low | Medium | High]
3. KEY SIGNALS: (bullet list of 3-5 observed patterns that led to this verdict)
4. RECOMMENDATION: (one clear action: Monitor / Warn / Suspend / Block IP / No action needed)`;

        let aiAnalysis = "";
        let success = false;

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                aiAnalysis = result.response.text().trim();
                success = true;
                break;
            } catch (err) {
                console.error(`[AI Rate Limit Analysis] Failed with model ${modelName}:`, err.message);
            }
        }

        if (!success) {
            return res.status(500).json({ error: "Failed to generate AI analysis. Gemini models unavailable." });
        }

        res.status(200).json({ aiAnalysis, violationId: id });
    } catch (error) {
        console.error("Error in analyzeRateLimitViolationAI:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
