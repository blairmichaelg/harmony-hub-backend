// src/routes/userRoutes.ts

import express from 'express';

import { getProfile, login, register } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', (req, res) => void register(req, res));
router.post('/login', (req, res) => void login(req, res));
router.get('/profile', protect, (req, res) => void getProfile(req, res));

export default router;
