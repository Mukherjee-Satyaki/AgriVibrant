import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user info (protected route)
router.get('/me', authenticate, getCurrentUser);

export default router;