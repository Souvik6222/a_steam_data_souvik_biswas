import Game from '../models/Game.js';
import buildFilter from '../utils/buildFilter.js';
import paginate from '../utils/paginate.js';

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

// ── Sort-field map ────────────────────────────────────────────────────────────
const SORT_FIELDS = {
  price:       'price.original',
  rating:      'rating',
  downloads:   'downloads',
  releaseDate: 'release_date',
  title:       'title',
};

/**
 * Build a Mongoose sort document from the `sort` query param.
 * Accepts values like "rating", "rating-desc", "price-desc", etc.
 * Defaults to { createdAt: -1 } if unrecognised.
 * @param {string} [sortParam]
 * @returns {object}
 */
const resolveSort = (sortParam) => {
  if (!sortParam) return { createdAt: -1 };

  const [field, dir] = sortParam.split('-');
  const mongoField = SORT_FIELDS[field];
  if (!mongoField) return { createdAt: -1 };

  return { [mongoField]: dir === 'desc' ? -1 : 1 };
};

/**
 * Fetch all active (non-deleted) games with filtering, sorting, and pagination.
 *
 * Recognised query params (beyond buildFilter's set):
 *   sort  — "price" | "rating" | "downloads" | "releaseDate" | "title"
 *           append "-desc" for descending, e.g. "rating-desc"
 *   page  — 1-based page number (default: 1)
 *   limit — page size (default: 20, max: 100)
 */
