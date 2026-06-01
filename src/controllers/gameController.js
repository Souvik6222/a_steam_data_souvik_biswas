import * as gameService from '../services/gameService.js';

// ── Response helper ───────────────────────────────────────────────────────────

const respond = (res, statusCode, success, message, data = null, error = null) =>
  res.status(statusCode).json({ success, message, data, error });

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/games
 * Fetch all non-deleted games. Accepts optional query-string filters.
 */
export const getAllGames = async (req, res) => {
  try {
    const games = await gameService.getAllGames(req.query);
    respond(res, 200, true, 'Games fetched successfully.', games);
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
