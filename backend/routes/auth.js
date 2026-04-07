import express from 'express';
import { login, register, createUser, getMe } from '../controllers/authController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/create-user', protect, restrictTo('admin'), createUser);
router.get('/me', protect, getMe);

export default router;