import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import bcrypt from 'bcryptjs';
import {v2 as cloudinary}  from 'cloudinary';

export const getUserProfile  = async(req,res)=>{

    const {username} = req.params;
    try {
        const user = await User.findOne({username: username}).select('-password -__v');
        if(!user){
            return res.status(404).json({error: "User not found"});
        }
        res.status(200).json({message:"found the user", user});
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

            //before status 200, send notification
            const newNotification = new Notification( {
                from: currentUser._id,
                to: userToModify._id,
                type: "follow",
                read: false
            })
            await newNotification.save(); // Create a new notification

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


export const updateUserProfile = async(req,res)=>{
    const {username, fullName, email, bio, link, currentPassword, newPassword} = req.body;
    let {profileImage, coverImage} = req.body;
    const userId = req.user._id; // user from the protectedRoute middleware
    try {
        let user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        if((!currentPassword && newPassword) || (!newPassword && currentPassword)){
            return res.status(400).json({error: "Both current and new passwords must be provided or neither"});
        }

        if(currentPassword && newPassword) {
            const isMatch  = await bcrypt.compare(currentPassword, user.password);
            if(!isMatch){
                return res.status(400).json({error: "Current password is incorrect"});
            }
            if(newPassword.length < 6){
                return res.status(400).json({error: "New password must be at least 6 characters long"});
            }

            user.password =  await bcrypt.hash(newPassword, 10); // Update the password
        }

        if(profileImage){
            if(user.profileImage){
                const publicId = user.profileImage.split('/').pop().split('.')[0]; // Extract public ID from the URL
                await cloudinary.uploader.destroy(publicId); // Delete the old image from Cloudinary

            }
            // Upload the new profile image to Cloudinary
            const uploadedResponse = await cloudinary.uploader.upload(profileImage);
            profileImage = uploadedResponse.secure_url; // Get the secure URL of the uploaded image
        }
        if(coverImage){
            if(user.coverImage){
                const publicId = user.coverImage.split('/').pop().split('.')[0]; // Extract public ID from the URL
                await cloudinary.uploader.destroy(publicId); // Delete the old image from Cloudinary
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImageImage);
            coverImage = uploadedResponse.secure_url; // Get the secure URL of the uploaded image
        }

        user.fullName = fullName || user.fullName; // Update fullName if provided, otherwise keep the existing value
        user.username = username || user.username; // Update username if provided, otherwise keep the existing value
        user.email = email || user.email; // Update email if provided, otherwise keep the existing value
        user.bio = bio || user.bio; // Update bio if provided, otherwise keep the existing value
        user.link = link || user.link; // Update link if provided, otherwise keep the existing value
        user.profileImage = profileImage || user.profileImage; // Update profileImage if provided, otherwise keep the existing value
        user.coverImage = coverImage || user.coverImage; // Update coverImage if provided, otherwise keep the existing value
        await user.save(); // Save the updated user document
        user.password = undefined; // Remove password field from the response
        res.status(200).json(user); // Respond with the updated user document
        
    } catch (error) {
        console.error("error updating profile : ", error);
        res.status(500).json({error: "Internal server error"});

    }
}
    