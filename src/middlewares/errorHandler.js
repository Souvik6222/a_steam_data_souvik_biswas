/**
 * errorHandler.js
 * ─────────────────────────────────────────────────────────────────
 * Global 4-argument error-handling middleware.
 *
 * Handled error types (checked in priority order):
 *   • AppError          → uses err.statusCode  (operational errors)
 *   • ValidationError   → 400  (Mongoose schema validation failures)
 *   • CastError         → 400  (invalid ObjectId / wrong field type)
 *   • Duplicate key     → 409  (MongoDB code 11000)
 *   • Default           → 500
 *
 * Response shape:
 *   { success: false, message: string, error?: string (dev only) }
 */

import AppError from '../utils/AppError.js';

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message   || 'Internal Server Error';

  // ── 1. AppError (known operational errors) ───────────────────────
  // Already has statusCode set — just use it directly. We still
  // fall through to check for Mongoose-specific overrides below
  // only if it isn't an AppError, so the instanceof check short-
  // circuits any mismatches with the generic status logic.
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message    = err.message;
  }

  // ── 2. Mongoose ValidationError (schema validation failures) ─────
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // ── 3. Mongoose CastError (e.g. invalid ObjectId) ─────────────────
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field "${err.path}": ${err.value}`;
  }

  // ── 4. MongoDB duplicate-key error ────────────────────────────────
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {}).join(', ');
    message = `Duplicate value for field: ${field}`;
  }

  const payload = {
    success: false,
    message,
  };

  // Expose stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    payload.error = err.stack;
  }

  res.status(statusCode).json(payload);
};

export default errorHandler;
