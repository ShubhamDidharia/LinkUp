import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({

    from:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    to:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type:{
        type: String,
        enum: [
            "like",
            "follow",
            "comment",
            "admin_warning",
            "admin_suspend",
            "admin_content_removed",
            "post_auto_moderated",
            "reported",
            "auto_moderated_nsfw"
        ],
        required: true
    },
    read:{
        type: Boolean,
        default: false
    },
    relatedPostId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: null
    },
    reason:{
        type: String,
        default: null
    },
    message:{
        type: String,
        default: null
    },
    action:{
        type: String,
        enum: ["warn", "suspend", "delete_content", null],
        default: null
    },
    strikesCount:{
        type: Number,
        default: null
    }


},{timestamps: true});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;