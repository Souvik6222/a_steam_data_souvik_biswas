import { searchGames } from '../services/searchService.js';

const respond = (res, statusCode, success, message, data = null, error = null) =>
  res.status(statusCode).json({ success, message, data, error });

/**
 * GET /api/v1/search?q=&page=&limit=
 * Full-text regex search across title, description, genres, tags, developer.
 */
export const search = async (req, res) => {
  const { q, page, limit } = req.query;

  try {
    const result = await searchGames(q, page, limit);
    respond(res, 200, true, `Search results for "${q}".`, result);
  } catch (err) {
    const status = err.statusCode ?? 500;
    const message = status === 400 ? err.message : 'Search failed.';
    respond(res, status, false, message, null, err.message);
  }
};
