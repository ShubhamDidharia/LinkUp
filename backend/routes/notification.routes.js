import express from 'express';
import { protectedRoute } from '../middlewares/protectRoute.js';
import { 
    getAllNotifications, 
    deleteAllReadNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} from '../controllers/notification.controller.js';

const router = express.Router();

// More specific routes first
router.get('/unread/count', protectedRoute, getUnreadNotificationCount);
router.put('/read/all', protectedRoute, markAllNotificationsAsRead);

// Less specific routes after
router.get('/', protectedRoute, getAllNotifications);
router.put('/:notificationId/read', protectedRoute, markNotificationAsRead);
router.delete('/:notificationId', protectedRoute, deleteNotification);
router.delete('/', protectedRoute, deleteAllReadNotifications);

export default router;