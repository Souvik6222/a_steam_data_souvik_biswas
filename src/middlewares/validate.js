/**
 * validate.js
 * ─────────────────────────────────────────────────────────────────
 * express-validator rule chains + a shared result-checker middleware.
 *
 * Usage (in a route file):
 *   import { validateGame, validateAuth, validateQueryPage, validateQueryRating } from '../middlewares/validate.js';
 *
 *   router.get('/games',    validateQueryPage,   getAllGames);
 *   router.post('/games',   validateGame,        createGame);
 *   router.post('/register', validateAuth,       register);
 */

// Import express-validator helpers:
// - body: check parameters inside request body (req.body)
// - query: check parameters inside request URL query parameters (req.query)
// - validationResult: aggregates all checking errors collected in the request
import { body, query, validationResult } from 'express-validator';

// ── Shared result checker ────────────────────────────────────────
/**
 * Must be placed as the LAST element in any validation array.
 * Collects express-validator errors and, if any exist, responds
 * with 422 Unprocessable Entity before the controller is reached.
 */
const handleValidationErrors = (req, res, next) => {
  // validationResult inspects the request object to retrieve all errors detected by previous validators in the chain
  const errors = validationResult(req);
  
  // If errors is not empty, it means one or more validation constraints failed
  if (!errors.isEmpty()) {
    // 422 Unprocessable Entity is standard for validation failures
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      // Map the errors array into a clean format containing the field name and error message
      errors: errors.array().map((e) => ({
        field:   e.path, // The request parameter name that failed validation
        message: e.msg,  // The validation error message
      })),
    });
  }
  
  // If no validation errors occurred, call next() to hand execution over to the next middleware or controller
  next();
};

// ── validateGame ─────────────────────────────────────────────────
// Validation rules applied when creating a new game (POST /games)
export const validateGame = [
  // Validate that the request body has a 'title' field
  body('title')
    .trim() // Sanitize title by removing leading/trailing spaces
    .notEmpty().withMessage('Game title is required') // Enforce non-empty string
    .isLength({ max: 200 }).withMessage('Game title must be at most 200 characters'), // Limit length to 200 chars

  // Validate that 'appid' is present and is a positive integer
  body('appid')
    .notEmpty().withMessage('appid is required') // Field is mandatory
    .isInt({ min: 1 }).withMessage('appid must be a positive integer'), // Must be >= 1

  // Validate that 'price' is a non-negative floating point number (optional field)
  body('price')
    .optional() // If the field is missing, bypass remaining checks
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),

  // Validate that 'rating' is a floating point number between 0 and 10 (optional)
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage('Rating must be between 0 and 10'),

  // Validate that 'genres' is a list of items (optional)
  body('genres')
    .optional()
    .isArray().withMessage('genres must be an array of strings'),

  // Validate that 'developer' string does not exceed 150 characters (optional)
  body('developer')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Developer name must be at most 150 characters'),

  // Validate that 'publisher' string does not exceed 150 characters (optional)
  body('publisher')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Publisher name must be at most 150 characters'),

  // Validate that 'release_date' matches standard ISO 8601 date string format (optional)
  body('release_date')
    .optional()
    .isISO8601().withMessage('release_date must be a valid ISO 8601 date'),

  // Call the validation error handler to collect any validation messages
  handleValidationErrors,
];

// ── validateAuth ─────────────────────────────────────────────────
// Validation rules applied during user registration (POST /register)
export const validateAuth = [
  // Email check
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(), // Sanitizes the email (e.g. lowercase, removes dots in Gmail usernames where applicable)

  // Password check
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .isLength({ max: 128 }).withMessage('Password must be at most 128 characters'),

  // Optional username check (used during registration or profile updates)
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
    // Regular expression: matches alphanumeric characters and underscores only
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username may only contain letters, numbers, and underscores'),

  handleValidationErrors,
];

// ── validateQueryPage ────────────────────────────────────────────
// Query validation for page number parameter (GET requests with pagination)
export const validateQueryPage = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer')
    // Sanitize by converting string value into an actual JS Number
    .toInt(),

  handleValidationErrors,
];

// ── validateQueryRating ──────────────────────────────────────────
// Query validation for rating filtering parameter (GET requests filtering by rating)
export const validateQueryRating = [
  query('rating')
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage('rating must be between 0 and 10')
    // Sanitize by converting string value into JS float
    .toFloat(),

  handleValidationErrors,
];

// ── validateQueryPagination ──────────────────────────────────────
// Combines page number and rating check in a single middleware array for game list routes
export const validateGameListQuery = [
  // Page check
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer')
    .toInt(),

  // Rating check
  query('rating')
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage('rating must be between 0 and 10')
    .toFloat(),

  handleValidationErrors,
];
