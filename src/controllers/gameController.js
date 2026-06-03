/**
 * gameController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin HTTP adapter layer for game CRUD, filters, sorts, and sub-resources.
 * Every handler is wrapped with catchAsync so errors propagate to the global
 * error handler via next(err) — no manual try/catch needed.
 *
 * Services throw AppError for domain failures (404, 409, 400); Mongoose
 * throws ValidationError / CastError; all are handled centrally in
 * src/middlewares/errorHandler.js.
 */

// Import the complete services layer containing Mongoose operations
import * as gameService from '../services/gameService.js';
// Import utility function that handles async controllers and propagates errors to the Express error boundary
import catchAsync from '../utils/catchAsync.js';

// ── Response helper ───────────────────────────────────────────────────────────

/**
 * Standard utility function to unify response shapes across this controller.
 */
const respond = (res, statusCode, success, message, data = null) =>
  res.status(statusCode).json({ success, message, data });

// ── CRUD controllers ──────────────────────────────────────────────────────────

/**
 * GET /api/games
 * Fetch all non-deleted games. Accepts optional query-string filters (e.g. page, limit, sort).
 */
export const getAllGames = catchAsync(async (req, res) => {
  // Delegate DB lookup query and paging parameters (req.query) to gameService
  const result = await gameService.getAllGames(req.query);
  respond(res, 200, true, 'Games fetched successfully.', result);
});

/**
 * GET /api/games/:appid
 * Fetch a single game by its unique AppID.
 */
export const getGameByAppid = catchAsync(async (req, res) => {
  // Pass the route parameter :appid to the lookup service
  const game = await gameService.getGameByAppid(req.params.appid);
  respond(res, 200, true, 'Game fetched successfully.', game);
});

/**
 * POST /api/games
 * Create and insert a new game document.
 */
export const createGame = catchAsync(async (req, res) => {
  // Pass the creation body payload (req.body) to the creation service
  const game = await gameService.createGame(req.body);
  respond(res, 201, true, 'Game created successfully.', game);
});

/**
 * PUT /api/games/:appid
 * Full replacement of a game document.
 */
export const replaceGame = catchAsync(async (req, res) => {
  // Replace the entire document with the new body data
  const game = await gameService.replaceGame(req.params.appid, req.body);
  respond(res, 200, true, 'Game replaced successfully.', game);
});

/**
 * PATCH /api/games/:appid
 * Partial update of a game document (updates only fields sent in req.body).
 */
export const updateGame = catchAsync(async (req, res) => {
  const game = await gameService.updateGame(req.params.appid, req.body);
  respond(res, 200, true, 'Game updated successfully.', game);
});

/**
 * DELETE /api/games/:appid
 * Hard-delete a game permanently from the database.
 */
export const deleteGame = catchAsync(async (req, res) => {
  const game = await gameService.deleteGame(req.params.appid);
  respond(res, 200, true, 'Game deleted successfully.', { appid: game.appid });
});

/**
 * GET /api/games/:appid/exists
 * Lightweight check to see if a game already exists by AppID.
 */
export const gameExists = catchAsync(async (req, res) => {
  const exists = await gameService.gameExists(req.params.appid);
  respond(res, 200, true, `Game ${exists ? 'exists' : 'does not exist'}.`, { exists });
});

/**
 * GET /api/games/:appid/summary
 * Return lightweight summary of specific game fields to conserve bandwidth.
 */
export const getGameSummary = catchAsync(async (req, res) => {
  const summary = await gameService.getGameSummary(req.params.appid);
  if (!summary) {
    return respond(res, 404, false, 'Game not found.');
  }
  respond(res, 200, true, 'Game summary fetched successfully.', summary);
});

/**
 * GET /api/games/:appid/update-history
 * Return the updateHistory change-log array of a game.
 */
export const getUpdateHistory = catchAsync(async (req, res) => {
  const history = await gameService.getUpdateHistory(req.params.appid);
  if (history === null) return respond(res, 404, false, 'Game not found.');
  respond(res, 200, true, 'Update history fetched successfully.', history);
});

/**
 * PATCH /api/games/:appid/archive
 * Soft-delete a game (flags isDeleted: true instead of removing the record).
 */
export const archiveGame = catchAsync(async (req, res) => {
  const game = await gameService.archiveGame(req.params.appid);
  respond(res, 200, true, 'Game archived successfully.', { appid: game.appid, isDeleted: game.isDeleted });
});

/**
 * PATCH /api/games/:appid/restore
 * Restore a soft-deleted game back to active state (flags isDeleted: false).
 */
export const restoreGame = catchAsync(async (req, res) => {
  const game = await gameService.restoreGame(req.params.appid);
  respond(res, 200, true, 'Game restored successfully.', { appid: game.appid, isDeleted: game.isDeleted });
});

/**
 * GET /api/games/:appid/related
 * Return games with matching genres, excluding self, to act as recommendations.
 */
export const getRelatedGames = catchAsync(async (req, res) => {
  const related = await gameService.getRelatedGames(req.params.appid);
  respond(res, 200, true, 'Related games fetched successfully.', related);
});

// ── Param-route controllers ───────────────────────────────────────────────────

