/**
 * AppError.js
 * ─────────────────────────────────────────────────────────────────
 * Custom operational error class that carries an HTTP status code.
 *
 * Usage:
 *   import AppError from '../utils/AppError.js';
 *   throw new AppError('Game not found.', 404);
 */

class AppError extends Error {
  /**
   * @param {string} message    - Human-readable error message
   * @param {number} statusCode - HTTP status code (e.g. 400, 404, 409)
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode    = statusCode;
    this.isOperational = true; // marks this as a known/handled error
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
