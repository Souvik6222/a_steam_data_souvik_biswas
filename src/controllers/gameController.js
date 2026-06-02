import * as gameService from '../services/gameService.js';

// ── Response helper ───────────────────────────────────────────────────────────

const respond = (res, statusCode, success, message, data = null, error = null) =>
  res.status(statusCode).json({ success, message, data, error });

// ── Existing CRUD controllers ─────────────────────────────────────────────────

/**
 * GET /api/games
 * Fetch all non-deleted games. Accepts optional query-string filters.
 */
export const getAllGames = async (req, res) => {
  try {
    const result = await gameService.getAllGames(req.query);
    respond(res, 200, true, 'Games fetched successfully.', result);
  } catch (err) {
    respond(res, 500, false, 'Failed to fetch games.', null, err.message);
  }
};

/**
 * GET /api/games/:appid
 * Fetch a single game by appid.
 */
export const getGameByAppid = async (req, res) => {
  try {
    const game = await gameService.getGameByAppid(req.params.appid);
    if (!game) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'Game fetched successfully.', game);
  } catch (err) {
    respond(res, 500, false, 'Failed to fetch game.', null, err.message);
  }
};

/**
 * POST /api/games
 * Create a new game.
 */
export const createGame = async (req, res) => {
  try {
    const game = await gameService.createGame(req.body);
    respond(res, 201, true, 'Game created successfully.', game);
  } catch (err) {
    const status = err.code === 11000 ? 409 : 400;
    respond(res, status, false, 'Failed to create game.', null, err.message);
  }
};

/**
 * PUT /api/games/:appid
 * Full replacement of a game document.
 */
export const replaceGame = async (req, res) => {
  try {
    const game = await gameService.replaceGame(req.params.appid, req.body);
    if (!game) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'Game replaced successfully.', game);
  } catch (err) {
    respond(res, 400, false, 'Failed to replace game.', null, err.message);
  }
};

/**
 * PATCH /api/games/:appid
 * Partial update of a game document.
 */
export const updateGame = async (req, res) => {
  try {
    const game = await gameService.updateGame(req.params.appid, req.body);
    if (!game) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'Game updated successfully.', game);
  } catch (err) {
    respond(res, 400, false, 'Failed to update game.', null, err.message);
  }
};

/**
 * DELETE /api/games/:appid
 * Hard-delete a game permanently.
 */
export const deleteGame = async (req, res) => {
  try {
    const game = await gameService.deleteGame(req.params.appid);
    if (!game) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'Game deleted successfully.', { appid: game.appid });
  } catch (err) {
    respond(res, 500, false, 'Failed to delete game.', null, err.message);
  }
};

/**
 * GET /api/games/:appid/exists
 * Check if a game exists by appid.
 */
export const gameExists = async (req, res) => {
  try {
    const exists = await gameService.gameExists(req.params.appid);
    respond(res, 200, true, `Game ${exists ? 'exists' : 'does not exist'}.`, { exists });
  } catch (err) {
    respond(res, 500, false, 'Failed to check game existence.', null, err.message);
  }
};

/**
 * GET /api/games/:appid/summary
 * Return lightweight summary: title, rating, price, genres, platforms.
 */
export const getGameSummary = async (req, res) => {
  try {
    const summary = await gameService.getGameSummary(req.params.appid);
    if (!summary) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'Game summary fetched successfully.', summary);
  } catch (err) {
    respond(res, 500, false, 'Failed to fetch game summary.', null, err.message);
  }
};

/**
 * GET /api/games/:appid/update-history
 * Return the updateHistory array of a game.
 */
export const getUpdateHistory = async (req, res) => {
  try {
    const history = await gameService.getUpdateHistory(req.params.appid);
    if (history === null) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'Update history fetched successfully.', history);
  } catch (err) {
    respond(res, 500, false, 'Failed to fetch update history.', null, err.message);
  }
};

/**
 * PATCH /api/games/:appid/archive
 * Soft-delete a game (isDeleted: true).
 */
export const archiveGame = async (req, res) => {
  try {
    const game = await gameService.archiveGame(req.params.appid);
    if (!game) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'Game archived successfully.', { appid: game.appid, isDeleted: game.isDeleted });
  } catch (err) {
    respond(res, 500, false, 'Failed to archive game.', null, err.message);
  }
};

/**
 * PATCH /api/games/:appid/restore
 * Restore a soft-deleted game (isDeleted: false).
 */
export const restoreGame = async (req, res) => {
  try {
    const game = await gameService.restoreGame(req.params.appid);
    if (!game) return respond(res, 404, false, 'Game not found or not archived.', null, null);
    respond(res, 200, true, 'Game restored successfully.', { appid: game.appid, isDeleted: game.isDeleted });
  } catch (err) {
    respond(res, 500, false, 'Failed to restore game.', null, err.message);
  }
};

