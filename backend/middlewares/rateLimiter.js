import rateLimit from "express-rate-limit";
import RateLimitViolation from "../models/RateLimitViolation.js";

// Custom handler to log violation to MongoDB and return standard 429 error response
const handleViolation = async (req, res, next, options) => {
    try {
        const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const endpoint = req.originalUrl || req.url;
        const userId = req.user ? req.user._id : null;
        
        // Extract attempted username from body (if login/signup)
        const attemptedUsername = req.body ? (req.body.username || req.body.email) : null;

        // Group multiple triggers in close proximity (5 minutes) under one violation entry
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        const existing = await RateLimitViolation.findOne({
            ip,
            endpoint,
            createdAt: { $gte: fiveMinutesAgo }
        });

        if (existing) {
            existing.violationCount += 1;
            if (userId && !existing.user) existing.user = userId;
            if (attemptedUsername && !existing.attemptedUsername) existing.attemptedUsername = attemptedUsername;
            await existing.save();
        } else {
            await RateLimitViolation.create({
                user: userId,
                ip,
                endpoint,
                attemptedUsername,
                violationCount: 1
            });
        }
    } catch (err) {
        console.error("Failed to log rate limit violation in DB:", err);
    }

    res.status(options.statusCode).json({ error: options.message });
};

// 1. General API Limiter (100 req / 15 mins)
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
    handler: handleViolation,
    standardHeaders: true,
    legacyHeaders: false,
});

// 2. Authentication Limiter (10 req / 15 mins)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
    handler: handleViolation,
    standardHeaders: true,
    legacyHeaders: false,
});

// 3. Spam / Post Creation Limiter (20 req / 15 mins)
export const spamLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Content creation limit exceeded. Please try again after 15 minutes.",
    handler: handleViolation,
    standardHeaders: true,
    legacyHeaders: false,
});

// 4. Reports Limiter (10 req / 15 mins)
export const reportsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Report submission limit exceeded. Please try again after 15 minutes.",
    handler: handleViolation,
    standardHeaders: true,
    legacyHeaders: false,
});
