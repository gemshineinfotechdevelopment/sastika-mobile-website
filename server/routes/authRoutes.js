import { Router } from 'express';
import {
  login,
  register,
  getMe,
  syncUserData,
  googleLogin,
  getGoogleAuthUrl,
  googleCallback,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);
router.put('/sync', protect, syncUserData);

// Google OAuth Endpoints
router.post('/google', googleLogin);
router.get('/google/url', getGoogleAuthUrl);
router.get('/google/callback', googleCallback);

export default router;
