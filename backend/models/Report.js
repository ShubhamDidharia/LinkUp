import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reportType: {
        type: String,
        enum: ["post", "comment", "profileImage", "coverImage", "username"],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "reviewed", "actioned", "dismissed"],
        default: "pending"
    },
    adminNote: {
        type: String,
        default: ""
    },
    aiSummary: {
        type: String,
        default: ""
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent duplicate reports (same user reporting the same item or user)
reportSchema.index({ reportedBy: 1, reportedUser: 1, targetId: 1 }, { unique: true });

const Report = mongoose.model("Report", reportSchema);
export default Report;
