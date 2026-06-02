/**
 * analyticsController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin HTTP adapter layer. Each handler calls the corresponding service
 * pipeline, wraps the result in the standard { success, message, data } shape,
 * and forwards errors to next() for the global error handler.
 */

import * as analyticsService from '../services/analyticsService.js';

// ── Shared response helper ────────────────────────────────────────────────────
const respond = (res, code, success, message, data) =>
  res.status(code).json({ success, message, data });

// ── Generic async wrapper keeps each handler DRY ─────────────────────────────
const handle = (serviceFn, label) => async (req, res, next) => {
  try {
    const data = await serviceFn();
    respond(res, 200, true, `${label} fetched successfully.`, data);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/top-rated
// ─────────────────────────────────────────────────────────────────────────────
export const getTopRated = handle(
  analyticsService.topRated,
  'Top rated games'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/most-downloaded
// ─────────────────────────────────────────────────────────────────────────────
export const getMostDownloaded = handle(
  analyticsService.mostDownloaded,
  'Most downloaded games'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/revenue
// ─────────────────────────────────────────────────────────────────────────────
export const getRevenue = handle(
  analyticsService.revenueByDeveloper,
  'Revenue by developer'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/platform-distribution
// ─────────────────────────────────────────────────────────────────────────────
export const getPlatformDistribution = handle(
  analyticsService.platformDistribution,
  'Platform distribution'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/genre-distribution
// ─────────────────────────────────────────────────────────────────────────────
export const getGenreDistribution = handle(
  analyticsService.genreDistribution,
  'Genre distribution'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/trending
// ─────────────────────────────────────────────────────────────────────────────
export const getTrending = handle(
  analyticsService.trending,
  'Trending games'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/release-trends
// ─────────────────────────────────────────────────────────────────────────────
export const getReleaseTrends = handle(
  analyticsService.releaseTrends,
  'Release trends by year'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/review-analysis
// ─────────────────────────────────────────────────────────────────────────────
export const getReviewAnalysis = handle(
  analyticsService.reviewAnalysis,
  'Review analysis'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/wishlist-analysis
// ─────────────────────────────────────────────────────────────────────────────
export const getWishlistAnalysis = handle(
  analyticsService.wishlistAnalysis,
  'Wishlist analysis'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/user-activity
// ─────────────────────────────────────────────────────────────────────────────
export const getUserActivity = handle(
  analyticsService.userActivity,
  'User activity by developer'
);
