/**
 * userController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Legacy user routes (pre-v1 auth). All handlers use catchAsync.
 */

import { registerUser, authenticateUser, getUserById } from '../services/userService.js';
import generateToken from '../utils/generateToken.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Please fill in all fields.', 400);
  }

  const user = await registerUser(name, email, password);

  res.status(201).json({
    _id:     user._id,
    name:    user.name,
    email:   user.email,
    isAdmin: user.isAdmin,
    token:   generateToken(user._id),
  });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please enter email and password.', 400);
  }

  const user = await authenticateUser(email, password);

  res.json({
    _id:     user._id,
    name:    user.name,
    email:   user.email,
    isAdmin: user.isAdmin,
    token:   generateToken(user._id),
  });
});

export const getProfile = catchAsync(async (req, res) => {
  const user = await getUserById(req.user._id);

  res.json({
    _id:     user._id,
    name:    user.name,
    email:   user.email,
    isAdmin: user.isAdmin,
  });
});
