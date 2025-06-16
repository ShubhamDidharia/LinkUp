import express from 'express';
import { signup, login,logout,signin } from '../controllers/auth.controller.js';
const router = express.Router();

router.post('/signup',signup);
router.post('/login',login);
router.post('/logout', logout);
router.post('/signin', signin);



export default router;