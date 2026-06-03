/**
 * authController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin HTTP adapter for authentication routes.
 * All handlers wrapped with catchAsync — errors reach the global handler.
 *
 * authService already throws errors with .statusCode set (via the internal
 * httpError helper), so the global errorHandler handles them correctly.
 */

// Import authentication business logic functions from authService
import * as authService from '../services/authService.js';
// Import async wrapper to catch unhandled rejection errors
import catchAsync from '../utils/catchAsync.js';

// ── Response helper ───────────────────────────────────────────────────────────

/**
 * Standard utility function to structure JSON responses.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Operation status boolean
 * @param {string} message - Response message description
 * @param {any} data - Content payload (defaults to null)
 */
const respond = (res, statusCode, success, message, data = null) =>
  res.status(statusCode).json({ success, message, data });

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Body: { name, email, password }
 * Registers a new user account.
 */
export const register = catchAsync(async (req, res) => {
  // Destructure required parameters from incoming request body
  const { name, email, password } = req.body;
  // Delegate the user creation logic to authService.register()
  const result = await authService.register(name, email, password);
  // Respond with 201 Created and the registration payload (tokens/user data)
  respond(res, 201, true, 'Registration successful.', result);
});

/**
 * POST /api/v1/auth/login
 * Body: { email, password }
 * Authenticates user credentials and issues tokens.
 */
export const login = catchAsync(async (req, res) => {
  // Extract email and password from request body
  const { email, password } = req.body;
  // Verify credentials via authService.login()
  const result = await authService.login(email, password);
  // Respond with 200 OK and credentials data
  respond(res, 200, true, 'Login successful.', result);
});

/**
 * GET /api/v1/auth/profile
 * Protected — requires valid JWT.
 * Fetches user profile for the currently logged-in user.
 */
export const getProfile = catchAsync(async (req, res) => {
  // req.user.id is attached by the authMiddleware verifying the JWT
  const user = await authService.getProfile(req.user.id);
  // Respond with user details
  respond(res, 200, true, 'Profile fetched successfully.', user);
});

/**
 * PATCH /api/v1/auth/profile
 * Protected — requires valid JWT.
 * Body: { name }
 * Updates the user's name or settings.
 */
export const updateProfile = catchAsync(async (req, res) => {
  // Update user database record with fields sent in req.body
  const user = await authService.updateProfile(req.user.id, req.body);
  respond(res, 200, true, 'Profile updated successfully.', user);
});

/**
 * POST /api/v1/auth/forgot-password
 * Body: { email }
 * Returns resetToken in the response (for dev/testing).
 * In production, email the token instead.
 */
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  // Request password reset token generation
  const result = await authService.forgotPassword(email);
  // Respond with generated token link details
  respond(res, 200, true, 'Password reset token generated.', result);
});

/**
 * POST /api/v1/auth/reset-password
 * Body: { token, newPassword }
 * Overwrites user password with new credentials if resetToken is valid.
 */
export const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;
  // Apply password reset using the token
  const result = await authService.resetPassword(token, newPassword);
  respond(res, 200, true, result.message, null);
});

/**
 * POST /api/v1/auth/change-password
 * Protected — requires valid JWT.
 * Body: { oldPassword, newPassword }
 * Allows an authenticated user to change their password securely.
 */
export const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  // Change password in database
  const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
  respond(res, 200, true, result.message, null);
});

/**
 * POST /api/v1/auth/send-otp
 * Body: { email }
 * Returns otpCode in the response (for dev/testing).
 * In production, email/SMS the OTP instead.
 */
export const sendOtp = catchAsync(async (req, res) => {
  const { email } = req.body;
  // Trigger OTP code generation and storage
  const result = await authService.sendOtp(email);
  respond(res, 200, true, 'OTP sent successfully.', result);
});

/**
 * POST /api/v1/auth/verify-email
 * Body: { otpCode }
 * Verifies email ownership status using the OTP code.
 */
export const verifyEmail = catchAsync(async (req, res) => {
  const { otpCode } = req.body;
  // Check validation status of the OTP
  const result = await authService.verifyEmail(otpCode);
  respond(res, 200, true, result.message, null);
});
