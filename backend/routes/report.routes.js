import express from "express";
import { protectedRoute } from "../middlewares/protectRoute.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
    submitReport,
    getPendingReports,
    getReportDetails,
    getUserPostsForAdmin,
    getUserCommentsForAdmin,
    resolveReport,
    getReportAISummary,
    warnUser,
    suspendUser,
    unsuspendUser
} from "../controllers/report.controller.js";

const router = express.Router();

// User routes (protected)
router.post("/", protectedRoute, submitReport);

// Admin routes (protected + admin only)
router.get("/", protectedRoute, isAdmin, getPendingReports);
router.get("/:reportId", protectedRoute, isAdmin, getReportDetails);
router.get("/user/:userId/posts", protectedRoute, isAdmin, getUserPostsForAdmin);
router.get("/user/:userId/comments", protectedRoute, isAdmin, getUserCommentsForAdmin);
router.post("/:reportId/resolve", protectedRoute, isAdmin, resolveReport);
router.post("/:reportId/ai-summary", protectedRoute, isAdmin, getReportAISummary);
router.post("/user/:userId/warn", protectedRoute, isAdmin, warnUser);
router.post("/user/:userId/suspend", protectedRoute, isAdmin, suspendUser);
router.post("/user/:userId/unsuspend", protectedRoute, isAdmin, unsuspendUser);

export default router;
