import Notification from '../models/notification.model.js';

export const getAllNotifications = async(req, res)=>{
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({to: userId}).populate({
            path: 'from',
            select: 'username profileImage'
        });

        // opening them meant reading them , thus update read status.
        await Notification.updateMany({to: userId}, {read: true});
        res.status(200).json(notifications);
        
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({error: "Internal server error"})
        
    }
}


export const deleteNotification = async(req, res)=>{
    try {
        const userId = req.user._id;
        await Notification.deleteMany({to : userId});
        res.status(200).json({message: "Notifications deleted successfully"});
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({error: "Internal server error"})
        
    }
}