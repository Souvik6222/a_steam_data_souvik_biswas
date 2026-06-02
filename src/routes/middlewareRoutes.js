/**
 * middlewareRoutes.js
 * ─────────────────────────────────────────────────────────────────
 * Practice / demo routes that exercise every middleware layer:
 *
 *   GET  /api/v1/middleware/logger         → proves requestLogger fires
 *   GET  /api/v1/middleware/auth           → shows authLimiter in action
 *   GET  /api/v1/middleware/rate-limit     → shows generalLimiter headers
 *   GET  /api/v1/middleware/error-handler  → intentionally throws to test errorHandler
 */

import { Router } from 'express';
import { authLimiter, generalLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// ── Logger demo ──────────────────────────────────────────────────
// requestLogger is wired globally in server.js, so every hit is logged.
router.get('/logger', (req, res) => {
  res.json({
    success: true,
    message: 'requestLogger is active — check your server console for the log line.',
    hint: '[METHOD] /api/v1/middleware/logger - <timestamp> - Xms',
  });
});

// ── Auth limiter demo ────────────────────────────────────────────
// Apply authLimiter (10 req / 15 min) to this route.
router.get('/auth', authLimiter, (req, res) => {
  res.json({
    success: true,
    message: 'authLimiter is active on this route (10 req / 15 min).',
    rateLimitHeaders: {
      'RateLimit-Limit':     res.getHeader('RateLimit-Limit'),
      'RateLimit-Remaining': res.getHeader('RateLimit-Remaining'),
      'RateLimit-Reset':     res.getHeader('RateLimit-Reset'),
    },
  });
});

// ── General rate-limit demo ──────────────────────────────────────
// Apply generalLimiter (100 req / 15 min) to this route.
router.get('/rate-limit', generalLimiter, (req, res) => {
  res.json({
    success: true,
    message: 'generalLimiter is active on this route (100 req / 15 min).',
    rateLimitHeaders: {
      'RateLimit-Limit':     res.getHeader('RateLimit-Limit'),
      'RateLimit-Remaining': res.getHeader('RateLimit-Remaining'),
      'RateLimit-Reset':     res.getHeader('RateLimit-Reset'),
    },
  });
});

// ── Error handler demo ───────────────────────────────────────────
// Deliberately triggers each error type based on ?type= query param.
router.get('/error-handler', (req, res, next) => {
  const { type } = req.query;

  switch (type) {
    case 'validation': {
      // Simulate a Mongoose ValidationError
      const err = new Error('Validation failed for field: name');
      err.name = 'ValidationError';
      err.errors = {
        name: { message: 'name is required' },
      };
      return next(err);
    }

    case 'cast': {
      // Simulate a Mongoose CastError
      const err = new Error('Cast to ObjectId failed');
      err.name  = 'CastError';
      err.path  = '_id';
      err.value = 'not-a-valid-id';
      return next(err);
    }

    case 'duplicate': {
      // Simulate a MongoDB duplicate-key error
      const err  = new Error('E11000 duplicate key error');
      err.code   = 11000;
      err.keyValue = { email: 'test@example.com' };
      return next(err);
    }

    case 'custom': {
      // Custom error with explicit statusCode
      const err = new Error('Something custom went wrong');
      err.statusCode = 418; // I'm a teapot
      return next(err);
    }

    default: {
      // Default 500
      return next(new Error('Unhandled server error — default 500 path'));
    }
  }
});

export default router;
