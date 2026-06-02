/**
 * rateLimiter.js
 * ─────────────────────────────────────────────────────────────────
 * Three pre-configured rate-limiters using express-rate-limit:
 *
 *   generalLimiter  – 100 requests / 15 min  (apply globally)
 *   authLimiter     – 10  requests / 15 min  (login / register)
 *   adminLimiter    – 30  requests / 15 min  (admin-only routes)
 */

import rateLimit from 'express-rate-limit';

// ── Shared window duration ───────────────────────────────────────
const FIFTEEN_MINUTES = 15 * 60 * 1000; // ms

// ── General limiter (global catch-all) ──────────────────────────
export const generalLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 100,
  standardHeaders: true,   // Return rate-limit info in RateLimit-* headers
  legacyHeaders: false,     // Disable the X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests, please try again after 15 minutes.',
  },
});

// ── Auth limiter (login / register) ─────────────────────────────
export const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
});

// ── Admin limiter ─────────────────────────────────────────────────
export const adminLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many admin requests, please try again after 15 minutes.',
  },
});
