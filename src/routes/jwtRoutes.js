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

const router = Router();

// All routes in this file are protected by authMiddleware.
// Individual routes may additionally require a specific role via roleGuard.
router.use(authMiddleware);

// ── GET  /api/v1/jwt/profile ─────────────────────────────────────────────────
// Returns the user data decoded from the request JWT.
router.get('/profile', getProfile);

// ── GET  /api/v1/jwt/dashboard ───────────────────────────────────────────────
// Returns a dashboard snapshot with a message, user info, and server timestamp.
router.get('/dashboard', getDashboard);

// ── POST /api/v1/jwt/generate-token  (admin only) ────────────────────────────
// Body: { payload: object, expiresIn?: string }
router.post('/generate-token', roleGuard('admin'), generateToken);

// ── POST /api/v1/jwt/verify-token ────────────────────────────────────────────
// Body: { token: string }
router.post('/verify-token', verifyToken);

// ── POST /api/v1/jwt/refresh-token ───────────────────────────────────────────
// Body: { token: string, expiresIn?: string }
router.post('/refresh-token', refreshToken);

// ── DELETE /api/v1/jwt/revoke-token ──────────────────────────────────────────
// Revokes the caller's current Bearer token (adds it to the in-memory blacklist).
router.delete('/revoke-token', revokeToken);

// ── GET  /api/v1/jwt/private-games ───────────────────────────────────────────
// Auth-gated mirror of GET /api/games — supports the same query params.
router.get('/private-games', getPrivateGames);

// ── GET  /api/v1/jwt/private-analytics ───────────────────────────────────────
// Auth-gated analytics summary derived from the games collection.
router.get('/private-analytics', getPrivateAnalytics);

export default router;
