import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Notification from '../models/notification.model.js';
import bcrypt from 'bcryptjs';
import {v2 as cloudinary}  from 'cloudinary';
import { moderateProfile } from '../utils/profileModerator.js';
import { createAndEmitNotification } from '../lib/notificationHelper.js';

export const getUserProfile  = async(req,res)=>{

    const {username} = req.params;
    try {
        const user = await User.findOne({username: username}).select('-password -__v');
        if(!user){
            return res.status(404).json({error: "User not found"});
        }
        
        // Count all posts by this user (including NSFW)
        const postCount = await Post.countDocuments({user: user._id});
        
        // Convert user to object and add postCount
        const userWithPostCount = user.toObject();
        userWithPostCount.posts = { length: postCount };
        
        res.status(200).json(userWithPostCount);
    }catch( err) {
        console.error("Error fetching user profile:", err);
        res.status(500).json({error: "Internal server error"});
    }
}

export const followUnfollowUser = async(req,res)=>{
    try {
        const {id} = req.params; 

        //user that we want to follow/unfollow
        const userToModify = await User.findById(id);
        if(!userToModify){
            return res.status(404).json({error: "User not found"});
        }
        const currentUser = await User.findById(req.user._id); //user from the protectedRoute middleware, making follow/unfollow request
        if(!currentUser){
            return res.status(404).json({error: "Current user not found"});
        }
        if(id === currentUser._id.toString()){
            return res.status(400).json({error: "You cannot follow/unfollow yourself"});
        }

        // Check if the user is already following the target user
        const isFollowing = currentUser.following.includes(userToModify._id);
        if(isFollowing) {
            // Unfollow the user
            await User.findByIdAndUpdate(id, {$pull :{followers:currentUser._id}});
            await User.findByIdAndUpdate(req.user._id, {$pull: {following: userToModify._id}});  
            res.status(200).json({message: "Unfollowed successfully"});
        } else {
            // Follow the user
            await User.findByIdAndUpdate(id, {$push :{followers:currentUser._id}});
            await User.findByIdAndUpdate(req.user._id, {$push: {following: userToModify._id}}); 

            //send follow notification with socket.io
            try {
                await createAndEmitNotification({
                    from: currentUser._id,
                    to: userToModify._id,
                    type: "follow",
                    message: "Someone followed you",
                    io: req.io,
                    onlineUsers: req.onlineUsers
                });
            } catch (error) {
                console.error("Error sending follow notification:", error);
            }

            res.status(200).json({message: "Followed successfully"}); 

        }


    } catch (error) {
        console.error("Error following/unfollowing user:", error);
        res.status(500).json({error: "Internal server error"});
        
    }
}



export const getSuggestedUsers = async(req,res)=>{
    try {
        // dont suggest yourself and already followed users
        const userId = req.user._id; // user from the protectedRoute middleware
        const followedByMe = await User.findById(userId).select('following'); 

        const user = await User.aggregate([
            {
                $match: {
                    _id:{$ne: userId}, // Exclude the current user
                }
            },{$sample:{size:10}} // Randomly select 10 users
            
        ])

        const filteredUsers = user.filter(user => ! followedByMe.following.includes(user._id)); 
        const suggestedUsers  = filteredUsers.slice(0,4); // Limit to 4 users
        suggestedUsers.forEach(user => user.password = undefined); // Remove password field from the suggested users
        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.error("Error fetching suggested users:", error);
        res.status(500).json({error: "Internal server error"});  
    }
    
}


export const updateUserProfile = async (req, res) => {
    const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
    let { profileImage, coverImage } = req.body;

    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Please provide both current password and new password" });
        }

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters long" });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        let uploadedProfileUrl = user.profileImage;
        let uploadedCoverUrl = user.coverImage;
        let profilePublicIdToDelete = null;
        let coverPublicIdToDelete = null;

        if (profileImage) {
            const uploadedResponse = await cloudinary.uploader.upload(profileImage);
            uploadedProfileUrl = uploadedResponse.secure_url;
            profilePublicIdToDelete = uploadedResponse.public_id;
        }

        if (coverImage) {
            const uploadedResponse = await cloudinary.uploader.upload(coverImage);
            uploadedCoverUrl = uploadedResponse.secure_url;
            coverPublicIdToDelete = uploadedResponse.public_id;
        }

        // Run profile moderation
        const moderationResult = await moderateProfile({
            username: username || user.username,
            profileImageUrl: profileImage ? uploadedProfileUrl : null,
            coverImageUrl: coverImage ? uploadedCoverUrl : null
        }, user.role === 'admin');

        if (!moderationResult.allowed) {
            // Cleanup newly uploaded images from Cloudinary
            if (profilePublicIdToDelete) {
                await cloudinary.uploader.destroy(profilePublicIdToDelete);
            }
            if (coverPublicIdToDelete) {
                await cloudinary.uploader.destroy(coverPublicIdToDelete);
            }

            return res.status(400).json({
                message: 'Profile update rejected due to policy violations',
                violations: moderationResult.violations
            });
        }

        // Delete old images if new ones are successfully uploaded and allowed
        if (profileImage && user.profileImage) {
            const profilePublicId = user.profileImage.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(profilePublicId);
        }

        if (coverImage && user.coverImage) {
            const coverPublicId = user.coverImage.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(coverPublicId);
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImage = profileImage ? uploadedProfileUrl : user.profileImage;
        user.coverImage = coverImage ? uploadedCoverUrl : user.coverImage;

        user = await user.save();

        user.password = undefined;

        return res.status(200).json(user);
    } catch (error) {
        console.log("Error in updateUser: ", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const searchUsers = async(req,res)=>{
    try {
        const {query} = req.query;
        const userId = req.user._id;

        if(!query || query.trim() === ""){
            return res.status(200).json([]);
        }

        // Search for users by username or fullName
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { fullName: { $regex: query, $options: 'i' } }
            ],
            _id: { $ne: userId } // Exclude current user
        }).select('-password -email -__v').limit(10);

        res.status(200).json(users);
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({error: "Internal server error"});
    }
}

export const updateUserSettings = async(req,res)=>{
    try {
        const userId = req.user._id;
        const { hideNSFW } = req.body;

        const user = await User.findById(userId);
        if(!user) return res.status(404).json({error: "User not found"});

        if (hideNSFW !== undefined) {
            user.hideNSFW = hideNSFW;
        }

        await user.save();
        user.password = undefined;

        res.status(200).json(user);
    } catch (error) {
        console.error("Error updating user settings:", error);
        res.status(500).json({error: "Internal server error"});
    }
}
