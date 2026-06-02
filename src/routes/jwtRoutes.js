/**
 * jwtRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mounted at: /api/v1/jwt
 *
 * All routes protected by authMiddleware (applied via router.use).
 * HEAD + OPTIONS registered for every path.
 *
 * Note: HEAD on protected endpoints does NOT require auth — the preflight
 * semantics only describe method availability, not data access.
 */

import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { roleGuard } from '../middlewares/roleMiddleware.js';
import {
  getProfile,
  getDashboard,
  generateToken,
  verifyToken,
  refreshToken,
  revokeToken,
  getPrivateGames,
  getPrivateAnalytics,
} from '../controllers/jwtController.js';
import { addHeadOptions } from '../utils/httpMethods.js';

const router = Router();

// All data routes in this file are protected by authMiddleware.
router.use(authMiddleware);

// ── GET  /api/v1/jwt/profile ─────────────────────────────────────────────────
router.get('/profile', getProfile);

// ── GET  /api/v1/jwt/dashboard ───────────────────────────────────────────────
router.get('/dashboard', getDashboard);

// ── POST /api/v1/jwt/generate-token  (admin only) ────────────────────────────
router.post('/generate-token', roleGuard('admin'), generateToken);

// ── POST /api/v1/jwt/verify-token ────────────────────────────────────────────
router.post('/verify-token', verifyToken);

// ── POST /api/v1/jwt/refresh-token ───────────────────────────────────────────
router.post('/refresh-token', refreshToken);

// ── DELETE /api/v1/jwt/revoke-token ──────────────────────────────────────────
router.delete('/revoke-token', revokeToken);

// ── GET  /api/v1/jwt/private-games ───────────────────────────────────────────
router.get('/private-games', getPrivateGames);

// ── GET  /api/v1/jwt/private-analytics ───────────────────────────────────────
router.get('/private-analytics', getPrivateAnalytics);

// ── HEAD + OPTIONS ────────────────────────────────────────────────────────────
addHeadOptions(router, '/profile',          'GET, HEAD, OPTIONS');
addHeadOptions(router, '/dashboard',        'GET, HEAD, OPTIONS');
addHeadOptions(router, '/generate-token',   'POST, HEAD, OPTIONS');
addHeadOptions(router, '/verify-token',     'POST, HEAD, OPTIONS');
addHeadOptions(router, '/refresh-token',    'POST, HEAD, OPTIONS');
addHeadOptions(router, '/revoke-token',     'DELETE, HEAD, OPTIONS');
addHeadOptions(router, '/private-games',    'GET, HEAD, OPTIONS');
addHeadOptions(router, '/private-analytics','GET, HEAD, OPTIONS');

export default router;
