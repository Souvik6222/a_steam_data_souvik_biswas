/**
 * adminRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mounted at: /api/v1/admin
 *
 * Every route passes through:
 *   authMiddleware          – verifies JWT, attaches req.user = { id, role }
 *   roleGuard('admin')      – rejects non-admin users with 403
 *
 * Routes:
 *   GET /api/v1/admin/games      → full game list including archived, paginated
 *   GET /api/v1/admin/analytics  → aggregated summary (totals, avgs, distributions)
 *   GET /api/v1/admin/reports    → { totalUsers, totalGames, recentActivity }
 */

import { Router } from 'express';
import authMiddleware          from '../middlewares/authMiddleware.js';
import { roleGuard }           from '../middlewares/roleMiddleware.js';
import {
  getAdminGames,
  getAdminAnalytics,
  getAdminReports,
} from '../controllers/adminController.js';

const router = Router();

// ── Apply authMiddleware + roleGuard('admin') to every route in this file ─────
// Using router.use() as a guard so every future route added here is also protected.
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

export default router;
