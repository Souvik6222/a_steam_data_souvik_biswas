import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  sendOtp,
  verifyEmail,
} from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.post('/register',        register);         // POST /api/v1/auth/register
router.post('/login',           login);            // POST /api/v1/auth/login
router.post('/forgot-password', forgotPassword);   // POST /api/v1/auth/forgot-password
router.post('/reset-password',  resetPassword);    // POST /api/v1/auth/reset-password
router.post('/send-otp',        sendOtp);          // POST /api/v1/auth/send-otp
router.post('/verify-email',    verifyEmail);      // POST /api/v1/auth/verify-email

// ── Protected routes (require valid JWT) ──────────────────────────────────────
router.get('/profile',          authMiddleware, getProfile);     // GET  /api/v1/auth/profile
router.patch('/profile',        authMiddleware, updateProfile);  // PATCH /api/v1/auth/profile
router.post('/change-password', authMiddleware, changePassword); // POST /api/v1/auth/change-password

export default router;