/**
 * GET /api/games/:appid/related
 * Return games with matching genres, excluding self.
 */
export const getRelatedGames = async (req, res) => {
  try {
    const related = await gameService.getRelatedGames(req.params.appid);
    respond(res, 200, true, 'Related games fetched successfully.', related);
  } catch (err) {
    respond(res, 500, false, 'Failed to fetch related games.', null, err.message);
  }
};

// ── Param-route controllers ───────────────────────────────────────────────────

const handleParamRoute = (serviceFn, label) => async (req, res) => {
  try {
    const paramValue = Object.values(req.params)[0]; // first param (genre/developer/etc.)
    const result = await serviceFn(paramValue, req.query);
    respond(res, 200, true, `${label} fetched successfully.`, result);
  } catch (err) {
    respond(res, 500, false, `Failed to fetch ${label.toLowerCase()}.`, null, err.message);
  }
};

export const getGamesByGenre       = handleParamRoute(gameService.getGamesByGenre,       'Games by genre');
export const getGamesByDeveloper   = handleParamRoute(gameService.getGamesByDeveloper,   'Games by developer');
export const getGamesByPublisher   = handleParamRoute(gameService.getGamesByPublisher,   'Games by publisher');
export const getGamesByPlatform    = handleParamRoute(gameService.getGamesByPlatform,    'Games by platform');
export const getGamesByTag         = handleParamRoute(gameService.getGamesByTag,         'Games by tag');
export const getGamesByReleaseYear = handleParamRoute(gameService.getGamesByReleaseYear, 'Games by release year');
export const getGamesByMinRating   = handleParamRoute(gameService.getGamesByMinRating,   'Games by rating');
export const getGamesByMaxPrice    = handleParamRoute(gameService.getGamesByMaxPrice,    'Games by price');
export const getGamesByFeature     = handleParamRoute(gameService.getGamesByFeature,     'Games by feature');

// ── Boolean filter-route controllers ─────────────────────────────────────────

const handleFilterRoute = (serviceFn, label) => async (req, res) => {
  try {
    const result = await serviceFn(req.query);
    respond(res, 200, true, `${label} fetched successfully.`, result);
  } catch (err) {
    respond(res, 500, false, `Failed to fetch ${label.toLowerCase()}.`, null, err.message);
  }
};

export const getFreeToPlayGames   = handleFilterRoute(gameService.getFreeToPlayGames,   'Free-to-play games');
export const getPaidGames         = handleFilterRoute(gameService.getPaidGames,          'Paid games');
export const getDiscountedGames   = handleFilterRoute(gameService.getDiscountedGames,   'Discounted games');
export const getEarlyAccessGames  = handleFilterRoute(gameService.getEarlyAccessGames,  'Early access games');
export const getVROnlyGames       = handleFilterRoute(gameService.getVROnlyGames,       'VR-only games');
export const getControllerGames   = handleFilterRoute(gameService.getControllerGames,   'Controller-support games');
export const getMultiplayerGames  = handleFilterRoute(gameService.getMultiplayerGames,  'Multiplayer games');
export const getSingleplayerGames = handleFilterRoute(gameService.getSingleplayerGames, 'Singleplayer games');
export const getCoopGames         = handleFilterRoute(gameService.getCoopGames,         'Co-op games');
export const getOpenWorldGames    = handleFilterRoute(gameService.getOpenWorldGames,    'Open-world games');
export const getSurvivalGames     = handleFilterRoute(gameService.getSurvivalGames,     'Survival games');
export const getHorrorGames       = handleFilterRoute(gameService.getHorrorGames,       'Horror games');
export const getAnimeGames        = handleFilterRoute(gameService.getAnimeGames,        'Anime games');
export const getIndieGames        = handleFilterRoute(gameService.getIndieGames,        'Indie games');
export const getTopRatedGames     = handleFilterRoute(gameService.getTopRatedGames,     'Top-rated games');

// ── Sort-route controllers ────────────────────────────────────────────────────

export const getSortedByPriceDesc      = handleFilterRoute(gameService.getSortedByPriceDesc,      'Games sorted by price');
export const getSortedByRatingDesc     = handleFilterRoute(gameService.getSortedByRatingDesc,     'Games sorted by rating');
export const getSortedByDownloadsDesc  = handleFilterRoute(gameService.getSortedByDownloadsDesc,  'Games sorted by downloads');
export const getSortedByReleaseDateDesc = handleFilterRoute(gameService.getSortedByReleaseDateDesc, 'Games sorted by release date');
export const getSortedByPopularityDesc = handleFilterRoute(gameService.getSortedByPopularityDesc, 'Games sorted by popularity');

