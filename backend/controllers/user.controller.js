import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';

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
        
    } catch (error) {
        console.error("Error fetching suggested users:", error);
        res.status(500).json({error: "Internal server error"});  
    }
    
}
export const updateUserProfile = async(req,res)=>{
    try {
        
    } catch (error) {
        console.error("error updating profile : ", error);
        res.status(500).json({error: "Internal server error"});
    }
}
    