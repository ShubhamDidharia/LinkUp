import express from "express";
import { protectedRoute } from "../middlewares/protectRoute.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
    getAdminStats,
    getSystemHealth,
    getSystemSettings,
    updateSystemSettings,
    getAuditLogs
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

export default router;
