import Game from '../models/Game.js';
import paginate from '../utils/paginate.js';

/**
 * Search games across title, description, genres, tags, and developer
 * using case-insensitive regex matching.
 *
 * @param {string} q      — search query (required, throws 400 if empty)
 * @param {number} page   — 1-based page number (default: 1)
 * @param {number} limit  — page size (default: 20, max: 100)
 * @returns {Promise<{ data, total, page, totalPages }>}
 */
export const searchGames = (q, page, limit) => {
  if (!q || !q.trim()) {
    const err = new Error('Search query "q" is required and cannot be empty.');
    err.statusCode = 400;
    throw err;
  }

  const regex = new RegExp(q.trim(), 'i');

  const filter = {
    isDeleted: false,
    $or: [
      { title:       { $regex: regex } },
      { description: { $regex: regex } },
      { genres:      { $regex: regex } },
      { tags:        { $regex: regex } },
      { developer:   { $regex: regex } },
    ],
  };

  return paginate(Game, filter, { _id: 1 }, page, limit);
};
