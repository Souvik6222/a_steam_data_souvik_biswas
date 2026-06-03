// Import the Game Mongoose model for collection queries and mutations
import Game from '../models/Game.js';
// Import utility to build a MongoDB filter object from request parameters
import buildFilter from '../utils/buildFilter.js';
// Import custom helper to paginate MongoDB query results
import paginate from '../utils/paginate.js';
// Import operational application error class
import AppError from '../utils/AppError.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolve a game by appid (numeric). Throws if not found.
 * @param {number|string} appid
 * @param {object} [projection]
 * @returns {Promise<Document>}
 */
const findByAppid = (appid, projection = {}) =>
  // Query MongoDB for one document matching appid, applying the optional projection field selection
  Game.findOne({ appid: Number(appid) }, projection);

// ── Service functions ─────────────────────────────────────────────────────────

// Map URL query parameter sort names to Mongoose schema paths
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
  // If no sorting is requested, default to newest records first
  if (!sortParam) return { createdAt: -1 };

  // Split string by dash (e.g. "rating-desc" -> ["rating", "desc"])
  const [field, dir] = sortParam.split('-');
  // Retrieve target Mongoose path
  const mongoField = SORT_FIELDS[field];
  // Fall back to newest first if the field is not in our allowed map
  if (!mongoField) return { createdAt: -1 };

  // Construct query object dynamically: dir === 'desc' maps to -1 (descending), otherwise 1 (ascending)
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
  // Extract pagination and sorting parameters, leaving filter parameters inside filterParams via rest operator
  const { sort, page, limit, ...filterParams } = query;
  // Convert standard key-value filter parameters into MongoDB-compatible operators using buildFilter
  const filter  = buildFilter(filterParams);
  // Get MongoDB-compatible sorting object
  const sortDoc = resolveSort(sort);
  // Execute paginated find query
  return paginate(Game, filter, sortDoc, page, limit);
};

/**
 * Fetch a single game by its Steam appid.
 */
export const getGameByAppid = async (appid) => {
  // Query DB using helper
  const game = await findByAppid(appid);
  // If no record returned, throw 404 Not Found error
  if (!game) throw new AppError('Game not found.', 404);
  return game;
};

/**
 * Create a new game document.
 * @param {object} data
 */
export const createGame = async (data) => {
  // Normalize price: if user passed price as a raw number, map it to the PriceSchema structure
  if (typeof data.price === 'number') {
    data.price = {
      original: data.price,
      discounted: data.price,
      discount_percent: 0,
      isFree: data.price === 0,
    };
  }

  // Validate that appid is present and is a positive integer before saving
  const rawId = Number(data.appid);
  if (!Number.isInteger(rawId) || rawId < 1) {
    throw new AppError('appid must be a positive integer.', 400);
  }

  // Count existing documents with matching appid to prevent duplicates
  const exists = await Game.countDocuments({ appid: rawId });
  if (exists > 0) throw new AppError(`A game with appid ${rawId} already exists.`, 409);

  // Write new record to MongoDB
  return Game.create(data);
};

/**
 * Full replacement of a game document (PUT semantics).
 * Replaces all fields except _id and appid.
 * @param {number|string} appid
 * @param {object} data
 */
export const replaceGame = async (appid, data) => {
  // Normalize price field structure if passed as plain number
  if (typeof data.price === 'number') {
    data.price = {
      original: data.price,
      discounted: data.price,
      discount_percent: 0,
      isFree: data.price === 0,
    };
  }
  // Mongoose findOneAndReplace replaces the matching document completely with the new fields
  // - { new: true } returns the replaced document
  // - { runValidators: true } runs schema verification
  const game = await Game.findOneAndReplace(
    { appid: Number(appid) },
    { appid: Number(appid), ...data },
    { new: true, runValidators: true }
  );
  if (!game) throw new AppError('Game not found.', 404);
  return game;
};

/**
 * Partial update of a game document (PATCH semantics).
 * @param {number|string} appid
 * @param {object} data
 */
export const updateGame = async (appid, data) => {
  // Normalize price field structure if passed as plain number
  if (typeof data.price === 'number') {
    data.price = {
      original: data.price,
      discounted: data.price,
      discount_percent: 0,
      isFree: data.price === 0,
    };
  }
  // Mongoose findOneAndUpdate updates specified fields inside the document using MongoDB $set operator
  const game = await Game.findOneAndUpdate(
    { appid: Number(appid) },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!game) throw new AppError('Game not found.', 404);
  return game;
};

