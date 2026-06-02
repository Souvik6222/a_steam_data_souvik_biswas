/**
 * statsController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin HTTP adapter for the stats service pipelines.
 * Forwards errors to the global error handler via next(err).
 */

import * as statsService from '../services/statsService.js';

// ── Shared response helper ────────────────────────────────────────────────────
const respond = (res, code, success, message, data) =>
  res.status(code).json({ success, message, data });

// ── Generic async wrapper ─────────────────────────────────────────────────────
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
export const getCount = handle(
  statsService.count,
  'Total game count'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/top-rated
// ─────────────────────────────────────────────────────────────────────────────
export const getTopRated = handle(
  statsService.topRated,
  'Top rated games'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/most-downloaded
// ─────────────────────────────────────────────────────────────────────────────
export const getMostDownloaded = handle(
  statsService.mostDownloaded,
  'Most downloaded games'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/average-price
// ─────────────────────────────────────────────────────────────────────────────
export const getAveragePrice = handle(
  statsService.averagePrice,
  'Average price'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/average-rating
// ─────────────────────────────────────────────────────────────────────────────
export const getAverageRating = handle(
  statsService.averageRating,
  'Average rating'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/genre-count
// ─────────────────────────────────────────────────────────────────────────────
export const getGenreCount = handle(
  statsService.genreCount,
  'Genre count'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/platform-count
// ─────────────────────────────────────────────────────────────────────────────
export const getPlatformCount = handle(
  statsService.platformCount,
  'Platform count'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/free-to-play-count
// ─────────────────────────────────────────────────────────────────────────────
export const getFreeToPlayCount = handle(
  statsService.freeToPlayCount,
  'Free-to-play game count'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/multiplayer-count
// ─────────────────────────────────────────────────────────────────────────────
export const getMultiplayerCount = handle(
  statsService.multiplayerCount,
  'Multiplayer game count'
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/stats/monthly-releases
// ─────────────────────────────────────────────────────────────────────────────
export const getMonthlyReleases = handle(
  statsService.monthlyReleases,
  'Monthly releases'
);
