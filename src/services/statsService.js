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

import Game from '../models/Game.js';

// ── Shared base filter ────────────────────────────────────────────────────────
const ACTIVE = { isDeleted: false };

// ─────────────────────────────────────────────────────────────────────────────
// 1. COUNT
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns { count: N } via the $count aggregation stage.
 * Pipeline: $match → $count
 */
export const count = async () => {
  const result = await Game.aggregate([
    { $match: ACTIVE },
    { $count: 'count' },
  ]);
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
    { $match: ACTIVE },
    {
      $group: {
        _id:      null,
        avgPrice: { $avg: '$price.original' },
        minPrice: { $min: '$price.original' },
        maxPrice: { $max: '$price.original' },
        total:    { $sum: 1 },
      },
    },
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
        _id:       null,
        avgRating: { $avg: '$rating' },
        minRating: { $min: '$rating' },
        maxRating: { $max: '$rating' },
        total:     { $sum: 1 },
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
    { $unwind: { path: '$genres', preserveNullAndEmpty: false } },
    {
      $group: {
        _id:   '$genres',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
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
        _id:     null,
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
    { $match: { isDeleted: false, release_date: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: {
          year:  { $year:  '$release_date' },
          month: { $month: '$release_date' },
        },
        count:          { $sum: 1 },
        avgRating:      { $avg: '$rating' },
        totalDownloads: { $sum: '$downloads' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id:            0,
        year:           '$_id.year',
        month:          '$_id.month',
        count:          1,
        avgRating:      { $round: ['$avgRating', 2] },
        totalDownloads: 1,
      },
    },
  ]);
