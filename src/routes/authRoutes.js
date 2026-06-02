/**
 * authRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mounted at: /api/v1/auth
 *
 * Includes HEAD + OPTIONS for every path so HTTP clients and CORS preflight
 * requests are answered correctly without hitting controller logic.
 */

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
import { addHeadOptions } from '../utils/httpMethods.js';

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

// ── HEAD + OPTIONS ────────────────────────────────────────────────────────────
// /register  — POST to create, GET returns 405 guidance
addHeadOptions(router, '/register',        'POST, HEAD, OPTIONS');
// /login
addHeadOptions(router, '/login',           'POST, HEAD, OPTIONS');
// /profile   — GET + PATCH (auth required); HEAD mirrors GET semantics
addHeadOptions(router, '/profile',         'GET, PATCH, HEAD, OPTIONS');
// One-shot action endpoints
addHeadOptions(router, '/forgot-password', 'POST, HEAD, OPTIONS');
addHeadOptions(router, '/reset-password',  'POST, HEAD, OPTIONS');
addHeadOptions(router, '/change-password', 'POST, HEAD, OPTIONS');
addHeadOptions(router, '/send-otp',        'POST, HEAD, OPTIONS');
addHeadOptions(router, '/verify-email',    'POST, HEAD, OPTIONS');

export default router;
