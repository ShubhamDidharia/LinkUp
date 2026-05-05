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
    ]
},{timestamps: true});

const User = mongoose.model("User", userSchema);
export default User;