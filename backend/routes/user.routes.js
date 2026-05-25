import express from 'express';
import { protectedRoute } from '../middlewares/protectRoute.js';
import { getUserProfile, followUnfollowUser, getSuggestedUsers, updateUserProfile, searchUsers, updateUserSettings, deleteOwnAccount } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/profile/:username',protectedRoute, getUserProfile);
router.get('/suggested',protectedRoute, getSuggestedUsers);
router.get('/search', protectedRoute, searchUsers);
router.post('/follow/:id',protectedRoute, followUnfollowUser);
router.post('/update',protectedRoute, updateUserProfile);
router.put('/profile', protectedRoute, updateUserProfile);
router.post('/settings', protectedRoute, updateUserSettings);
router.delete('/delete', protectedRoute, deleteOwnAccount);

export default router;