import Game from '../models/Game.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolve a game by appid (numeric). Throws if not found.
 * @param {number|string} appid
 * @param {object} [projection]
 * @returns {Promise<Document>}
 */
const findByAppid = (appid, projection = {}) =>
  Game.findOne({ appid: Number(appid) }, projection);

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Fetch all active (non-deleted) games.
 * Supports filtering via query object (e.g. genre, rating range, etc.)
 */
export const getAllGames = async (query = {}) => {
  const filter = { isDeleted: false, ...query };
  return Game.find(filter).lean();
};

/**
 * Fetch a single game by its Steam appid.
 */
export const getGameByAppid = async (appid) => {
  return findByAppid(appid);
};

/**
 * Create a new game document.
 * @param {object} data
 */
export const createGame = async (data) => {
  return Game.create(data);
};

/**
 * Full replacement of a game document (PUT semantics).
 * Replaces all fields except _id and appid.
 * @param {number|string} appid
 * @param {object} data
 */
export const replaceGame = async (appid, data) => {
  return Game.findOneAndReplace(
    { appid: Number(appid) },
    { appid: Number(appid), ...data },
    { new: true, runValidators: true }
  );
};

/**
 * Partial update of a game document (PATCH semantics).
 * @param {number|string} appid
 * @param {object} data
 */
export const updateGame = async (appid, data) => {
  return Game.findOneAndUpdate(
    { appid: Number(appid) },
    { $set: data },
    { new: true, runValidators: true }
  );
};

/**
 * Hard-delete a game document permanently.
 * @param {number|string} appid
 */
export const deleteGame = async (appid) => {
  return Game.findOneAndDelete({ appid: Number(appid) });
};

/**
 * Check whether a game with the given appid exists.
 * @param {number|string} appid
 * @returns {Promise<boolean>}
 */
export const gameExists = async (appid) => {
  const count = await Game.countDocuments({ appid: Number(appid) });
  return count > 0;
};

/**
 * Return a lightweight summary of a game: title, rating, price, genres, platforms.
 * @param {number|string} appid
 */
export const getGameSummary = async (appid) => {
  return Game.findOne(
    { appid: Number(appid), isDeleted: false },
    { title: 1, rating: 1, price: 1, genres: 1, platforms: 1, _id: 0 }
  ).lean();
};

/**
 * Return only the updateHistory array of a game.
 * @param {number|string} appid
 */
export const getUpdateHistory = async (appid) => {
  const game = await Game.findOne(
    { appid: Number(appid), isDeleted: false },
    { updateHistory: 1, _id: 0 }
  ).lean();
  return game ? game.updateHistory : null;
};

/**
 * Soft-delete a game by setting isDeleted:true.
 * @param {number|string} appid
 */
export const archiveGame = async (appid) => {
  return Game.findOneAndUpdate(
    { appid: Number(appid) },
    { $set: { isDeleted: true } },
    { new: true }
  );
};

/**
 * Restore a soft-deleted game by setting isDeleted:false.
 * @param {number|string} appid
 */
export const restoreGame = async (appid) => {
  return Game.findOneAndUpdate(
    { appid: Number(appid), isDeleted: true },
    { $set: { isDeleted: false } },
    { new: true }
  );
};

/**
 * Find games that share at least one genre with the given game, excluding itself.
 * @param {number|string} appid
 */
export const getRelatedGames = async (appid) => {
  const game = await findByAppid(appid, { genres: 1 });
  if (!game || !game.genres?.length) return [];

  return Game.find({
    appid: { $ne: Number(appid) },
    genres: { $in: game.genres },
    isDeleted: false,
  }).lean();
};