/**
 * Hard-delete a game document permanently.
 * @param {number|string} appid
 */
export const deleteGame = async (appid) => {
  // Mongoose findOneAndDelete locates and removes the document matching the AppID
  const game = await Game.findOneAndDelete({ appid: Number(appid) });
  if (!game) throw new AppError('Game not found.', 404);
  return game;
};

/**
 * Check whether a game with the given appid exists.
 * @param {number|string} appid
 * @returns {Promise<boolean>}
 */
export const gameExists = async (appid) => {
  // Check count of matching documents
  const count = await Game.countDocuments({ appid: Number(appid) });
  return count > 0;
};

/**
 * Return a lightweight summary of a game: title, rating, price, genres, platforms.
 * @param {number|string} appid
 */
export const getGameSummary = async (appid) => {
  // Use select projection (e.g. title: 1) to select only required fields and exclude _id
  // .lean() returns plain Javascript objects instead of heavy Mongoose documents, increasing performance
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
  // Flag the document as deleted so it is excluded from public searches but preserved in database
  const game = await Game.findOneAndUpdate(
    { appid: Number(appid) },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!game) throw new AppError('Game not found.', 404);
  return game;
};

/**
 * Restore a soft-deleted game by setting isDeleted:false.
 * @param {number|string} appid
 */
export const restoreGame = async (appid) => {
  // Locate a soft-deleted game and clear the isDeleted flag
  const game = await Game.findOneAndUpdate(
    { appid: Number(appid), isDeleted: true },
    { $set: { isDeleted: false } },
    { new: true }
  );
  if (!game) throw new AppError('Game not found or not archived.', 404);
  return game;
};

/**
 * Find games that share at least one genre with the given game, excluding itself.
 * @param {number|string} appid
 */
export const getRelatedGames = async (appid) => {
  // Lookup original game genres list
  const game = await findByAppid(appid, { genres: 1 });
  if (!game || !game.genres?.length) return [];

  // Query games that:
  // - appid: { $ne: Number(appid) } (not equal to the current game ID to exclude self)
  // - genres: { $in: game.genres } (genres match at least one in the current list)
  // - isDeleted: false (must be an active game)
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
  // Use $in operator to match the requested genre
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
  // If dynamic key exists in list, set filter path matching nested property (e.g. platforms.windows: true)
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
  // Search release dates falling between Jan 1st of year and Jan 1st of year + 1 using $gte and $lt
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
  // Use $gte (Greater Than or Equal) to filter ratings
  const filter = { isDeleted: false, rating: { $gte: Number(rating) } };
  return paginate(Game, filter, resolveSort(sort), page, limit);
};

/** GET /price/:price  — games with price.original <= value */
export const getGamesByMaxPrice = (price, query = {}) => {
  const { sort, page, limit } = query;
  // Use $lte (Less Than or Equal) to filter original pricing
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
  // Lookup standard database boolean key mapping from slug
  const field = FEATURE_FIELD_MAP[feature.toLowerCase()];
  const filter = field
    ? { isDeleted: false, [field]: true }
    : { isDeleted: false };
  return paginate(Game, filter, resolveSort(sort), page, limit);
};

// ── Boolean filter-route services ─────────────────────────────────────────────

// Helper function to unify boolean checks and pagination calls
const filterQuery = (extraFilter, query = {}) => {
  const { sort, page, limit } = query;
  const filter = { isDeleted: false, ...extraFilter };
  return paginate(Game, filter, resolveSort(sort), page, limit);
};

export const getFreeToPlayGames    = (q) => filterQuery({ isFreeToPlay: true },  q);
export const getPaidGames          = (q) => filterQuery({ isFreeToPlay: false }, q);
// Matches discount percent greater than ($gt) 0
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
// Enforces sorting by rating-desc
export const getTopRatedGames     = (q) => filterQuery({}, { ...q, sort: 'rating-desc' });

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
 * Composite score calculation: downloads + (rating * 100).
 * Uses aggregation so no schema change is required.
 */
