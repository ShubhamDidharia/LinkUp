import Notification from '../models/notification.model.js';

export const getAllNotifications = async(req, res)=>{
    try {
        const userId = req.user._id;
        const notifications = await Notification.find({to: userId})
            .populate({
                path: 'from',
                select: 'username profileImage'
            })
            .populate({
                path: 'relatedPostId',
                select: 'text img'
            })
            .sort({ createdAt: -1 });

        res.status(200).json(notifications);
        
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({error: "Internal server error"})
        
    }
}

export const getUnreadNotificationCount = async(req, res)=>{
    try {
        const userId = req.user._id;
        const unreadCount = await Notification.countDocuments({to: userId, read: false});
        res.status(200).json({ unreadCount });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({error: "Internal server error"})
    }
}

export const markNotificationAsRead = async(req, res)=>{
    try {
        const {notificationId} = req.params;
        const userId = req.user._id;

        await Notification.findByIdAndUpdate(
            notificationId,
            {read: true},
            {new: true}
        );

        res.status(200).json({message: "Notification marked as read"});
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({error: "Internal server error"})
    }
}

export const markAllNotificationsAsRead = async(req, res)=>{
    try {
        const userId = req.user._id;
        await Notification.updateMany({to: userId, read: false}, {read: true});
        res.status(200).json({message: "All notifications marked as read"});
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({error: "Internal server error"})
    }
}

export const deleteNotification = async(req, res)=>{
    try {
        const {notificationId} = req.params;
        const userId = req.user._id;
        
        await Notification.findByIdAndDelete(notificationId);
        res.status(200).json({message: "Notification deleted successfully"});
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({error: "Internal server error"})
        
    }
}

export const deleteAllReadNotifications = async(req, res)=>{
    try {
        const userId = req.user._id;
        await Notification.deleteMany({to : userId, read : true});
        res.status(200).json({message: "Read notifications deleted successfully"});
    } catch (error) {
        console.error("Error deleting notifications:", error);
        res.status(500).json({error: "Internal server error"})
        
    }
}