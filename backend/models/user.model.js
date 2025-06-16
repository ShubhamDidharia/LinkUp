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
            ref: 'User',
            // must be an object belonging to user model
            default: [] // when signing up for first time, no followers
        }
    ],following:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // must be an object belonging to user model
            default: [] // when signing up for first time, no following
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
    }
},{timestamps: true});

const User = mongoose.model("User", userSchema);
export default User;