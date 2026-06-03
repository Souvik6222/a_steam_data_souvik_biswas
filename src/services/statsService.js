/**
 * statsService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight aggregate statistics computed entirely inside MongoDB.
 * Every value is produced by a pipeline stage — no JS arithmetic used.
 *
 * Exported functions:
 *   count             – total active game count
 *   topRated          – top 10 by rating
 *   mostDownloaded    – top 10 by downloads
 *   averagePrice      – $avg of price.original across all active games
 *   averageRating     – $avg of rating across all active games
 *   genreCount        – game count per genre ($unwind + $group)
 *   platformCount     – games per platform (windows / mac / linux)
 *   freeToPlayCount   – count of free-to-play games
 *   multiplayerCount  – count of multiplayer games
 *   monthlyReleases   – game count grouped by year + month
 */

// Import Mongoose model
import Game from '../models/Game.js';

// ── Shared base filter ────────────────────────────────────────────────────────
// Query condition matching active games
const ACTIVE = { isDeleted: false };

// ─────────────────────────────────────────────────────────────────────────────
// 1. COUNT
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns { count: N } via the $count aggregation stage.
 * Pipeline: $match → $count
 */
export const count = async () => {
  // Execute database count using aggregate pipeline
  const result = await Game.aggregate([
    // Stage 1: Filter active games
    { $match: ACTIVE },
    // Stage 2: Aggregate count of matched records into a property named 'count'
    { $count: 'count' },
  ]);
  // Return the first element of results array, or fallback default values if collection is empty
  return result[0] ?? { count: 0 };
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. TOP RATED
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Top 10 active games by rating.
 * Pipeline: $match → $sort → $limit → $project
 */
export const topRated = () =>
  Game.aggregate([
    { $match: ACTIVE },
    { $sort: { rating: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id:       0,
        appid:     1,
        title:     1,
        developer: 1,
        rating:    1,
        downloads: 1,
      },
    },
  ]);

// ─────────────────────────────────────────────────────────────────────────────
// 3. MOST DOWNLOADED
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Top 10 active games by downloads.
 * Pipeline: $match → $sort → $limit → $project
 */
export const mostDownloaded = () =>
  Game.aggregate([
    { $match: ACTIVE },
    { $sort: { downloads: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id:       0,
        appid:     1,
        title:     1,
        developer: 1,
        downloads: 1,
        rating:    1,
      },
    },
  ]);

// ─────────────────────────────────────────────────────────────────────────────
// 4. AVERAGE PRICE
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns the mean price.original and min/max across all active games.
 * $group with _id:null aggregates the entire collection.
 * Pipeline: $match → $group(null) → $project
 */
export const averagePrice = async () => {
  const result = await Game.aggregate([
    // Stage 1: Filter active games
    { $match: ACTIVE },
    // Stage 2: Group all documents together to calculate aggregate stats
    {
      $group: {
        _id:      null, // Single group aggregating all documents
        avgPrice: { $avg: '$price.original' }, // Compute average original price
        minPrice: { $min: '$price.original' }, // Find minimum original price
        maxPrice: { $max: '$price.original' }, // Find maximum original price
        total:    { $sum: 1 }, // Count total documents
      },
    },
    // Stage 3: Project fields, rounding the average price to 2 decimals
    {
      $project: {
        _id:      0,
        avgPrice: { $round: ['$avgPrice', 2] },
        minPrice: 1,
        maxPrice: 1,
        total:    1,
      },
    },
  ]);
  return result[0] ?? { avgPrice: 0, minPrice: 0, maxPrice: 0, total: 0 };
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. AVERAGE RATING
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns the mean rating and min/max across all active games.
 * Pipeline: $match → $group(null) → $project
 */
export const averageRating = async () => {
  const result = await Game.aggregate([
    { $match: ACTIVE },
    {
      $group: {
        _id:       null, // Single group
        avgRating: { $avg: '$rating' }, // Average rating
        minRating: { $min: '$rating' }, // Minimum rating
        maxRating: { $max: '$rating' }, // Maximum rating
        total:     { $sum: 1 }, // Total documents count
      },
    },
    {
      $project: {
        _id:       0,
        avgRating: { $round: ['$avgRating', 2] },
        minRating: 1,
        maxRating: 1,
        total:     1,
      },
    },
  ]);
  return result[0] ?? { avgRating: 0, minRating: 0, maxRating: 0, total: 0 };
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. GENRE COUNT
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Number of active games per genre.
 * $unwind explodes the array; $group counts each genre occurrence.
 * Pipeline: $match → $unwind → $group → $sort → $project
 */
export const genreCount = () =>
  Game.aggregate([
    { $match: ACTIVE },
    // Stage 2: Explode the genres array so each array element gets its own document
    { $unwind: { path: '$genres', preserveNullAndEmptyArrays: false } },
    // Stage 3: Group by genre string and sum total count
    {
      $group: {
        _id:   '$genres',
        count: { $sum: 1 },
      },
    },
    // Stage 4: Sort descending by count
    { $sort: { count: -1 } },
    // Stage 5: Reshape keys
    {
      $project: {
        _id:   0,
        genre: '$_id',
        count: 1,
      },
    },
  ]);

// ─────────────────────────────────────────────────────────────────────────────
// 7. PLATFORM COUNT
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Number of active games available on each platform.
 * Boolean platform fields are summed via $cond inside a single $group.
 * Pipeline: $match → $group(null) → $project
 */
export const platformCount = async () => {
  const result = await Game.aggregate([
    { $match: ACTIVE },
    {
      $group: {
        _id:     null, // Single group
        // If platforms.windows evaluates to true, add 1, else add 0
        windows: { $sum: { $cond: ['$platforms.windows', 1, 0] } },
        mac:     { $sum: { $cond: ['$platforms.mac',     1, 0] } },
        linux:   { $sum: { $cond: ['$platforms.linux',   1, 0] } },
        total:   { $sum: 1 },
      },
    },
    { $project: { _id: 0, windows: 1, mac: 1, linux: 1, total: 1 } },
  ]);
  return result[0] ?? { windows: 0, mac: 0, linux: 0, total: 0 };
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. FREE-TO-PLAY COUNT
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Count of active games with isFreeToPlay:true.
 * Pipeline: $match(isDeleted+isFreeToPlay) → $count
 */
export const freeToPlayCount = async () => {
  const result = await Game.aggregate([
    { $match: { isDeleted: false, isFreeToPlay: true } },
    { $count: 'count' },
  ]);
  return result[0] ?? { count: 0 };
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. MULTIPLAYER COUNT
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Count of active games with isMultiplayer:true.
 * Pipeline: $match(isDeleted+isMultiplayer) → $count
 */
export const multiplayerCount = async () => {
  const result = await Game.aggregate([
    { $match: { isDeleted: false, isMultiplayer: true } },
    { $count: 'count' },
  ]);
  return result[0] ?? { count: 0 };
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. MONTHLY RELEASES
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Count of games released each calendar month.
 * $year and $month operators produce the grouping key; no JS date parsing.
 * Pipeline: $match → $group(year+month) → $sort → $project
 */
export const monthlyReleases = () =>
  Game.aggregate([
    // Stage 1: Filter games with a valid release date
    { $match: { isDeleted: false, release_date: { $exists: true, $ne: null } } },
    // Stage 2: Group games by release year and month
    {
      $group: {
        _id: {
          // Extract calendar year
          year:  { $year:  '$release_date' },
          // Extract calendar month (1 to 12)
          month: { $month: '$release_date' },
        },
        count:          { $sum: 1 }, // Total count for that month
        avgRating:      { $avg: '$rating' }, // Average rating
        totalDownloads: { $sum: '$downloads' }, // Total downloads
      },
    },
    // Stage 3: Sort chronologically by year, then by month
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    // Stage 4: Reshape output fields
    {
      $project: {
        _id:            0,
        year:           '$_id.year',
        month:          '$_id.month',
        count:          1,
        avgRating:      { $round: ['$avgRating', 2] }, // Round average rating float
        totalDownloads: 1,
      },
    },
  ]);
