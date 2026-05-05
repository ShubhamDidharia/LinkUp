import express from 'express';
import { protectedRoute } from '../middlewares/protectRoute.js';
import { generatePostContent } from '../controllers/ai.controller.js';

const router = express.Router();

router.post('/generate', protectedRoute, generatePostContent);

export default router;