export const getSortedByPopularityDesc = async (query = {}) => {
  // Sanitize page and limit parameters
  const safePage  = Math.max(1, parseInt(query.page,  10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  // Calculate skip offset
  const skip      = (safePage - 1) * safeLimit;

  // Run database count and aggregation pipeline concurrently to reduce lookup times using Promise.all()
  const [countResult, data] = await Promise.all([
    Game.countDocuments(BASE_FILTER),
    Game.aggregate([
      // Stage 1: Filter out soft deleted records
      { $match: BASE_FILTER },
      // Stage 2: Calculate composite popularityScore using mathematical operators $add and $multiply
      { $addFields: { popularityScore: { $add: ['$downloads', { $multiply: ['$rating', 100] }] } } },
      // Stage 3: Sort by popularityScore descending
      { $sort: { popularityScore: -1 } },
      // Stage 4: Paginate by skipping offset records
      { $skip: skip },
      // Stage 5: Limit to safeLimit page size
      { $limit: safeLimit },
      // Stage 6: Project results to strip out the ephemeral field from the final documents
      { $project: { popularityScore: 0 } }, 
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
  // Query only the screenshots key and exclude internal _id
  const game = await Game.findOne(
    { appid: Number(appid) },
    { screenshots: 1, _id: 0 }
  ).lean();
  if (!game) throw new AppError('Game not found.', 404);
  return game.screenshots;
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
  if (!game) throw new AppError('Game not found.', 404);
  return game.trailers;
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
  if (!game) throw new AppError('Game not found.', 404);
  return game.reviews;
};

/**
 * POST /api/games/:appid/reviews
 * Push a new review object onto game.reviews and save.
 * @param {number|string} appid
 * @param {{ user: string, comment: string, score: number }} reviewData
 */
export const addReview = async (appid, reviewData) => {
  // Locate the game and push the new review object onto the reviews array using MongoDB $push operator
  const game = await Game.findOneAndUpdate(
    { appid: Number(appid) },
    { $push: { reviews: reviewData } },
    { new: true, runValidators: true }
  );
  if (!game) throw new AppError('Game not found.', 404);
  return game;
};

/**
 * PATCH /api/games/:appid/reviews/:reviewId
 * Find the review subdocument by _id and update its fields.
 * @param {number|string} appid
 * @param {string} reviewId
 * @param {{ user?: string, comment?: string, score?: number }} data
 */
export const updateReview = async (appid, reviewId, data) => {
  // Build a dynamic $set object targeting the matched array element via positional operator ($)
  const setFields = {};
  if (data.user    !== undefined) setFields['reviews.$.user']    = data.user;
  if (data.comment !== undefined) setFields['reviews.$.comment'] = data.comment;
  if (data.score   !== undefined) setFields['reviews.$.score']   = data.score;

  // Locate the game containing the specific review _id, and apply the updates to the reviews positional index ($)
  const game = await Game.findOneAndUpdate(
    { appid: Number(appid), 'reviews._id': reviewId },
    { $set: setFields },
    { new: true, runValidators: true }
  );
  if (!game) throw new AppError('Game or review not found.', 404);
  return game;
};

/**
 * DELETE /api/games/:appid/reviews/:reviewId
 * Pull the review with the given _id from the reviews array.
 * @param {number|string} appid
 * @param {string} reviewId
 */
export const deleteReview = async (appid, reviewId) => {
  // Use MongoDB $pull operator to extract/remove review objects that match the specified reviewId _id
  const game = await Game.findOneAndUpdate(
    { appid: Number(appid) },
    { $pull: { reviews: { _id: reviewId } } },
    { new: true }
  );
  if (!game) throw new AppError('Game not found.', 404);
  return game;
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
  if (!game) throw new AppError('Game not found.', 404);
  return game.system_requirements;
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
  if (!game) throw new AppError('Game not found.', 404);
  return game.dlc;
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
  if (!game) throw new AppError('Game not found.', 404);
  return game.achievements;
};

/**
 * GET /api/games/:appid/leaderboard
 * Return the top 10 games sorted by rating as a mock leaderboard.
 * Each entry includes rank, appid, title, rating, and developer.
 * @param {number|string} appid  (used only to verify the game exists)
 */
export const getLeaderboards = async (appid) => {
  // Check if target game exists
  const game = await Game.findOne({ appid: Number(appid) }, { _id: 1 }).lean();
  if (!game) throw new AppError('Game not found.', 404);

  // Query top 10 games sorted by rating descending
  const top10 = await Game.find(
    { isDeleted: false },
    { appid: 1, title: 1, rating: 1, developer: 1, downloads: 1, _id: 0 }
  )
    .sort({ rating: -1 })
    .limit(10)
    .lean();

  // Map elements to inject rank indices (1 to 10)
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
  if (!game) throw new AppError('Game not found.', 404);

  // Copy elements using spread operator and reverse the array copy to preserve newest updates first
  return [...(game.updateHistory ?? [])].reverse();
};

/**
 * GET /api/games/:appid/news
 * Return a mock 3-item news array derived from the game's own metadata.
 * @param {number|string} appid
 */
export const getNews = async (appid) => {
  // Extract parameters
  const game = await Game.findOne(
    { appid: Number(appid) },
    { title: 1, developer: 1, genres: 1, release_date: 1, _id: 0 }
  ).lean();
  if (!game) throw new AppError('Game not found.', 404);

  // Fallback defaults
  const title     = game.title     ?? 'the game';
  const developer = game.developer ?? 'the developer';
  const genre     = game.genres?.[0] ?? 'gaming';
  const now       = new Date();
  const oneWeek   = 7 * 24 * 60 * 60 * 1000;

  // Build a list of realistic news articles using mock text strings
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

// ── Advanced service functions ────────────────────────────────────────────────

/**
 * GET /api/v1/games/random
 * Return one random active game using $sample aggregation.
 * @returns {Promise<object|null>}
 */
export const getRandomGame = async () => {
  // Use MongoDB $sample operator which randomly selects documents from the collection
  const result = await Game.aggregate([
    { $match: { isDeleted: false } },
    { $sample: { size: 1 } },
  ]);
  return result.length > 0 ? result[0] : null;
};

/**
 * GET /api/v1/compare/games/:id1/:id2
 * Fetch two games by appid and return them side-by-side.
 * @param {number|string} id1
 * @param {number|string} id2
 * @returns {Promise<{ game1: object|null, game2: object|null }>}
 */
export const compareGames = async (id1, id2) => {
  // Fetch both records concurrently using Promise.all
  const [game1, game2] = await Promise.all([
    Game.findOne({ appid: Number(id1) }).lean(),
    Game.findOne({ appid: Number(id2) }).lean(),
  ]);
  return { game1, game2 };
};

/**
 * GET /api/v1/timeline/game/:appid
 * Return the updateHistory of a game sorted chronologically (newest first).
 * @param {number|string} appid
 * @returns {Promise<string[]|null>}
 */
export const getTimeline = async (appid) => {
  const game = await Game.findOne(
    { appid: Number(appid) },
    { updateHistory: 1, title: 1, appid: 1, _id: 0 }
  ).lean();
  if (!game) return null;

  // Reverse copy
  const timeline = [...(game.updateHistory ?? [])].reverse();
  return { appid: game.appid, title: game.title, timeline };
};

/**
 * GET /api/v1/recommendations/games/:appid
 * Find top 5 games that share the most genres with the given game.
 * @param {number|string} appid
 * @returns {Promise<object[]|null>}
 */
export const getRecommendations = async (appid) => {
  // Query original genres
  const game = await Game.findOne(
    { appid: Number(appid) },
    { genres: 1, _id: 0 }
  ).lean();
  if (!game || !game.genres?.length) return null;

  // Query top 5 highest-rated active games matching at least one genre
  return Game.find({
    appid: { $ne: Number(appid) },
    genres: { $in: game.genres },
    isDeleted: false,
  })
    .sort({ rating: -1 })
    .limit(5)
    .lean();
};

/**
 * GET /api/v1/trending/games
 * Return top 10 games by downloads released in the last 90 days.
 * @returns {Promise<object[]>}
 */
export const getTrendingGames = async () => {
  // Calculate date offset (90 days = 90 days * 24 hours * 60 min * 60 sec * 1000 ms)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  return Game.find({
    isDeleted: false,
    release_date: { $gte: ninetyDaysAgo },
  })
    .sort({ downloads: -1 })
    .limit(10)
    .lean();
};
