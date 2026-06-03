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

// Import custom application error class
import AppError from '../utils/AppError.js';

// Global error handler middleware.
// The 4-argument signature (err, req, res, next) tells Express that this is an error-handling middleware.
// Even if next is not explicitly called inside, it MUST be declared as the 4th parameter so Express registers it correctly.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Set default HTTP status code to 500 (Internal Server Error) if not provided by the error object
  let statusCode = err.statusCode || 500;
  // Set default message if not provided
  let message    = err.message   || 'Internal Server Error';

  // ── 1. AppError (known operational errors) ───────────────────────
  // If the error is an instance of our custom AppError, extract its status code and message.
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message    = err.message;
  }

  // ── 2. Mongoose ValidationError (schema validation failures) ─────
  // Handles errors thrown when mongoose validations fail (e.g., missing required fields, email not matching format)
  else if (err.name === 'ValidationError') {
    statusCode = 400; // Bad Request
    // Object.values(err.errors) extracts details for all validation failures, maps them to their messages, and joins them with commas
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // ── 3. Mongoose CastError (e.g. invalid ObjectId) ─────────────────
  // Handles cases where a MongoDB query receives a malformed ID (e.g., passing "123" instead of a 24-character hex ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400; // Bad Request
    message = `Invalid value for field "${err.path}": ${err.value}`;
  }

  // ── 4. MongoDB duplicate-key error ────────────────────────────────
  // MongoDB driver throws code 11000 when a unique index constraint is violated (e.g. attempting to register with an existing email)
  else if (err.code === 11000) {
    statusCode = 409; // Conflict
    // Extract the field keys causing the collision (e.g. { email: "taken@example.com" } -> "email")
    const field = Object.keys(err.keyValue || {}).join(', ');
    message = `Duplicate value for field: ${field}`;
  }

  // Build the JSON error response payload
  const payload = {
    success: false,
    message,
  };

  // Expose the raw error stack trace only if running in development mode (to help debugging)
  if (process.env.NODE_ENV === 'development') {
    payload.error = err.stack;
  }

  // Send the HTTP response with the determined status code and payload
  res.status(statusCode).json(payload);
};

// Export the errorHandler function as default
export default errorHandler;