// ── Sub-resource controllers ───────────────────────────────────────────────────

/**
 * GET /api/games/:appid/screenshots
 */
export const getScreenshots = async (req, res) => {
  try {
    const data = await gameService.getScreenshots(req.params.appid);
    if (data === null) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'Screenshots fetched successfully.', data);
  } catch (err) {
    respond(res, 500, false, 'Failed to fetch screenshots.', null, err.message);
  }
};

/**
 * GET /api/games/:appid/trailers
 */
export const getTrailers = async (req, res) => {
  try {
    const data = await gameService.getTrailers(req.params.appid);
    if (data === null) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'Trailers fetched successfully.', data);
  } catch (err) {
    respond(res, 500, false, 'Failed to fetch trailers.', null, err.message);
  }
};

/**
 * GET /api/games/:appid/reviews
 */
export const getReviews = async (req, res) => {
  try {
    const data = await gameService.getReviews(req.params.appid);
    if (data === null) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'Reviews fetched successfully.', data);
  } catch (err) {
    respond(res, 500, false, 'Failed to fetch reviews.', null, err.message);
  }
};

/**
 * POST /api/games/:appid/reviews
 */
export const addReview = async (req, res) => {
  try {
    const game = await gameService.addReview(req.params.appid, req.body);
    if (!game) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 201, true, 'Review added successfully.', game.reviews);
  } catch (err) {
    respond(res, 400, false, 'Failed to add review.', null, err.message);
  }
};

/**
 * PATCH /api/games/:appid/reviews/:reviewId
 */
export const updateReview = async (req, res) => {
  try {
    const game = await gameService.updateReview(
      req.params.appid,
      req.params.reviewId,
      req.body
    );
    if (!game) return respond(res, 404, false, 'Game or review not found.', null, null);
    respond(res, 200, true, 'Review updated successfully.', game.reviews);
  } catch (err) {
    respond(res, 400, false, 'Failed to update review.', null, err.message);
  }
};

/**
 * DELETE /api/games/:appid/reviews/:reviewId
 */
export const deleteReview = async (req, res) => {
  try {
    const game = await gameService.deleteReview(
      req.params.appid,
      req.params.reviewId
    );
    if (!game) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'Review deleted successfully.', game.reviews);
  } catch (err) {
    respond(res, 500, false, 'Failed to delete review.', null, err.message);
  }
};

/**
 * GET /api/games/:appid/system-requirements
 */
export const getSystemRequirements = async (req, res) => {
  try {
    const data = await gameService.getSystemRequirements(req.params.appid);
    if (data === null) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'System requirements fetched successfully.', data);
  } catch (err) {
    respond(res, 500, false, 'Failed to fetch system requirements.', null, err.message);
  }
};

/**
 * GET /api/games/:appid/dlc
 */
export const getDLC = async (req, res) => {
  try {
    const data = await gameService.getDLC(req.params.appid);
    if (data === null) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'DLC fetched successfully.', data);
  } catch (err) {
    respond(res, 500, false, 'Failed to fetch DLC.', null, err.message);
  }
};

/**
 * GET /api/games/:appid/achievements
 */
export const getAchievements = async (req, res) => {
  try {
    const data = await gameService.getAchievements(req.params.appid);
    if (data === null) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'Achievements fetched successfully.', data);
  } catch (err) {
    respond(res, 500, false, 'Failed to fetch achievements.', null, err.message);
  }
};

/**
 * GET /api/games/:appid/leaderboard
 */
export const getLeaderboards = async (req, res) => {
  try {
    const data = await gameService.getLeaderboards(req.params.appid);
    if (data === null) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'Leaderboard fetched successfully.', data);
  } catch (err) {
    respond(res, 500, false, 'Failed to fetch leaderboard.', null, err.message);
  }
};

/**
 * GET /api/games/:appid/updates
 */
export const getUpdates = async (req, res) => {
  try {
    const data = await gameService.getUpdates(req.params.appid);
    if (data === null) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'Updates fetched successfully.', data);
  } catch (err) {
    respond(res, 500, false, 'Failed to fetch updates.', null, err.message);
  }
};

/**
 * GET /api/games/:appid/news
 */
export const getNews = async (req, res) => {
  try {
    const data = await gameService.getNews(req.params.appid);
    if (data === null) return respond(res, 404, false, 'Game not found.', null, null);
    respond(res, 200, true, 'News fetched successfully.', data);
  } catch (err) {
    respond(res, 500, false, 'Failed to fetch news.', null, err.message);
  }
};


