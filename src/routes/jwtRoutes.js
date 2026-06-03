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

// Import the Router constructor from Express framework to declare isolated route modules
import { Router } from 'express';
// Import auth authentication middleware
import authMiddleware from '../middlewares/authMiddleware.js';
// Import role guarding middleware factory
import { roleGuard } from '../middlewares/roleMiddleware.js';
// Import controller handler methods
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
// Import helper to bind HEAD and OPTIONS HTTP methods automatically
import { addHeadOptions } from '../utils/httpMethods.js';

// Create a new router instance
const router = Router();

// Apply authMiddleware globally to all endpoints declared below this statement in this router.
// When requests hit this router, they must first pass JWT verification, otherwise they are rejected.
router.use(authMiddleware);

// ── GET  /api/v1/jwt/profile ─────────────────────────────────────────────────
// Maps GET requests on '/profile' path to the getProfile controller
router.get('/profile', getProfile);

// ── GET  /api/v1/jwt/dashboard ───────────────────────────────────────────────
// Maps GET requests on '/dashboard' path to getDashboard controller
router.get('/dashboard', getDashboard);

// ── POST /api/v1/jwt/generate-token  (admin only) ────────────────────────────
// First checks auth (via router.use), then checks if role is 'admin' using roleGuard('admin'), then invokes controller
router.post('/generate-token', roleGuard('admin'), generateToken);

// ── POST /api/v1/jwt/verify-token ────────────────────────────────────────────
// Maps POST requests on '/verify-token' to verifyToken controller
router.post('/verify-token', verifyToken);

// ── POST /api/v1/jwt/refresh-token ───────────────────────────────────────────
// Maps POST requests on '/refresh-token' to refreshToken controller
router.post('/refresh-token', refreshToken);

// ── DELETE /api/v1/jwt/revoke-token ──────────────────────────────────────────
// Maps DELETE requests on '/revoke-token' to revokeToken controller
router.delete('/revoke-token', revokeToken);

// ── GET  /api/v1/jwt/private-games ───────────────────────────────────────────
// Maps GET requests on '/private-games' to getPrivateGames controller
router.get('/private-games', getPrivateGames);

// ── GET  /api/v1/jwt/private-analytics ───────────────────────────────────────
// Maps GET requests on '/private-analytics' to getPrivateAnalytics controller
router.get('/private-analytics', getPrivateAnalytics);

// ── HEAD + OPTIONS ────────────────────────────────────────────────────────────
// Mount custom HEAD + OPTIONS listeners on each path to respond with standard allowed methods headers.
// This is critical for browser pre-flight checks (CORS) and description of API capabilities.
addHeadOptions(router, '/profile',          'GET, HEAD, OPTIONS');
addHeadOptions(router, '/dashboard',        'GET, HEAD, OPTIONS');
addHeadOptions(router, '/generate-token',   'POST, HEAD, OPTIONS');
addHeadOptions(router, '/verify-token',     'POST, HEAD, OPTIONS');
addHeadOptions(router, '/refresh-token',    'POST, HEAD, OPTIONS');
addHeadOptions(router, '/revoke-token',     'DELETE, HEAD, OPTIONS');
addHeadOptions(router, '/private-games',    'GET, HEAD, OPTIONS');
addHeadOptions(router, '/private-analytics','GET, HEAD, OPTIONS');

// Export router instance
export default router;
