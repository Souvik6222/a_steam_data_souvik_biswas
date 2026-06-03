/**
 * statsController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin HTTP adapter for the stats service pipelines.
 * Forwards errors to the global error handler via next(err).
 */

// Import statsService business logic functions containing database aggregations
import * as statsService from '../services/statsService.js';

// ── Shared response helper ────────────────────────────────────────────────────
/**
 * Utility to format the JSON response consistently.
 */
const respond = (res, code, success, message, data) =>
  res.status(code).json({ success, message, data });

// ── Generic async wrapper ─────────────────────────────────────────────────────
/**
 * A higher-order function that acts as a generic async wrapper for the stats endpoints.
 * - Accepts a service function (serviceFn) and a label for logging/message purposes.
 * - Returns an Express route handler function: (req, res, next).
 * - Implements try/catch internally to catch any async database operation errors and forwards them to next(err).
 * This eliminates the need to write separate try-catch blocks and respond helpers for each endpoint.
 */
const handle = (serviceFn, label) => async (req, res, next) => {
  try {
    const data = await serviceFn();
    respond(res, 200, true, `${label} fetched successfully.`, data);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/count
// ─────────────────────────────────────────────────────────────────────────────
// Returns total active count of games in DB
export const getCount = handle(
  statsService.count,
  'Total game count'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/top-rated
// ─────────────────────────────────────────────────────────────────────────────
// Returns top 10 rated games
export const getTopRated = handle(
  statsService.topRated,
  'Top rated games'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/most-downloaded
// ─────────────────────────────────────────────────────────────────────────────
// Returns top 10 most downloaded games
export const getMostDownloaded = handle(
  statsService.mostDownloaded,
  'Most downloaded games'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/average-price
// ─────────────────────────────────────────────────────────────────────────────
// Computes average, min, and max price of games in DB
export const getAveragePrice = handle(
  statsService.averagePrice,
  'Average price'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/average-rating
// ─────────────────────────────────────────────────────────────────────────────
// Computes average, min, and max user rating
export const getAverageRating = handle(
  statsService.averageRating,
  'Average rating'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/genre-count
// ─────────────────────────────────────────────────────────────────────────────
// Counts of games belonging to each genre category
export const getGenreCount = handle(
  statsService.genreCount,
  'Genre count'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/platform-count
// ─────────────────────────────────────────────────────────────────────────────
// Counts of games compatible with Windows, Mac, and Linux
export const getPlatformCount = handle(
  statsService.platformCount,
  'Platform count'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/free-to-play-count
// ─────────────────────────────────────────────────────────────────────────────
// Number of games flagged as free to play
export const getFreeToPlayCount = handle(
  statsService.freeToPlayCount,
  'Free-to-play game count'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/multiplayer-count
// ─────────────────────────────────────────────────────────────────────────────
// Number of games flagged with multiplayer compatibility
export const getMultiplayerCount = handle(
  statsService.multiplayerCount,
  'Multiplayer game count'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/monthly-releases
// ─────────────────────────────────────────────────────────────────────────────
// Groups and tracks game releases count per month
export const getMonthlyReleases = handle(
  statsService.monthlyReleases,
  'Monthly releases'
);
