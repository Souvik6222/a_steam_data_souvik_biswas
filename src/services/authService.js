import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

/** Sign a JWT with userId + role. */
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

/** Create a domain error with an HTTP status code attached. */
const httpError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/** Generate a cryptographically random 6-digit OTP string. */
const generateOtp = () =>
  String(crypto.randomInt(100_000, 999_999));

/** Hash a plain token for safe DB storage (SHA-256 hex). */
const hashToken = (plain) =>
  crypto.createHash('sha256').update(plain).digest('hex');

// ── Auth service functions ────────────────────────────────────────────────────

/**
 * Register a new user and return a signed JWT.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 */
export const register = async (name, email, password) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw httpError('An account with this email already exists.', 409);

  const user = await User.create({ name, email, password });
  const token = signToken(user);

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

/**
 * Login with email + password. Returns a JWT on success.
 * @param {string} email
 * @param {string} password
 */
export const login = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw httpError('Invalid email or password.', 401);

  const match = await user.comparePassword(password);
  if (!match) throw httpError('Invalid email or password.', 401);

  const token = signToken(user);
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

/**
 * Fetch the public profile of a user by ID.
 * @param {string} userId
 */
export const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpiry -otpCode -otpExpiry');
  if (!user) throw httpError('User not found.', 404);
  return user;
};

/**
 * Update name (and other safe fields) on the authenticated user's profile.
 * Password changes must use changePassword().
 * @param {string} userId
 * @param {object} data  — only `name` is allowed through this endpoint
 */
export const updateProfile = async (userId, data) => {
  const { name } = data;
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { name } },
    { new: true, runValidators: true }
  ).select('-password -resetPasswordToken -resetPasswordExpiry -otpCode -otpExpiry');
  if (!user) throw httpError('User not found.', 404);
  return user;
};

/**
 * Initiate forgot-password flow.
 * Generates a random token, stores its SHA-256 hash in DB with a 1-hour expiry.
 * In production the plain token would be emailed to the user.
 * @param {string} email
 * @returns {{ resetToken: string }} — plain token (to be sent via email in production)
 */
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw httpError('No account found with that email.', 404);

  const plainToken  = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(plainToken);

  user.resetPasswordToken  = hashedToken;
  user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  // In production: send email with link containing plainToken
  return { resetToken: plainToken };
};

/**
 * Reset password using the plain reset token received via email.
 * @param {string} token        — plain token from the email link
 * @param {string} newPassword
 */
export const resetPassword = async (token, newPassword) => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    resetPasswordToken:  hashedToken,
    resetPasswordExpiry: { $gt: new Date() },
  });
  if (!user) throw httpError('Reset token is invalid or has expired.', 400);

  user.password            = newPassword;
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  return { message: 'Password reset successfully.' };
};

/**
 * Change password for an already-authenticated user.
 * @param {string} userId
 * @param {string} oldPassword
 * @param {string} newPassword
 */
export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw httpError('User not found.', 404);

  const match = await user.comparePassword(oldPassword);
  if (!match) throw httpError('Current password is incorrect.', 401);

  if (oldPassword === newPassword)
    throw httpError('New password must differ from the current password.', 400);

  user.password = newPassword;
  await user.save();

  return { message: 'Password changed successfully.' };
};

/**
 * Send a 6-digit OTP to the given email for email verification.
 * OTP expires in 10 minutes.
 * @param {string} email
 * @returns {{ otpCode: string }} — in production this would only be emailed, not returned
 */
export const sendOtp = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw httpError('No account found with that email.', 404);
  if (user.isVerified) throw httpError('Email is already verified.', 400);

  const otp = generateOtp();

  user.otpCode   = otp;                                            // store plain (low-entropy, short-lived)
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);         // 10 minutes
  await user.save({ validateBeforeSave: false });

  // In production: send OTP via email / SMS
  return { otpCode: otp };
};

/**
 * Verify email using a 6-digit OTP code.
 * @param {string} otpCode
 */
export const verifyEmail = async (otpCode) => {
  const user = await User.findOne({
    otpCode,
    otpExpiry: { $gt: new Date() },
  });
  if (!user) throw httpError('OTP is invalid or has expired.', 400);

  user.isVerified = true;
  user.otpCode    = undefined;
  user.otpExpiry  = undefined;
  await user.save({ validateBeforeSave: false });

  return { message: 'Email verified successfully.' };
};
