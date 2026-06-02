/**
 * adminController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin HTTP adapter layer for admin-only operations.
 * Every handler forwards unexpected errors to the global error handler via next(err).
 *
 * Route → Handler mapping:
 *   GET /api/v1/admin/games      → getAdminGames
 *   GET /api/v1/admin/analytics  → getAdminAnalytics
 *   GET /api/v1/admin/reports    → getAdminReports
 */

import * as adminService from '../services/adminService.js';

// ── Shared response helper ────────────────────────────────────────────────────
const respond = (res, code, success, message, data) =>
  res.status(code).json({ success, message, data });

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/games
// Returns ALL games including archived, with pagination + sort support.
// Query params: page, limit, sort (rating | downloads | price | title | releaseDate | createdAt)
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminGames = async (req, res, next) => {
  try {
    const result = await adminService.getAllGamesAdmin(req.query);
    respond(res, 200, true, 'Admin game list fetched successfully.', result);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/analytics
// Returns aggregated summary: total games, avg rating, avg price,
// platform distribution, genre distribution.
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const summary = await adminService.getAnalyticsSummary();
    respond(res, 200, true, 'Admin analytics summary fetched successfully.', summary);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/reports
// Returns { totalUsers, totalGames, activeGames, archivedGames, recentActivity }
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminReports = async (req, res, next) => {
  try {
    const report = await adminService.getReports();
    respond(res, 200, true, 'Admin report fetched successfully.', report);
  } catch (err) {
    next(err);
  }
};
