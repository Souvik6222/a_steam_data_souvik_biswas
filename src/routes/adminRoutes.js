/**
 * adminRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mounted at: /api/v1/admin
 *
 * Every route passes through:
 *   authMiddleware     – verifies JWT, attaches req.user = { id, role }
 *   roleGuard('admin') – rejects non-admin users with 403
 *
 * Routes:
 *   GET  /api/v1/admin/games      → full game list including archived, paginated
 *   GET  /api/v1/admin/analytics  → aggregated summary (totals, avgs, distributions)
 *   GET  /api/v1/admin/reports    → { totalUsers, totalGames, recentActivity }
 *
 * HEAD + OPTIONS registered for every path.
 */

import { Router } from 'express';
import authMiddleware          from '../middlewares/authMiddleware.js';
import { roleGuard }           from '../middlewares/roleMiddleware.js';
import {
  getAdminGames,
  getAdminAnalytics,
  getAdminReports,
} from '../controllers/adminController.js';
import { addHeadOptions } from '../utils/httpMethods.js';

const router = Router();

// ── Apply authMiddleware + roleGuard('admin') to every route in this file ─────
router.use(authMiddleware, roleGuard('admin'));

// ── Admin routes ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/games
 * Returns every game document (including soft-deleted / archived).
 * Supports: ?page=&limit=&sort=rating|downloads|price|title|releaseDate|createdAt
 */
router.get('/games',     getAdminGames);     // GET /api/v1/admin/games

/**
 * GET /api/v1/admin/analytics
 * Returns a single $facet aggregation with:
 *   totalGames, activeGames, archivedGames,
 *   avgRating, avgPrice, platformDist, genreDist
 */
router.get('/analytics', getAdminAnalytics); // GET /api/v1/admin/analytics

/**
 * GET /api/v1/admin/reports
 * Returns { totalUsers, totalGames, activeGames, archivedGames, recentActivity }
 */
router.get('/reports',   getAdminReports);   // GET /api/v1/admin/reports

// ── HEAD + OPTIONS ────────────────────────────────────────────────────────────
// These sit behind authMiddleware + roleGuard so only admin callers can
// successfully probe them — consistent with GET access rules.
addHeadOptions(router, '/games',     'GET, HEAD, OPTIONS');
addHeadOptions(router, '/analytics', 'GET, HEAD, OPTIONS');
addHeadOptions(router, '/reports',   'GET, HEAD, OPTIONS');

export default router;
