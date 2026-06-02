/**
 * authController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin HTTP adapter for authentication routes.
 * All handlers wrapped with catchAsync — errors reach the global handler.
 *
 * authService already throws errors with .statusCode set (via the internal
 * httpError helper), so the global errorHandler handles them correctly.
 */

import * as authService from '../services/authService.js';
import catchAsync from '../utils/catchAsync.js';

// ── Response helper ───────────────────────────────────────────────────────────

const respond = (res, statusCode, success, message, data = null) =>
  res.status(statusCode).json({ success, message, data });

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Body: { name, email, password }
 */
export const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.register(name, email, password);
  respond(res, 201, true, 'Registration successful.', result);
});

/**
 * POST /api/v1/auth/login
 * Body: { email, password }
 */
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  respond(res, 200, true, 'Login successful.', result);
});

/**
 * GET /api/v1/auth/profile
 * Protected — requires valid JWT.
 */
export const getProfile = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  respond(res, 200, true, 'Profile fetched successfully.', user);
});

/**
 * PATCH /api/v1/auth/profile
 * Protected — requires valid JWT.
 * Body: { name }
 */
export const updateProfile = catchAsync(async (req, res) => {
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
  const result = await authService.forgotPassword(email);
  respond(res, 200, true, 'Password reset token generated.', result);
});

/**
 * POST /api/v1/auth/reset-password
 * Body: { token, newPassword }
 */
export const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;
  const result = await authService.resetPassword(token, newPassword);
  respond(res, 200, true, result.message, null);
});

/**
 * POST /api/v1/auth/change-password
 * Protected — requires valid JWT.
 * Body: { oldPassword, newPassword }
 */
export const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
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
  const result = await authService.sendOtp(email);
  respond(res, 200, true, 'OTP sent successfully.', result);
});

/**
 * POST /api/v1/auth/verify-email
 * Body: { otpCode }
 */
export const verifyEmail = catchAsync(async (req, res) => {
  const { otpCode } = req.body;
  const result = await authService.verifyEmail(otpCode);
  respond(res, 200, true, result.message, null);
});
