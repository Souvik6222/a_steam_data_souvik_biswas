import * as authService from '../services/authService.js';

// ── Response helper ───────────────────────────────────────────────────────────

const respond = (res, statusCode, success, message, data = null, error = null) =>
  res.status(statusCode).json({ success, message, data, error });

const handle = (serviceFn) => async (req, res) => {
  try {
    const data = await serviceFn(req, res);
    respond(res, data._status ?? 200, true, data._message, data._payload ?? data);
  } catch (err) {
    const status = err.statusCode ?? 500;
    respond(res, status, false, err.message, null, err.message);
  }
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Body: { name, email, password }
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    respond(res, 201, true, 'Registration successful.', result);
  } catch (err) {
    respond(res, err.statusCode ?? 500, false, err.message, null, err.message);
  }
};

/**
 * POST /api/v1/auth/login
 * Body: { email, password }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    respond(res, 200, true, 'Login successful.', result);
  } catch (err) {
    respond(res, err.statusCode ?? 500, false, err.message, null, err.message);
  }
};

/**
 * GET /api/v1/auth/profile
 * Protected — requires valid JWT.
 */
export const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    respond(res, 200, true, 'Profile fetched successfully.', user);
  } catch (err) {
    respond(res, err.statusCode ?? 500, false, err.message, null, err.message);
  }
};

/**
 * PATCH /api/v1/auth/profile
 * Protected — requires valid JWT.
 * Body: { name }
 */
export const updateProfile = async (req, res) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    respond(res, 200, true, 'Profile updated successfully.', user);
  } catch (err) {
    respond(res, err.statusCode ?? 500, false, err.message, null, err.message);
  }
};

/**
 * POST /api/v1/auth/forgot-password
 * Body: { email }
 * Returns resetToken in the response (for dev/testing).
 * In production, email the token instead.
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    respond(res, 200, true, 'Password reset token generated.', result);
  } catch (err) {
    respond(res, err.statusCode ?? 500, false, err.message, null, err.message);
  }
};

/**
 * POST /api/v1/auth/reset-password
 * Body: { token, newPassword }
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    respond(res, 200, true, result.message, null);
  } catch (err) {
    respond(res, err.statusCode ?? 500, false, err.message, null, err.message);
  }
};

/**
 * POST /api/v1/auth/change-password
 * Protected — requires valid JWT.
 * Body: { oldPassword, newPassword }
 */
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
    respond(res, 200, true, result.message, null);
  } catch (err) {
    respond(res, err.statusCode ?? 500, false, err.message, null, err.message);
  }
};

/**
 * POST /api/v1/auth/send-otp
 * Body: { email }
 * Returns otpCode in the response (for dev/testing).
 * In production, email/SMS the OTP instead.
 */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.sendOtp(email);
    respond(res, 200, true, 'OTP sent successfully.', result);
  } catch (err) {
    respond(res, err.statusCode ?? 500, false, err.message, null, err.message);
  }
};

/**
 * POST /api/v1/auth/verify-email
 * Body: { otpCode }
 */
export const verifyEmail = async (req, res) => {
  try {
    const { otpCode } = req.body;
    const result = await authService.verifyEmail(otpCode);
    respond(res, 200, true, result.message, null);
  } catch (err) {
    respond(res, err.statusCode ?? 500, false, err.message, null, err.message);
  }
};
