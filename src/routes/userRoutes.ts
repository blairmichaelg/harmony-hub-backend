// server/routes/userRoutes.ts

import express from 'express';

import {
  getUserProfile,
  loginUser,
  refreshToken,
  registerUser,
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile);
router.post('/refresh-token', refreshToken);

export default router;
