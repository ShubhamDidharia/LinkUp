import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import {v2 as cloudinary} from 'cloudinary';
import Notification from '../models/notification.model.js';

export const getAllPosts = async(req, res) =>{
    try {
        //populate() is a method in Mongoose (MongoDB ODM) that replaces a 
        // referenced document’s _id with the full document data.

        // here populate() is used to populate the user object with the user's 
        // details (needed for client side for displaying username, profile image, etc.)
        // we are excluding the password field from the user object
        // we are also excluding the email, bio, link fields from the user object in comments

        // Your DB stores just the ID (efficient & normalized).
        // But your frontend needs the full user details (like username, avatar, etc.),
       // populate() helps avoid additional DB queries on the client.
       // So you just send the fully enriched response (e.g. post + user details) directly from your backend to frontend.

        const posts   = await Post.find().sort({createdAt: -1}).populate({
            path: 'user',
            select: '-password'
        }).populate({path : 'comments.user', select : "-password -email -bio -link" }) ;
        if(!posts){
            res.status(200).json({message : "no posts to fetch"});

        }
        res.status(200).json(posts);
        
    } catch (error){
        console.error("error fetching all posts" , error);
        res.status(500).json({error: "Internal server error"})
    }
}


export const createPost = async(req, res)=>{
    try {
        const {text} = req.body
        let {img} = req.body
        const userId = req.user._id // protectedRoute middleware
        
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({error: "User not found"})
        }

        if(!text && !img){
            res.status(400).json({error: "Post cannot be empty"})
        }

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({user : userId, text ,img})

        await newPost.save();
        res.status(201).json(newPost)
        

    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({error: "Internal server error"})
    }
}

export const deletePost = async(req,res)=>{
    try {
        const {id} = req.params;
        const post  = await Post.findById(id);
        if(!post){
            return res.status(404).json({error: "Post not found"});
        }

        //check if the post belongs to the user
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error: "Unauthorized access"});

        }

        //deleting image from cloudinary
        if(post.img){
            const imageId = post.img.split('/').pop().split('.')[0]; // Extract public ID from the URL
            await cloudinary.uploader.destroy(imageId); // Delete the old image from Cloudinary
        }

        await Post.findByIdAndDelete(id);
        res.status(200).json({message: "Post deleted successfully"});


    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({error: "Internal server error"})
        
    }
}

export const addComment  = async(req,res)=>{
    try {
        const {text} = req.body;
        const {id: postId}  = req.params;
        const userId = req.user._id; // protectedRoute middleware

        if(!text){
            return res.status(400).json({error : "text is required for comment"})
        }
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({error: "Post not found"});
        }

        post.comments.push({text, user: userId});
        await post.save();
        res.status(200).json(post);
        
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({error: "Internal server error"})
        
    }
}

export const likeUnlikePost = async(req,res)=>{
    try {
        const {id : postId} = req.params;
        const userId = req.user._id; // protectedRoute middleware
        
        // user who made request to like/unlike the post, shall be added to like list of post
        // send notification to owner of post about like
        const user = await User.findById(userId);
        const post  = await Post.findById(postId);
        if(!post){
            return res.status(404).json({error : "post not found"});
        }

        const isLiked = post.likes.includes(userId) ;

        if(isLiked){
            // unlike the post
            await Post.updateOne({_id : postId}, {$pull : {likes: userId}}); // post is unliked
            await User.updateOne({_id : userId}, {$pull : {likedPosts : postId}}); // removed from user's liked list

            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
            res.status(200).json(updatedLikes);
        }else{
            //like the post
            post.likes.push(userId);  
            user.likedPosts.push(postId);
            await post.save();
            await user.save();

            const updatedLikes  = post.likes;
            res.status(200).json( updatedLikes);

            //send like notification
            const newNotification = new Notification( {
                from: userId,
                to: post.user,
                type: "like"
            })
            await newNotification.save();
            res.status(200).json({message: "Post liked successfully"});
        }


        
    } catch (error) {
        console.error(" Error liking/unliking post:", error);
        res.status(500).json({error: "Internal server error"})
    }
}

export const getLikedPosts = async(req,res)=>{
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if(!user){return res.status(404).json({error: "User not found"});}

        const posts = await Post.find({likes: userId}).populate({path : "user", select : "-password"}).populate({
            path: 'comments.user',
            select: "-password -email -bio -link"
        });
        res.status(200).json(posts);
        
    } catch (error) {
        console.error("Error fetching liked posts:", error);
        res.status(500).json({error: "Internal server error"})
    }
}

export const getFollowerPosts = async(req,res)=>{
    const userId = req.user._id;
    try {
        const user = await User.findById(userId);
        if(!user){return res.status(404).json({error: "User not found"});}

        const following = user.following;
        // find posts whose owner is found in following list of user
        const feedPosts = await Post.find({user : {$in: following}}).sort({createdAt: -1}).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'comments.user',
            select: "-password -email -bio -link"
        });
        res.status(200).json(feedPosts);

   
    } catch (error) {
        console.error("Error fetching follower posts:", error);
        res.status(500).json({error: "Internal server error"})
    }
}

export const getUserPosts = async(req, res) =>{

    // Use findOne instead of find
    // - find() returns an array of documents: [ {...}, {...} ]
    // - findOne() returns a single document: { ... }
    // If we use find(), we'd need to do user[0]._id (array indexing)
    // Using findOne() makes it easier and safer to access user._id directly

    const {username} = req.params;
    const user = await User.findOne({username});
    if(!user){
        return res.status(404).json({error: "User not found"});
    }
    const posts = await Post.find({user: user._id}).populate({
        path: 'user',
        select: '-password'
    }).populate({
        path: 'comments.user',
        select: "-password"
    });
    res.status(200).json(posts);
}