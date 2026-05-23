import express from "express";
import { protectedRoute } from "../middlewares/protectRoute.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
    getAdminStats,
    getSystemHealth,
    getSystemSettings,
    updateSystemSettings,
    getAuditLogs,
    getRateLimitViolations,
    deleteRateLimitViolation,
    analyzeRateLimitViolationAI,
    getUsersAtRisk
} from "../controllers/admin.controller.js";

const router = express.Router();

// Apply auth and admin protections globally on admin routes
router.use(protectedRoute);
router.use(isAdmin);

router.get("/stats", getAdminStats);
router.get("/health", getSystemHealth);
router.get("/settings", getSystemSettings);
router.post("/settings", updateSystemSettings);
router.get("/activity", getAuditLogs);

// Rate-limit violation monitoring routes
router.get("/rate-limit-violations", getRateLimitViolations);
router.delete("/rate-limit-violations/:id", deleteRateLimitViolation);
router.post("/rate-limit-violations/:id/ai-analyze", analyzeRateLimitViolationAI);

// At-risk users list
router.get("/users-at-risk", getUsersAtRisk);

export default router;
