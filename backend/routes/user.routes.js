import express from 'express';
import { protectedRoute } from '../middlewares/protectRoute.js';

const router = express.Router();

router.get('/profile/:username',protectedRoute, getUserProfile);
router.get('/suggested/',protectedRoute, getSuggestedUsers);
router.post('/follow/:username',protectedRoute, followUser);
router.post('/update',protectedRoute, updateUserProfile);

export default router;