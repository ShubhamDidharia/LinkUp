import mongoose from "mongoose";

const rateLimitViolationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    ip: {
        type: String,
        required: true
    },
    endpoint: {
        type: String,
        required: true
    },
    attemptedUsername: {
        type: String,
        required: false
    },
    violationCount: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const RateLimitViolation = mongoose.model("RateLimitViolation", rateLimitViolationSchema);
export default RateLimitViolation;
