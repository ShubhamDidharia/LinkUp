import Notification from '../models/notification.model.js';

/**
 * Create a notification and emit it via Socket.IO
 * @param {Object} params - Notification parameters
 * @param {String} params.from - User ID of sender
 * @param {String} params.to - User ID of recipient
 * @param {String} params.type - Notification type
 * @param {String} params.relatedPostId - Related post ID (optional)
 * @param {String} params.reason - Reason message (optional)
 * @param {String} params.message - Admin message (optional)
 * @param {String} params.action - Admin action type (optional)
 * @param {Number} params.strikesCount - Number of strikes (optional)
 * @param {Object} params.io - Socket.IO instance
 * @param {Map} params.onlineUsers - Map of online users
 * @returns {Promise<Object>} Created notification
 */
export const createAndEmitNotification = async (params) => {
    const {
        from,
        to,
        type,
        relatedPostId = null,
        reason = null,
        message = null,
        action = null,
        strikesCount = null,
        io,
        onlineUsers
    } = params;

    try {
        const newNotification = new Notification({
            from,
            to,
            type,
            relatedPostId,
            reason,
            message,
            action,
            strikesCount,
            read: false
        });

        await newNotification.save();

        // Populate the notification for real-time emission
        const populatedNotification = await Notification.findById(newNotification._id)
            .populate({
                path: 'from',
                select: 'username profileImage'
            })
            .populate({
                path: 'relatedPostId',
                select: 'text img'
            });

        // Emit notification via Socket.IO if user is online
        if (io && onlineUsers.has(to.toString())) {
            const userSocketId = onlineUsers.get(to.toString());
            io.to(userSocketId).emit('new_notification', {
                notification: populatedNotification,
                unreadCount: await Notification.countDocuments({to, read: false})
            });
        }

        return populatedNotification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};
