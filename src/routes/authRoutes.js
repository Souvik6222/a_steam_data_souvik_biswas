/**
 * authRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mounted at: /api/v1/auth
 *
 * Includes HEAD + OPTIONS for every path so HTTP clients and CORS preflight
 * requests are answered correctly without hitting controller logic.
 */

// Import express Router
import { Router } from 'express';
// Import auth controller endpoints
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
// Import auth token validation middleware
import authMiddleware from '../middlewares/authMiddleware.js';
// Import request body validator middleware rules
import { validateAuth } from '../middlewares/validate.js';
// Import custom HTTP methods register utility
import { addHeadOptions } from '../utils/httpMethods.js';

// Instantiate Express Router
const router = Router();

// ── Public routes ─────────────────────────────────────────────────────────────

// Declare chainable route handlers for '/register' path
router.route('/register')
  // POST requests: run validation check validateAuth first, then invoke register controller
  .post(validateAuth, register)
  // GET requests: respond with 405 Method Not Allowed since register requires POST
  .get((req, res) => {
    res.status(405).json({
      success: false,
      message: 'Method Not Allowed. To register, please send a POST request.',
      requiredFields: ['name', 'email', 'password']
    });
  });

// Declare chainable route handlers for '/login' path
router.route('/login')
  .post(login)
  // GET requests: return 405 Method Not Allowed
  .get((req, res) => {
    res.status(405).json({
      success: false,
      message: 'Method Not Allowed. To log in, please send a POST request.',
      requiredFields: ['email', 'password']
    });
  });

// Public endpoints to trigger OTP and reset password actions
router.post('/forgot-password', forgotPassword);   // POST /api/v1/auth/forgot-password
router.post('/reset-password',  resetPassword);    // POST /api/v1/auth/reset-password
router.post('/send-otp',        sendOtp);          // POST /api/v1/auth/send-otp
router.post('/verify-email',    verifyEmail);      // POST /api/v1/auth/verify-email

// ── Protected routes (require valid JWT) ──────────────────────────────────────
// These routes are authenticated individually by inserting authMiddleware directly before the controller execution
router.get('/profile',          authMiddleware, getProfile);     // GET  /api/v1/auth/profile
router.patch('/profile',        authMiddleware, updateProfile);  // PATCH /api/v1/auth/profile
router.post('/change-password', authMiddleware, changePassword); // POST /api/v1/auth/change-password

// ── HEAD + OPTIONS ────────────────────────────────────────────────────────────
// Mount custom HEAD + OPTIONS response listeners for each auth path to optimize preflight CORS handshakes
addHeadOptions(router, '/register',        'POST, HEAD, OPTIONS');
addHeadOptions(router, '/login',           'POST, HEAD, OPTIONS');
addHeadOptions(router, '/profile',         'GET, PATCH, HEAD, OPTIONS');
addHeadOptions(router, '/forgot-password', 'POST, HEAD, OPTIONS');
addHeadOptions(router, '/reset-password',  'POST, HEAD, OPTIONS');
addHeadOptions(router, '/change-password', 'POST, HEAD, OPTIONS');
addHeadOptions(router, '/send-otp',        'POST, HEAD, OPTIONS');
addHeadOptions(router, '/verify-email',    'POST, HEAD, OPTIONS');

// Export router instance
export default router;
