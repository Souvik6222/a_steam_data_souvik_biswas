/**
 * rateLimiter.js
 * ─────────────────────────────────────────────────────────────────
 * Three pre-configured rate-limiters using express-rate-limit:
 *
 *   generalLimiter  – 100 requests / 15 min  (apply globally)
 *   authLimiter     – 10  requests / 15 min  (login / register)
 *   adminLimiter    – 30  requests / 15 min  (admin-only routes)
 */

// Import rateLimit constructor from the express-rate-limit package
import rateLimit from 'express-rate-limit';

// ── Shared window duration ───────────────────────────────────────
// Time window defined in milliseconds (15 minutes = 15 * 60 seconds * 1000 milliseconds)
const FIFTEEN_MINUTES = 15 * 60 * 1000; // ms

// ── General limiter (global catch-all) ──────────────────────────
// Limits general API navigation to protect server resources from aggressive crawler/bots
export const generalLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES, // 15 minutes window
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,   // Return standard rate-limit info in RFC-compliant 'RateLimit-*' headers
  legacyHeaders: false,     // Disable older, non-standard 'X-RateLimit-*' headers
  message: {
    success: false,
    message: 'Too many requests, please try again after 15 minutes.',
  },
});

// ── Auth limiter (login / register) ─────────────────────────────
// Hard limit on authentication attempts to prevent brute-force attacks on user passwords
export const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES, // 15 minutes window
  max: 10, // Limit each IP to 10 authentication requests per windowMs
  standardHeaders: true, // Return rate-limit info in headers
  legacyHeaders: false, // Disable older headers
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
});

// ── Admin limiter ─────────────────────────────────────────────────
// Protects resource-heavy administrative endpoints from denial of service
export const adminLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES, // 15 minutes window
  max: 30, // Limit each IP to 30 requests per windowMs
  standardHeaders: true, // Return rate-limit info in headers
  legacyHeaders: false, // Disable older headers
  message: {
    success: false,
    message: 'Too many admin requests, please try again after 15 minutes.',
  },
});
