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
import { validateAuth } from '../middlewares/validate.js';

const router = Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.route('/register')
  .post(validateAuth, register)
  .get((req, res) => {
    res.status(405).json({
      success: false,
      message: 'Method Not Allowed. To register, please send a POST request.',
      requiredFields: ['name', 'email', 'password']
    });
  });

router.route('/login')
  .post(login)
  .get((req, res) => {
    res.status(405).json({
      success: false,
      message: 'Method Not Allowed. To log in, please send a POST request.',
      requiredFields: ['email', 'password']
    });
  });
router.post('/forgot-password', forgotPassword);   // POST /api/v1/auth/forgot-password
router.post('/reset-password',  resetPassword);    // POST /api/v1/auth/reset-password
router.post('/send-otp',        sendOtp);          // POST /api/v1/auth/send-otp
router.post('/verify-email',    verifyEmail);      // POST /api/v1/auth/verify-email

// ── Protected routes (require valid JWT) ──────────────────────────────────────
router.get('/profile',          authMiddleware, getProfile);     // GET  /api/v1/auth/profile
router.patch('/profile',        authMiddleware, updateProfile);  // PATCH /api/v1/auth/profile
router.post('/change-password', authMiddleware, changePassword); // POST /api/v1/auth/change-password

export default router;
