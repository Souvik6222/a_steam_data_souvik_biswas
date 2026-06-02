/**
 * searchController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-text search handler. Wrapped with catchAsync — errors reach the global
 * error handler. searchService throws an AppError(400) when no query is
 * provided, which propagates cleanly.
 */

import { searchGames } from '../services/searchService.js';
import catchAsync from '../utils/catchAsync.js';

const respond = (res, statusCode, success, message, data = null) =>
  res.status(statusCode).json({ success, message, data });

/**
 * GET /api/v1/search?q=&page=&limit=
 * Full-text regex search across title, description, genres, tags, developer.
 */
export const search = catchAsync(async (req, res) => {
  const { q, page, limit } = req.query;
  const result = await searchGames(q, page, limit);
  respond(res, 200, true, `Search results for "${q}".`, result);
});