/**
 * Higher-order controller factory to dynamically process routes containing dynamic parameters.
 * Extracts the first key value inside req.params and delegates it to the service function.
 * Avoids writing redundant boilerplate for /genre/:genre, /developer/:developer, etc.
 */
const handleParamRoute = (serviceFn, label) =>
  catchAsync(async (req, res) => {
    // Retrieve the actual parameter value (e.g. "Action" from req.params.genre or "Valve" from req.params.developer)
    const paramValue = Object.values(req.params)[0]; 
    // Execute the service passing the parameter value and query modifiers
    const result = await serviceFn(paramValue, req.query);
    // Respond back to client
    respond(res, 200, true, `${label} fetched successfully.`, result);
  });

// Bind service methods to param controllers
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

/**
 * Higher-order controller factory that processes pre-filtered requests.
 * Passes the req.query object directly into the service layer function.
 */
const handleFilterRoute = (serviceFn, label) =>
  catchAsync(async (req, res) => {
    const result = await serviceFn(req.query);
    respond(res, 200, true, `${label} fetched successfully.`, result);
  });

// Bind service methods to boolean filter routes
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

// Bind sorting service functions to sort routes
export const getSortedByPriceDesc       = handleFilterRoute(gameService.getSortedByPriceDesc,       'Games sorted by price');
export const getSortedByRatingDesc      = handleFilterRoute(gameService.getSortedByRatingDesc,      'Games sorted by rating');
export const getSortedByDownloadsDesc   = handleFilterRoute(gameService.getSortedByDownloadsDesc,   'Games sorted by downloads');
export const getSortedByReleaseDateDesc = handleFilterRoute(gameService.getSortedByReleaseDateDesc, 'Games sorted by release date');
export const getSortedByPopularityDesc  = handleFilterRoute(gameService.getSortedByPopularityDesc,  'Games sorted by popularity');

// ── Sub-resource controllers ──────────────────────────────────────────────────

/**
 * GET /api/games/:appid/screenshots
 */
export const getScreenshots = catchAsync(async (req, res) => {
  const data = await gameService.getScreenshots(req.params.appid);
  respond(res, 200, true, 'Screenshots fetched successfully.', data);
});

/**
 * GET /api/games/:appid/trailers
 */
export const getTrailers = catchAsync(async (req, res) => {
  const data = await gameService.getTrailers(req.params.appid);
  respond(res, 200, true, 'Trailers fetched successfully.', data);
});

/**
 * GET /api/games/:appid/reviews
 */
export const getReviews = catchAsync(async (req, res) => {
  const data = await gameService.getReviews(req.params.appid);
  respond(res, 200, true, 'Reviews fetched successfully.', data);
});

/**
 * POST /api/games/:appid/reviews
 * Inserts a review into the reviews sub-document array.
 */
export const addReview = catchAsync(async (req, res) => {
  const game = await gameService.addReview(req.params.appid, req.body);
  respond(res, 201, true, 'Review added successfully.', game.reviews);
});

/**
 * PATCH /api/games/:appid/reviews/:reviewId
 * Updates an embedded review based on its unique sub-document _id.
 */
export const updateReview = catchAsync(async (req, res) => {
  const game = await gameService.updateReview(
    req.params.appid,
    req.params.reviewId,
    req.body
  );
  respond(res, 200, true, 'Review updated successfully.', game.reviews);
});

/**
 * DELETE /api/games/:appid/reviews/:reviewId
 * Removes an embedded review based on its unique _id.
 */
export const deleteReview = catchAsync(async (req, res) => {
  const game = await gameService.deleteReview(
    req.params.appid,
    req.params.reviewId
  );
  respond(res, 200, true, 'Review deleted successfully.', game.reviews);
});

/**
 * GET /api/games/:appid/system-requirements
 */
export const getSystemRequirements = catchAsync(async (req, res) => {
  const data = await gameService.getSystemRequirements(req.params.appid);
  respond(res, 200, true, 'System requirements fetched successfully.', data);
});

/**
 * GET /api/games/:appid/dlc
 */
export const getDLC = catchAsync(async (req, res) => {
  const data = await gameService.getDLC(req.params.appid);
  respond(res, 200, true, 'DLC fetched successfully.', data);
});

/**
 * GET /api/games/:appid/achievements
 */
export const getAchievements = catchAsync(async (req, res) => {
  const data = await gameService.getAchievements(req.params.appid);
  respond(res, 200, true, 'Achievements fetched successfully.', data);
});

/**
 * GET /api/games/:appid/leaderboard
 */
export const getLeaderboards = catchAsync(async (req, res) => {
  const data = await gameService.getLeaderboards(req.params.appid);
  respond(res, 200, true, 'Leaderboard fetched successfully.', data);
});

/**
 * GET /api/games/:appid/updates
 */
export const getUpdates = catchAsync(async (req, res) => {
  const data = await gameService.getUpdates(req.params.appid);
  respond(res, 200, true, 'Updates fetched successfully.', data);
});

/**
 * GET /api/games/:appid/news
 */
export const getNews = catchAsync(async (req, res) => {
  const data = await gameService.getNews(req.params.appid);
  respond(res, 200, true, 'News fetched successfully.', data);
});
