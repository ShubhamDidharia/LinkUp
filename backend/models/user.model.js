import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },fullName:{
        type: String,
        required: true,
    },email:{
        type: String,
        required: true,
        unique: true,
    },password:{
        type: String,
        required: true,
        minlength: 6, // Minimum length for password
    },followers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    following:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    profileImage:{
        type:String, 
        default:""
    },coverImage:{
        type:String, 
        default:""
    },bio:{
        type: String,
        default: "",
    },link:{
        type:String,
        default:""
    },likedPosts : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    bookmarkedPosts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    hideNSFW: {
        type: Boolean,
        default: true
    },
    strikes: {
        type: Number,
        default: 0
    },
    autoFlaggedPosts: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'under_review', 'suspended'],
        default: 'active'
    },
    lastFlaggedAt: {
        type: Date
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
},{timestamps: true});

const User = mongoose.model("User", userSchema);
export default User;