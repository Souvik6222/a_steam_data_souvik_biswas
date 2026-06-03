// Import crypto library from Node.js standard library to perform cryptographic tasks (random bytes, random integers, and hashing)
import crypto from 'crypto';
// Import jsonwebtoken to create signed user tokens
import jwt from 'jsonwebtoken';
// Import Mongoose User model representing users collection
import User from '../models/User.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

// Retrieve JWT secret configuration from environment variables
const JWT_SECRET  = process.env.JWT_SECRET;
// Retrieve JWT expiration configuration, defaulting to '7d' (7 days) if undefined
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

/** 
 * Sign a JWT with userId + role.
 * Uses jwt.sign method.
 */
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

/** 
 * Create a custom operational error with an HTTP status code attached.
 * This simplifies throwing status-aware errors from the service layer directly.
 */
const httpError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/** 
 * Generate a cryptographically secure random 6-digit OTP string.
 * Uses crypto.randomInt which generates integers with cryptographic security (safe from guessing attacks).
 */
const generateOtp = () =>
  String(crypto.randomInt(100_000, 999_999));

/** 
 * Hash a plain token for safe database storage (SHA-256 hex).
 * We never store plaintext security tokens in DB to prevent leaking them in case of DB compromises.
 * Uses Node's crypto.createHash('sha256') method.
 */
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
  // Check if a user record with this email already exists (using User.findOne)
  // Email is checked in lowercase for normalization
  const existing = await User.findOne({ email: email.toLowerCase() });
  // If user is found, throw a 409 Conflict error
  if (existing) throw httpError('An account with this email already exists.', 409);

  // Create user record in DB (which triggers pre-save password hashing hook)
  const user = await User.create({ name, email, password });
  // Sign a new token for this user session
  const token = signToken(user);

  // Return the token and lightweight user detail object
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
  // Look up user by normalized lowercase email
  const user = await User.findOne({ email: email.toLowerCase() });
  // If user is not found, throw 401 Unauthorized (generic error message prevents user enumeration attacks)
  if (!user) throw httpError('Invalid email or password.', 401);

  // Invoke the comparePassword instance method defined on the Mongoose User schema to check password authenticity
  const match = await user.comparePassword(password);
  // If password check fails, throw 401 Unauthorized
  if (!match) throw httpError('Invalid email or password.', 401);

  // Generate JWT token
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
  // Look up user by ID. Use Mongoose query modifier .select() with minus flags
  // to exclude internal security fields from the database query result.
  const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpiry -otpCode -otpExpiry');
  // If user record doesn't exist, throw 404 Not Found
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
  // Use Mongoose User.findByIdAndUpdate to perform atomic update.
  // - $set: updates only fields explicitly named
  // - { new: true }: returns the document AFTER updates are applied (instead of before)
  // - { runValidators: true }: runs model field validators during the update operation
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
  // Look up user email
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw httpError('No account found with that email.', 404);

  // Generate a cryptographically secure random token (32 bytes converted to hex string)
  const plainToken  = crypto.randomBytes(32).toString('hex');
  // Hash the token so we don't save the plain string inside the database
  const hashedToken = hashToken(plainToken);

  // Set the hashed token and expiry date (1 hour from now = 60 min * 60 sec * 1000 ms) on user document
  user.resetPasswordToken  = hashedToken;
  user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); 
  
  // Save user document. disable schema validators (like required password check) during save because password isn't modified
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
  // Hash incoming plain token to search for match in database
  const hashedToken = hashToken(token);

  // Find active user document with matching resetToken and where resetPasswordExpiry is greater than ($gt) current Date
  const user = await User.findOne({
    resetPasswordToken:  hashedToken,
    resetPasswordExpiry: { $gt: new Date() },
  });
  // If no user matches (meaning token is expired or altered), return 400 Bad Request
  if (!user) throw httpError('Reset token is invalid or has expired.', 400);

  // Overwrite the password field with the new password string (triggers hashing hook on save)
  user.password            = newPassword;
  // Clear the reset password token and expiry fields from user record
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpiry = undefined;
  // Commit changes to MongoDB
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
  // Look up user document
  const user = await User.findById(userId);
  if (!user) throw httpError('User not found.', 404);

  // Verify the provided current password matches the hashed DB password
  const match = await user.comparePassword(oldPassword);
  if (!match) throw httpError('Current password is incorrect.', 401);

  // Prevent setting the new password to the exact same value as the old password
  if (oldPassword === newPassword)
    throw httpError('New password must differ from the current password.', 400);

  // Set the password field to the new password (triggers hashing pre-hook)
  user.password = newPassword;
  // Commit changes to database
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
  // Look up user
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw httpError('No account found with that email.', 404);
  // Block request if email is already verified
  if (user.isVerified) throw httpError('Email is already verified.', 400);

  // Generate 6-digit random code
  const otp = generateOtp();

  // Set OTP code and set expiry date to 10 minutes from now (10 min * 60 sec * 1000 ms)
  user.otpCode   = otp;                                            
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);         
  // Save changes
  await user.save({ validateBeforeSave: false });

  // In production: send OTP via email / SMS
  return { otpCode: otp };
};

/**
 * Verify email using a 6-digit OTP code.
 * @param {string} otpCode
 */
export const verifyEmail = async (otpCode) => {
  // Find user with matching otpCode and where otpExpiry is in the future ($gt current Date)
  const user = await User.findOne({
    otpCode,
    otpExpiry: { $gt: new Date() },
  });
  // If not found, code was wrong or expired
  if (!user) throw httpError('OTP is invalid or has expired.', 400);

  // Set isVerified flag to true
  user.isVerified = true;
  // Remove OTP fields
  user.otpCode    = undefined;
  user.otpExpiry  = undefined;
  // Save user changes
  await user.save({ validateBeforeSave: false });

  return { message: 'Email verified successfully.' };
};
