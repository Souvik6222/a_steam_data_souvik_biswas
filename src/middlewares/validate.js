/**
 * validate.js
 * ─────────────────────────────────────────────────────────────────
 * express-validator rule chains + a shared result-checker middleware.
 *
 * Usage (in a route file):
 *   import { validateGame, validateAuth } from '../middlewares/validate.js';
 *
 *   router.post('/games',    validateGame,    createGame);
 *   router.post('/register', validateAuth,    register);
 */

import { body, validationResult } from 'express-validator';

// ── Shared result checker ────────────────────────────────────────
/**
 * Must be placed as the LAST element in any validate* array.
 * Collects express-validator errors and, if any exist, responds
 * with 422 before the controller is reached.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field:   e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// ── validateGame ─────────────────────────────────────────────────
// Applied to: POST /games (create a new game)
export const validateGame = [
  body('name')
    .trim()
    .notEmpty().withMessage('Game name is required')
    .isLength({ max: 200 }).withMessage('Game name must be at most 200 characters'),

  body('appid')
    .notEmpty().withMessage('appid is required')
    .isInt({ min: 1 }).withMessage('appid must be a positive integer'),

  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage('Rating must be between 0 and 10'),

  body('genre')
    .optional()
    .isArray().withMessage('genre must be an array of strings'),

  body('developer')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Developer name must be at most 150 characters'),

  body('publisher')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Publisher name must be at most 150 characters'),

  body('releaseDate')
    .optional()
    .isISO8601().withMessage('releaseDate must be a valid ISO 8601 date'),

  handleValidationErrors,
];

// ── validateAuth ─────────────────────────────────────────────────
// Applied to: POST /register  and  POST /login
export const validateAuth = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .isLength({ max: 128 }).withMessage('Password must be at most 128 characters'),

  // username — required for register, optional for login
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username may only contain letters, numbers, and underscores'),

  handleValidationErrors,
];
