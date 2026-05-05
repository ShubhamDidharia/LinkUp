import express from 'express';
import { protectedRoute } from '../middlewares/protectRoute.js';
import { getAllPosts , createPost, deletePost, addComment, likeUnlikePost, getLikedPosts , getFollowerPosts, getUserPosts, updatePost, bookmarkPost, getBookmarkedPosts } from '../controllers/post.controller.js';

const router = express.Router();

router.get('/all', protectedRoute,getAllPosts);
router.get('/bookmarked', protectedRoute, getBookmarkedPosts);
router.get('/user/:username', protectedRoute,getUserPosts);
router.post('/create', protectedRoute, createPost);
router.put('/:id', protectedRoute, updatePost);
router.post('/like/:id', protectedRoute, likeUnlikePost);
router.get('/liked/:id', protectedRoute, getLikedPosts);
router.get('/followerPosts', protectedRoute, getFollowerPosts);
router.post('/comment/:id', protectedRoute, addComment);
router.post('/bookmark/:id', protectedRoute, bookmarkPost);
router.delete('/:id', protectedRoute, deletePost);

export default router;