export const getAllGames = async (query = {}) => {
  const { sort, page, limit, ...filterParams } = query;
  const filter  = buildFilter(filterParams);
  const sortDoc = resolveSort(sort);
  return paginate(Game, filter, sortDoc, page, limit);
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

// ── Param-route services ──────────────────────────────────────────────────────
// Each accepts the route param value + optional { page, limit, sort } from query.

/** GET /genre/:genre */
export const getGamesByGenre = (genre, query = {}) => {
  const { sort, page, limit } = query;
  const filter = { isDeleted: false, genres: { $in: [genre] } };
  return paginate(Game, filter, resolveSort(sort), page, limit);
};

/** GET /developer/:developer */
export const getGamesByDeveloper = (developer, query = {}) => {
  const { sort, page, limit } = query;
  const filter = { isDeleted: false, developer };
  return paginate(Game, filter, resolveSort(sort), page, limit);
};

/** GET /publisher/:publisher */
export const getGamesByPublisher = (publisher, query = {}) => {
  const { sort, page, limit } = query;
  const filter = { isDeleted: false, publisher };
  return paginate(Game, filter, resolveSort(sort), page, limit);
};

/** GET /platform/:platform  (windows | mac | linux) */
export const getGamesByPlatform = (platform, query = {}) => {
  const { sort, page, limit } = query;
  const validPlatforms = ['windows', 'mac', 'linux'];
  const p = platform.trim().toLowerCase();
  const filter = validPlatforms.includes(p)
    ? { isDeleted: false, [`platforms.${p}`]: true }
    : { isDeleted: false };
  return paginate(Game, filter, resolveSort(sort), page, limit);
};

/** GET /tag/:tag */
export const getGamesByTag = (tag, query = {}) => {
  const { sort, page, limit } = query;
  const filter = { isDeleted: false, tags: { $in: [tag] } };
  return paginate(Game, filter, resolveSort(sort), page, limit);
};

/** GET /release-year/:year */
export const getGamesByReleaseYear = (year, query = {}) => {
  const { sort, page, limit } = query;
  const y = parseInt(year, 10);
  const filter = {
    isDeleted: false,
    release_date: {
      $gte: new Date(`${y}-01-01`),
      $lt:  new Date(`${y + 1}-01-01`),
    },
  };
  return paginate(Game, filter, resolveSort(sort), page, limit);
};

/** GET /rating/:rating  — games with rating >= value */
export const getGamesByMinRating = (rating, query = {}) => {
  const { sort, page, limit } = query;
  const filter = { isDeleted: false, rating: { $gte: Number(rating) } };
  return paginate(Game, filter, resolveSort(sort), page, limit);
};

/** GET /price/:price  — games with price.original <= value */
export const getGamesByMaxPrice = (price, query = {}) => {
  const { sort, page, limit } = query;
  const filter = { isDeleted: false, 'price.original': { $lte: Number(price) } };
  return paginate(Game, filter, resolveSort(sort), page, limit);
};

/**
 * GET /feature/:feature
 * Maps a URL-friendly feature slug to a boolean schema field.
 */
const FEATURE_FIELD_MAP = {
  'free-to-play':        'isFreeToPlay',
  'early-access':        'isEarlyAccess',
  'vr-only':             'isVROnly',
  'controller-support':  'hasControllerSupport',
  multiplayer:           'isMultiplayer',
  singleplayer:          'isSingleplayer',
  coop:                  'isCoop',
  'open-world':          'isOpenWorld',
  survival:              'isSurvival',
  horror:                'isHorror',
  anime:                 'isAnime',
  indie:                 'isIndie',
};

export const getGamesByFeature = (feature, query = {}) => {
  const { sort, page, limit } = query;
  const field = FEATURE_FIELD_MAP[feature.toLowerCase()];
  const filter = field
    ? { isDeleted: false, [field]: true }
    : { isDeleted: false };
  return paginate(Game, filter, resolveSort(sort), page, limit);
};

// ── Boolean filter-route services ─────────────────────────────────────────────

const filterQuery = (extraFilter, query = {}) => {
  const { sort, page, limit } = query;
  const filter = { isDeleted: false, ...extraFilter };
  return paginate(Game, filter, resolveSort(sort), page, limit);
};

export const getFreeToPlayGames    = (q) => filterQuery({ isFreeToPlay: true },  q);
export const getPaidGames          = (q) => filterQuery({ isFreeToPlay: false }, q);
export const getDiscountedGames    = (q) => filterQuery({ 'price.discount_percent': { $gt: 0 } }, q);
export const getEarlyAccessGames   = (q) => filterQuery({ isEarlyAccess: true },        q);
export const getVROnlyGames        = (q) => filterQuery({ isVROnly: true },             q);
export const getControllerGames    = (q) => filterQuery({ hasControllerSupport: true }, q);
export const getMultiplayerGames   = (q) => filterQuery({ isMultiplayer: true },        q);
export const getSingleplayerGames  = (q) => filterQuery({ isSingleplayer: true },       q);
export const getCoopGames          = (q) => filterQuery({ isCoop: true },               q);
export const getOpenWorldGames     = (q) => filterQuery({ isOpenWorld: true },          q);
export const getSurvivalGames      = (q) => filterQuery({ isSurvival: true },           q);
export const getHorrorGames        = (q) => filterQuery({ isHorror: true },             q);
export const getAnimeGames         = (q) => filterQuery({ isAnime: true },              q);
export const getIndieGames         = (q) => filterQuery({ isIndie: true },              q);
export const getTopRatedGames      = (q) => filterQuery({}, { ...q, sort: 'rating-desc' });

// ── Sort-route services ───────────────────────────────────────────────────────

const BASE_FILTER = { isDeleted: false };

/** GET /sort/price-desc — cheapest to most expensive (desc = high price first) */
export const getSortedByPriceDesc = (query = {}) => {
  const { page, limit } = query;
  return paginate(Game, BASE_FILTER, { 'price.original': -1 }, page, limit);
};

/** GET /sort/rating-desc — highest rated first */
export const getSortedByRatingDesc = (query = {}) => {
  const { page, limit } = query;
  return paginate(Game, BASE_FILTER, { rating: -1 }, page, limit);
};

/** GET /sort/downloads-desc — most downloaded first */
export const getSortedByDownloadsDesc = (query = {}) => {
  const { page, limit } = query;
  return paginate(Game, BASE_FILTER, { downloads: -1 }, page, limit);
};

/** GET /sort/releaseDate-desc — newest releases first */
export const getSortedByReleaseDateDesc = (query = {}) => {
  const { page, limit } = query;
  return paginate(Game, BASE_FILTER, { release_date: -1 }, page, limit);
};

/**
 * GET /sort/popularity-desc
 * Composite score: downloads + (rating * 100).
 * Uses aggregation so no schema change is required.
 */
export const getSortedByPopularityDesc = async (query = {}) => {
  const safePage  = Math.max(1, parseInt(query.page,  10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip      = (safePage - 1) * safeLimit;

  const [countResult, data] = await Promise.all([
    Game.countDocuments(BASE_FILTER),
    Game.aggregate([
      { $match: BASE_FILTER },
      { $addFields: { popularityScore: { $add: ['$downloads', { $multiply: ['$rating', 100] }] } } },
      { $sort: { popularityScore: -1 } },
      { $skip: skip },
      { $limit: safeLimit },
      { $project: { popularityScore: 0 } }, // strip the ephemeral field from output
    ]),
  ]);

  return {
    data,
    total:      countResult,
    page:       safePage,
    totalPages: Math.ceil(countResult / safeLimit),
  };
};

// ── Sub-resource service functions ────────────────────────────────────────────

/**
 * GET /api/games/:appid/screenshots
 * Return the screenshots array of a game.
 * @param {number|string} appid
 */
export const getScreenshots = async (appid) => {
  const game = await Game.findOne(
    { appid: Number(appid) },
    { screenshots: 1, _id: 0 }
  ).lean();
  return game ? game.screenshots : null;
};

/**
 * GET /api/games/:appid/trailers
 * Return the trailers array of a game.
 * @param {number|string} appid
 */
export const getTrailers = async (appid) => {
  const game = await Game.findOne(
    { appid: Number(appid) },
    { trailers: 1, _id: 0 }
  ).lean();
  return game ? game.trailers : null;
};

/**
 * GET /api/games/:appid/reviews
 * Return the reviews array of a game.
 * @param {number|string} appid
 */
export const getReviews = async (appid) => {
  const game = await Game.findOne(
    { appid: Number(appid) },
    { reviews: 1, _id: 0 }
  ).lean();
  return game ? game.reviews : null;
};

/**
 * POST /api/games/:appid/reviews
 * Push a new review object onto game.reviews and save.
 * @param {number|string} appid
 * @param {{ user: string, comment: string, score: number }} reviewData
 */
export const addReview = async (appid, reviewData) => {
  return Game.findOneAndUpdate(
    { appid: Number(appid) },
    { $push: { reviews: reviewData } },
    { new: true, runValidators: true }
  );
};

/**
 * PATCH /api/games/:appid/reviews/:reviewId
 * Find the review subdocument by _id and update its fields.
 * @param {number|string} appid
 * @param {string} reviewId
 * @param {{ user?: string, comment?: string, score?: number }} data
 */
export const updateReview = async (appid, reviewId, data) => {
  // Build a $set that only touches the matched array element
  const setFields = {};
  if (data.user    !== undefined) setFields['reviews.$.user']    = data.user;
  if (data.comment !== undefined) setFields['reviews.$.comment'] = data.comment;
  if (data.score   !== undefined) setFields['reviews.$.score']   = data.score;

  return Game.findOneAndUpdate(
    { appid: Number(appid), 'reviews._id': reviewId },
    { $set: setFields },
    { new: true, runValidators: true }
  );
};

/**
 * DELETE /api/games/:appid/reviews/:reviewId
 * Pull the review with the given _id from the reviews array.
 * @param {number|string} appid
 * @param {string} reviewId
 */
export const deleteReview = async (appid, reviewId) => {
  return Game.findOneAndUpdate(
    { appid: Number(appid) },
    { $pull: { reviews: { _id: reviewId } } },
    { new: true }
  );
};

/**
 * GET /api/games/:appid/system-requirements
 * Return the system_requirements subdocument of a game.
 * @param {number|string} appid
 */
export const getSystemRequirements = async (appid) => {
  const game = await Game.findOne(
    { appid: Number(appid) },
    { system_requirements: 1, _id: 0 }
  ).lean();
  return game ? game.system_requirements : null;
};

/**
 * GET /api/games/:appid/dlc
 * Return the dlc array of a game.
 * @param {number|string} appid
 */
export const getDLC = async (appid) => {
  const game = await Game.findOne(
    { appid: Number(appid) },
    { dlc: 1, _id: 0 }
  ).lean();
  return game ? game.dlc : null;
};

/**
 * GET /api/games/:appid/achievements
 * Return the achievements array of a game.
 * @param {number|string} appid
 */
export const getAchievements = async (appid) => {
  const game = await Game.findOne(
    { appid: Number(appid) },
    { achievements: 1, _id: 0 }
  ).lean();
  return game ? game.achievements : null;
};

/**
 * GET /api/games/:appid/leaderboard
 * Return the top 10 games sorted by rating as a mock leaderboard.
 * Each entry includes rank, appid, title, rating, and developer.
 * @param {number|string} appid  (used only to verify the game exists)
 */
export const getLeaderboards = async (appid) => {
  const game = await Game.findOne({ appid: Number(appid) }, { _id: 1 }).lean();
  if (!game) return null;

  const top10 = await Game.find(
    { isDeleted: false },
    { appid: 1, title: 1, rating: 1, developer: 1, downloads: 1, _id: 0 }
  )
    .sort({ rating: -1 })
    .limit(10)
    .lean();

  return top10.map((g, idx) => ({ rank: idx + 1, ...g }));
};

/**
 * GET /api/games/:appid/updates
 * Return the updateHistory array sorted descending (newest first).
 * @param {number|string} appid
 */
export const getUpdates = async (appid) => {
  const game = await Game.findOne(
    { appid: Number(appid) },
    { updateHistory: 1, _id: 0 }
  ).lean();
  if (!game) return null;

  // updateHistory is an array of strings; reverse a copy for descending order
  return [...(game.updateHistory ?? [])].reverse();
};

/**
 * GET /api/games/:appid/news
 * Return a mock 3-item news array derived from the game's own metadata.
 * @param {number|string} appid
 */
export const getNews = async (appid) => {
  const game = await Game.findOne(
    { appid: Number(appid) },
    { title: 1, developer: 1, genres: 1, release_date: 1, _id: 0 }
  ).lean();
  if (!game) return null;

  const title     = game.title     ?? 'the game';
  const developer = game.developer ?? 'the developer';
  const genre     = game.genres?.[0] ?? 'gaming';
  const now       = new Date();
  const oneWeek   = 7 * 24 * 60 * 60 * 1000;

  return [
    {
      id:          1,
      headline:    `${title} receives a major content update`,
      body:        `${developer} has released an extensive content patch for ${title}, adding new ${genre} features and addressing community feedback.`,
      publishedAt: new Date(now - oneWeek).toISOString(),
      source:      'Steam News',
    },
    {
      id:          2,
      headline:    `${title} hits a new concurrent player milestone`,
      body:        `${title} by ${developer} just surpassed its all-time concurrent player record, cementing its place among the top ${genre} titles on Steam.`,
      publishedAt: new Date(now - 2 * oneWeek).toISOString(),
      source:      'Steam Community',
    },
    {
      id:          3,
      headline:    `${developer} teases upcoming DLC for ${title}`,
      body:        `In a recent developer blog, ${developer} hinted at upcoming downloadable content for ${title} that will expand the ${genre} experience significantly.`,
      publishedAt: new Date(now - 3 * oneWeek).toISOString(),
      source:      'Developer Blog',
    },
  ];
};
