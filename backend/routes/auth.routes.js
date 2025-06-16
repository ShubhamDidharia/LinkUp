import express from 'express';
import { signup, login,logout,getMe } from '../controllers/auth.controller.js';
import { protectedRoute } from '../middlewares/protectRoute.js';
const router = express.Router();

router.post('/signup',signup);
router.post('/login',login);
router.post('/logout', logout);
router.get('/getMe',protectedRoute, getMe);



export default router;