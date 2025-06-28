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
        res.status(200).json(user);
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
    const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
	let { profileImg, coverImg } = req.body;

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

		if (profileImg) {
			if (user.profileImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url;
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}

		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		user = await user.save();

		// password should be null in response
		user.password = null;

		return res.status(200).json(user);
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
}
    
