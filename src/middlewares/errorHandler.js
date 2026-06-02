/**
 * errorHandler.js
 * ─────────────────────────────────────────────────────────────────
 * Global 4-argument error-handling middleware.
 *
 * Handled error types:
 *   • ValidationError   → 400  (Mongoose / express-validator)
 *   • CastError         → 400  (invalid ObjectId, wrong type)
 *   • Duplicate key     → 409  (MongoDB code 11000)
 *   • Default           → 500
 *
 * Response shape:
 *   { success: false, message: string, error?: string (dev only) }
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message   || 'Internal Server Error';

  // ── Mongoose ValidationError (schema validation failures) ────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Concatenate all field-level messages into one readable string
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // ── Mongoose CastError (e.g. invalid ObjectId) ───────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field "${err.path}": ${err.value}`;
  }

  // ── MongoDB duplicate-key error ──────────────────────────────────
  if (err.code === 11000) {
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
