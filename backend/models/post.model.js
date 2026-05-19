import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },text:{
        type: String,
        default: ""
    },img:{
        type: String,
        default: ""
    }, likes : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: []
        }
    ], comments :[
        {
           text: { 
            type: String,
            default: ""
           }, 
           user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
           },
           createdAt: {
            type: Date,
            default: Date.now
           }
        }
    ],
    isNSFW: {
        type: Boolean,
        default: false
    },
    autoFlagged: {
        type: Boolean,
        default: false
    },
    flagReasons: [{
        type: String
    }],
    isBlurred: {
        type: Boolean,
        default: false
    }
},{timestamps:true})

const Post = mongoose.model("Post", postSchema);
export default Post;