import express from 'express';
import { protectedRoute } from '../middlewares/protectRoute.js';
import { getAllNotifications, deleteNotification } from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', protectedRoute, getAllNotifications);
router.delete('/', protectedRoute, deleteNotification);

export default router;