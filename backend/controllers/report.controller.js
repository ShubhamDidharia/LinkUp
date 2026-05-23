import mongoose from 'mongoose';
import Report from "../models/Report.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v2 as cloudinary } from "cloudinary";
import { createAndEmitNotification } from "../lib/notificationHelper.js";

/**
 * --- USER FACING CONTROLLERS ---
 */

// POST /api/reports
export const submitReport = async (req, res) => {
    try {
        const { reportedUser, reportType, targetId, reason } = req.body;
        const reportedBy = req.user._id;

        const validTypes = ["post", "comment", "profileImage", "coverImage", "username"];
        if (!validTypes.includes(reportType)) {
            return res.status(400).json({ error: "Invalid report type" });
        }

        if (reportedUser.toString() === reportedBy.toString()) {
            return res.status(400).json({ error: "You cannot report yourself" });
        }

        if (!reason || reason.trim() === "") {
            return res.status(400).json({ error: "Reason is required" });
        }

        // Prevent duplicate reports (same reportedBy + reportedUser + targetId)
        const duplicateQuery = {
            reportedBy,
            reportedUser,
            reportType
        };
        if (targetId) {
            duplicateQuery.targetId = targetId;
        } else {
            duplicateQuery.targetId = { $exists: false };
        }

        const existingReport = await Report.findOne(duplicateQuery);
        if (existingReport) {
            return res.status(400).json({ error: "You have already reported this." });
        }

        const report = new Report({
            reportedBy,
            reportedUser,
            reportType,
            targetId: targetId || null,
            reason,
            status: "pending"
        });

        await report.save();

        // Send notification to reported user that they were reported (without revealing who reported them)
        try {
            await createAndEmitNotification({
                from: new mongoose.Types.ObjectId("000000000000000000000001"), // System user
                to: reportedUser,
                type: "reported",
                message: `Your ${reportType} was reported by another user for: ${reason}`,
                reason: reason,
                io: req.io,
                onlineUsers: req.onlineUsers
            });
        } catch (error) {
            console.error("Error sending report notification:", error);
        }

        res.status(201).json({ message: "Report submitted successfully" });
    } catch (error) {
        console.error("Error in submitReport:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * --- ADMIN ONLY CONTROLLERS ---
 */

// GET /api/reports
export const getPendingReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const reports = await Report.find({ status: "pending" })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("reportedBy", "username profileImage")
            .populate("reportedUser", "username profileImage coverImage strikes status autoFlaggedPosts");

        res.status(200).json(reports);
    } catch (error) {
        console.error("Error in getPendingReports:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// GET /api/reports/:reportId
export const getReportDetails = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await Report.findById(reportId)
            .populate("reportedBy", "username profileImage email bio link")
            .populate("reportedUser", "username profileImage coverImage strikes status autoFlaggedPosts email bio link");

        if (!report) {
            return res.status(404).json({ error: "Report not found" });
        }

        // Contextual population of targetId
        let populatedTarget = null;
        if (report.reportType === "post" && report.targetId) {
            const post = await Post.findById(report.targetId);
            if (post) {
                populatedTarget = {
                    _id: post._id,
                    text: post.text,
                    imageUrl: post.img,
                    isNSFW: post.isNSFW,
                    autoFlagged: post.autoFlagged,
                    flagReasons: post.flagReasons,
                    createdAt: post.createdAt
                };
            }
        } else if (report.reportType === "comment" && report.targetId) {
            const post = await Post.findOne({ "comments._id": report.targetId });
            if (post) {
                const comment = post.comments.id(report.targetId);
                if (comment) {
                    populatedTarget = {
                        _id: comment._id,
                        text: comment.text,
                        createdAt: comment.createdAt || post.createdAt,
                        postId: post._id
                    };
                }
            }
        }

        const reportObj = report.toObject();
        reportObj.targetData = populatedTarget;

        res.status(200).json(reportObj);
    } catch (error) {
        console.error("Error in getReportDetails:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// GET /api/reports/user/:userId/posts
export const getUserPostsForAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });

        const mappedPosts = posts.map(post => ({
            _id: post._id,
            text: post.text,
            imageUrl: post.img,
            isNSFW: post.isNSFW,
            autoFlagged: post.autoFlagged,
            flagReasons: post.flagReasons,
            createdAt: post.createdAt
        }));

        res.status(200).json(mappedPosts);
    } catch (error) {
        console.error("Error in getUserPostsForAdmin:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// GET /api/reports/user/:userId/comments
export const getUserCommentsForAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ "comments.user": userId });

        const comments = [];
        posts.forEach(post => {
            post.comments.forEach(c => {
                if (c.user.toString() === userId.toString()) {
                    comments.push({
                        _id: c._id,
                        text: c.text,
                        createdAt: c.createdAt || post.createdAt,
                        postId: post._id
                    });
                }
            });
        });

        comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.status(200).json(comments);
    } catch (error) {
        console.error("Error in getUserCommentsForAdmin:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// POST /api/reports/:reportId/resolve
export const resolveReport = async (req, res) => {
    // Start session if we wanted transactions, but simple save is enough. 
    // Let's ensure atomicity: update the entities and perform saves.
    try {
        const { reportId } = req.params;
        const { action, adminNote } = req.body;

        const validActions = ["dismiss", "warn", "suspend", "delete_content"];
        if (!validActions.includes(action)) {
            return res.status(400).json({ error: "Invalid action" });
        }

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: "Report not found" });
        }

        const user = await User.findById(report.reportedUser);
        if (!user) {
            return res.status(404).json({ error: "Reported user not found" });
        }

        if (action === "dismiss") {
            report.status = "dismissed";
        } else if (action === "warn") {
            report.status = "actioned";
            user.strikes += 1;
            if (user.strikes >= 5) {
                user.status = "suspended";
            } else if (user.strikes >= 3) {
                user.status = "under_review";
            }

            // Send warning notification to user
            try {
                await createAndEmitNotification({
                    from: new mongoose.Types.ObjectId("000000000000000000000001"), // System user
                    to: user._id,
                    type: "admin_warning",
                    action: "warn",
                    strikesCount: user.strikes,
                    message: `You received a warning from our moderation team. You now have ${user.strikes} strike(s). Reason: ${adminNote || "Violating community guidelines"}`,
                    io: req.io,
                    onlineUsers: req.onlineUsers
                });
            } catch (error) {
                console.error("Error sending warning notification:", error);
            }
        } else if (action === "suspend") {
            report.status = "actioned";
            user.status = "suspended";

            // Send suspension notification to user
            try {
                await createAndEmitNotification({
                    from: new mongoose.Types.ObjectId("000000000000000000000001"), // System user
                    to: user._id,
                    type: "admin_suspend",
                    action: "suspend",
                    message: `Your account has been suspended due to repeated violations. Reason: ${adminNote || "Violating community guidelines"}`,
                    io: req.io,
                    onlineUsers: req.onlineUsers
                });
            } catch (error) {
                console.error("Error sending suspension notification:", error);
            }
        } else if (action === "delete_content") {
            report.status = "actioned";

            if (report.reportType === "post" && report.targetId) {
                const post = await Post.findById(report.targetId);
                if (post) {
                    if (post.img) {
                        const imageId = post.img.split("/").pop().split(".")[0];
                        await cloudinary.uploader.destroy(imageId).catch(err => console.error("Cloudinary error:", err));
                    }
                    await Post.findByIdAndDelete(report.targetId);
                }
            } else if (report.reportType === "comment" && report.targetId) {
                const post = await Post.findOne({ "comments._id": report.targetId });
                if (post) {
                    post.comments.pull(report.targetId);
                    await post.save();
                }
            } else if (report.reportType === "profileImage") {
                if (user.profileImage) {
                    const profilePublicId = user.profileImage.split("/").pop().split(".")[0];
                    await cloudinary.uploader.destroy(profilePublicId).catch(err => console.error("Cloudinary error:", err));
                }
                user.profileImage = "/avatar-placeholder.png";
            } else if (report.reportType === "coverImage") {
                if (user.coverImage) {
                    const coverPublicId = user.coverImage.split("/").pop().split(".")[0];
                    await cloudinary.uploader.destroy(coverPublicId).catch(err => console.error("Cloudinary error:", err));
                }
                user.coverImage = "";
            } else if (report.reportType === "username") {
                const suffix = user._id.toString().slice(-6);
                user.username = "user_" + suffix;
            }

            // Send content removal notification to user
            try {
                await createAndEmitNotification({
                    from: new mongoose.Types.ObjectId("000000000000000000000001"), // System user
                    to: user._id,
                    type: "admin_content_removed",
                    action: "delete_content",
                    message: `Your ${report.reportType} was removed by our moderation team. Reason: ${adminNote || "Violating community guidelines"}`,
                    io: req.io,
                    onlineUsers: req.onlineUsers
                });
            } catch (error) {
                console.error("Error sending content removal notification:", error);
            }
        }

        report.adminNote = adminNote || "";
        report.resolvedBy = req.user._id;
        report.resolvedAt = new Date();

        await user.save();
        await report.save();

        res.status(200).json({ message: "Report resolved", action });
    } catch (error) {
        console.error("Error in resolveReport:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// POST /api/reports/:reportId/ai-summary
export const getReportAISummary = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: "Report not found" });
        }

        const userId = report.reportedUser;

        // Fetch last 50 posts and 100 comments
        const posts = await Post.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
        const allPosts = await Post.find({ "comments.user": userId });

        const comments = [];
        allPosts.forEach(post => {
            post.comments.forEach(c => {
                if (c.user.toString() === userId.toString()) {
                    comments.push({
                        text: c.text,
                        createdAt: c.createdAt || post.createdAt
                    });
                }
            });
        });
        comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const limitedComments = comments.slice(0, 100);

        // Fetch all previous reports against reportedUser
        const previousReports = await Report.find({ 
            reportedUser: userId, 
            _id: { $ne: reportId } 
        }).populate("reportedBy", "username");

        const postsSummary = posts.map(p => ({ text: p.text, hasImage: !!p.img, isNSFW: p.isNSFW, autoFlagged: p.autoFlagged, flagReasons: p.flagReasons, date: p.createdAt }));
        const commentsSummary = limitedComments.map(c => ({ text: c.text, date: c.createdAt }));
        const reportsSummary = previousReports.map(r => ({ type: r.reportType, reason: r.reason, status: r.status, action: r.adminNote, date: r.createdAt }));

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Gemini AI API Key not configured" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
        let aiSummaryText = "";
        let success = false;

        const prompt = `You are a content moderation assistant. Analyze the user's content history and provide a concise summary of any patterns of violations, severity assessment, and a recommendation: dismiss / warn / suspend.

User Content History Data:
- Posts: ${JSON.stringify(postsSummary)}
- Comments: ${JSON.stringify(commentsSummary)}
- Past Reports Against User: ${JSON.stringify(reportsSummary)}

Please formulate a professional, structured, concise report summary containing:
1. Behavior Patterns (repeated offences, toxic language, spamming)
2. Severity Assessment (Low/Medium/High)
3. Direct Action Recommendation (dismiss, warn, or suspend)`;

        for (const modelName of models) {
            try {
                console.log(`[AI Report Summary] Attempting generation with model ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                aiSummaryText = result.response.text().trim();
                success = true;
                break;
            } catch (err) {
                console.error(`[AI Report Summary] Failed with model ${modelName}:`, err.message);
            }
        }

        if (!success) {
            return res.status(500).json({ error: "Failed to generate AI summary using Gemini models." });
        }

        report.aiSummary = aiSummaryText;
        await report.save();

        res.status(200).json({ aiSummary: aiSummaryText });
    } catch (error) {
        console.error("Error in getReportAISummary:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// POST /api/reports/user/:userId/warn
export const warnUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.strikes += 1;
        if (user.strikes >= 5) {
            user.status = "suspended";
        } else if (user.strikes >= 3) {
            user.status = "under_review";
        }

        await user.save();
        res.status(200).json({ message: "User warned successfully", user });
    } catch (error) {
        console.error("Error in warnUser:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// POST /api/reports/user/:userId/suspend
export const suspendUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.status = "suspended";
        await user.save();
        res.status(200).json({ message: "User suspended successfully", user });
    } catch (error) {
        console.error("Error in suspendUser:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// POST /api/reports/user/:userId/unsuspend
export const unsuspendUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.status = "active";
        user.strikes = 0; // reset strikes on unsuspend
        await user.save();
        res.status(200).json({ message: "User unsuspended successfully", user });
    } catch (error) {
        console.error("Error in unsuspendUser:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
