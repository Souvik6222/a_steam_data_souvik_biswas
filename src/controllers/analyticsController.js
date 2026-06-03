/**
 * analyticsController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin HTTP adapter layer. Each handler calls the corresponding service
 * pipeline, wraps the result in the standard { success, message, data } shape,
 * and forwards errors to next() for the global error handler.
 */

// Import the aggregation services layer containing MongoDB pipeline runners
import * as analyticsService from '../services/analyticsService.js';

// ── Shared response helper ────────────────────────────────────────────────────
/**
 * Utility to format the JSON response consistently.
 */
const respond = (res, code, success, message, data) =>
  res.status(code).json({ success, message, data });

// ── Generic async wrapper keeps each handler DRY ─────────────────────────────
/**
 * A higher-order function that acts as a generic async wrapper for the analytics endpoints.
 * - Accepts a service function (serviceFn) and a label for logging/message purposes.
 * - Returns an Express route handler function: (req, res, next).
 * - Implements try/catch internally to catch any async database operation errors and forwards them to next(err).
 * This eliminates the need to write separate try-catch blocks and respond helpers for each endpoint.
 */
const handle = (serviceFn, label) => async (req, res, next) => {
  try {
    // Await the asynchronous database aggregation service function execution
    const data = await serviceFn();
    // Return standard response envelope with HTTP status 200 OK
    respond(res, 200, true, `${label} fetched successfully.`, data);
  } catch (err) {
    // If an error is thrown, pass it to next() to trigger the global errorHandler middleware
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/top-rated
// ─────────────────────────────────────────────────────────────────────────────
// Retrieves top rated games by sorting ratings descending in the DB
export const getTopRated = handle(
  analyticsService.topRated,
  'Top rated games'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/most-downloaded
// ─────────────────────────────────────────────────────────────────────────────
// Retrieves the games with the highest number of downloads
export const getMostDownloaded = handle(
  analyticsService.mostDownloaded,
  'Most downloaded games'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/revenue
// ─────────────────────────────────────────────────────────────────────────────
// Returns sum calculations of calculated developer revenue streams
export const getRevenue = handle(
  analyticsService.revenueByDeveloper,
  'Revenue by developer'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/platform-distribution
// ─────────────────────────────────────────────────────────────────────────────
// Counts games matching windows, mac, or linux platforms
export const getPlatformDistribution = handle(
  analyticsService.platformDistribution,
  'Platform distribution'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/genre-distribution
// ─────────────────────────────────────────────────────────────────────────────
// Aggregates total occurrences of game count per genre tag
export const getGenreDistribution = handle(
  analyticsService.genreDistribution,
  'Genre distribution'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/trending
// ─────────────────────────────────────────────────────────────────────────────
// Evaluates trending game profiles matching active engagement/ratings
export const getTrending = handle(
  analyticsService.trending,
  'Trending games'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/release-trends
// ─────────────────────────────────────────────────────────────────────────────
// Groups and tracks count of games launched segmented by calendar year
export const getReleaseTrends = handle(
  analyticsService.releaseTrends,
  'Release trends by year'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/review-analysis
// ─────────────────────────────────────────────────────────────────────────────
// Evaluates scores across reviews sub-documents collections
export const getReviewAnalysis = handle(
  analyticsService.reviewAnalysis,
  'Review analysis'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/wishlist-analysis
// ─────────────────────────────────────────────────────────────────────────────
// Summarizes user wishlist metrics counts
export const getWishlistAnalysis = handle(
  analyticsService.wishlistAnalysis,
  'Wishlist analysis'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/user-activity
// ─────────────────────────────────────────────────────────────────────────────
// Analyzes user review creation activity stats grouped by developer
export const getUserActivity = handle(
  analyticsService.userActivity,
  'User activity by developer'
);
