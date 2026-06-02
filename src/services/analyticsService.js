/**
 * analyticsService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All analytics are computed exclusively via MongoDB aggregation pipelines.
 * No JavaScript arithmetic, filtering, or sorting happens outside the DB.
 *
 * Exported functions:
 *   topRated            – top 10 by rating
 *   mostDownloaded      – top 10 by downloads
 *   revenueByDeveloper  – estimated revenue = SUM(price.original × downloads) per developer
 *   platformDistribution– count of games supporting each platform (windows/mac/linux)
 *   genreDistribution   – count of games per genre (via $unwind)
 *   trending            – games released in last 6 months, sorted by downloads desc then rating desc
 *   releaseTrends       – game count grouped by release year
 *   reviewAnalysis      – per-game average review score (via $unwind)
 *   wishlistAnalysis    – top 10 by downloads as wishlist proxy
 *   userActivity        – per-developer: game count + average rating
 */

import Game from '../models/Game.js';

// ── Shared base filter ────────────────────────────────────────────────────────
const ACTIVE = { isDeleted: false };

// ── Shared $project for list results ─────────────────────────────────────────
const GAME_LIST_PROJECT = {
  _id:       0,
  appid:     1,
  title:     1,
  developer: 1,
  rating:    1,
  downloads: 1,
  'price.original': 1,
  genres:    1,
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. TOP RATED
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns the 10 highest-rated active games.
 * Pipeline: $match → $sort → $limit → $project
 */
export const topRated = () =>
  Game.aggregate([
    { $match: ACTIVE },
    { $sort: { rating: -1 } },
    { $limit: 10 },
    { $project: GAME_LIST_PROJECT },
  ]);

// ─────────────────────────────────────────────────────────────────────────────
// 2. MOST DOWNLOADED
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns the 10 most-downloaded active games.
 * Pipeline: $match → $sort → $limit → $project
 */
export const mostDownloaded = () =>
  Game.aggregate([
    { $match: ACTIVE },
    { $sort: { downloads: -1 } },
    { $limit: 10 },
    { $project: GAME_LIST_PROJECT },
  ]);

// ─────────────────────────────────────────────────────────────────────────────
// 3. REVENUE BY DEVELOPER
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Estimated revenue = SUM(price.original × downloads) grouped by developer.
 * Entirely computed inside MongoDB via $multiply inside $group.$sum.
 * Pipeline: $match → $group → $sort → $project
 */
export const revenueByDeveloper = () =>
  Game.aggregate([
    { $match: ACTIVE },
    {
      $group: {
        _id:           '$developer',
        totalRevenue:  { $sum: { $multiply: ['$price.original', '$downloads'] } },
        totalDownloads:{ $sum: '$downloads' },
        gameCount:     { $sum: 1 },
        avgPrice:      { $avg: '$price.original' },
      },
    },
    { $sort: { totalRevenue: -1 } },
    {
      $project: {
        _id:            0,
        developer:      '$_id',
        totalRevenue:   { $round: ['$totalRevenue', 2] },
        totalDownloads: 1,
        gameCount:      1,
        avgPrice:       { $round: ['$avgPrice', 2] },
      },
    },
  ]);

// ─────────────────────────────────────────────────────────────────────────────
// 4. PLATFORM DISTRIBUTION
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Counts games supporting each platform (windows / mac / linux).
 * Uses $cond inside $group to convert boolean fields to counts.
 * Pipeline: $match → $group (single group, sum booleans)
 */
export const platformDistribution = () =>
  Game.aggregate([
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
    {
      $project: {
        _id:     0,
        windows: 1,
        mac:     1,
        linux:   1,
        total:   1,
      },
    },
  ]);

// ─────────────────────────────────────────────────────────────────────────────
// 5. GENRE DISTRIBUTION
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Counts games per genre.
 * $unwind explodes the genres array so each genre gets its own document,
 * then $group counts occurrences.
 * Pipeline: $match → $unwind → $group → $sort → $project
 */
export const genreDistribution = () =>
  Game.aggregate([
    { $match: ACTIVE },
    { $unwind: { path: '$genres', preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id:       '$genres',
        gameCount: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
    { $sort: { gameCount: -1 } },
    {
      $project: {
        _id:       0,
        genre:     '$_id',
        gameCount: 1,
        avgRating: { $round: ['$avgRating', 2] },
      },
    },
  ]);

// ─────────────────────────────────────────────────────────────────────────────
// 6. TRENDING
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Games released in the last 6 months, sorted by downloads desc then rating desc.
 * The 6-month cutoff date is computed via $expr + $gte inside $match so it
 * happens entirely on the DB side.
 * Pipeline: $match(isDeleted + release_date) → $sort → $limit → $project
 */
export const trending = () => {
  // $$NOW is a MongoDB system variable — no JS Date arithmetic enters the pipeline
  return Game.aggregate([
    {
      $match: {
        isDeleted: false,
        $expr: {
          $gte: [
            '$release_date',
            {
              $dateSubtract: {
                startDate: '$$NOW',
                unit:      'month',
                amount:    6,
              },
            },
          ],
        },
      },
    },
    { $sort: { downloads: -1, rating: -1 } },
    { $limit: 20 },
    { $project: { ...GAME_LIST_PROJECT, release_date: 1 } },
  ]);
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. RELEASE TRENDS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Count of games released per year.
 * $year operator on release_date field — no JS date parsing.
 * Pipeline: $match → $group(by year) → $sort → $project
 */
export const releaseTrends = () =>
  Game.aggregate([
    { $match: { isDeleted: false, release_date: { $exists: true, $ne: null } } },
    {
      $group: {
        _id:           { $year: '$release_date' },
        gameCount:     { $sum: 1 },
        avgRating:     { $avg: '$rating' },
        totalDownloads:{ $sum: '$downloads' },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id:            0,
        year:           '$_id',
        gameCount:      1,
        avgRating:      { $round: ['$avgRating', 2] },
        totalDownloads: 1,
      },
    },
  ]);

// ─────────────────────────────────────────────────────────────────────────────
// 8. REVIEW ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Per-game average review score from embedded reviews array.
 * $unwind explodes reviews subdocuments, $group re-aggregates by appid.
 * Pipeline: $match → $unwind → $group → $sort → $project
 */
export const reviewAnalysis = () =>
  Game.aggregate([
    { $match: { isDeleted: false, 'reviews.0': { $exists: true } } }, // only games with ≥1 review
    { $unwind: '$reviews' },
    {
      $group: {
        _id:         '$appid',
        title:       { $first: '$title' },
        developer:   { $first: '$developer' },
        avgScore:    { $avg: '$reviews.score' },
        reviewCount: { $sum: 1 },
        minScore:    { $min: '$reviews.score' },
        maxScore:    { $max: '$reviews.score' },
      },
    },
    { $sort: { avgScore: -1 } },
    {
      $project: {
        _id:         0,
        appid:       '$_id',
        title:       1,
        developer:   1,
        avgScore:    { $round: ['$avgScore', 2] },
        reviewCount: 1,
        minScore:    1,
        maxScore:    1,
      },
    },
  ]);

// ─────────────────────────────────────────────────────────────────────────────
// 9. WISHLIST ANALYSIS (proxy via downloads)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Wishlist data is not stored in the schema; top-10 by downloads serves as
 * a realistic proxy (high downloads correlates with wishlisting behaviour).
 * Pipeline: $match → $sort → $limit → $project
 */
export const wishlistAnalysis = () =>
  Game.aggregate([
    { $match: ACTIVE },
    { $sort: { downloads: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id:              0,
        appid:            1,
        title:            1,
        developer:        1,
        downloads:        1,
        rating:           1,
        estimatedWishlists: '$downloads', // proxy label
      },
    },
  ]);

// ─────────────────────────────────────────────────────────────────────────────
// 10. USER ACTIVITY (per-developer)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Groups active games by developer and computes:
 *   gameCount    – number of published games
 *   avgRating    – average rating across their catalogue
 *   totalDownloads – sum of downloads
 *   latestRelease  – most recent release_date ($max)
 * Pipeline: $match → $group → $sort → $project
 */
export const userActivity = () =>
  Game.aggregate([
    { $match: ACTIVE },
    {
      $group: {
        _id:            '$developer',
        gameCount:      { $sum: 1 },
        avgRating:      { $avg: '$rating' },
        totalDownloads: { $sum: '$downloads' },
        latestRelease:  { $max: '$release_date' },
      },
    },
    { $sort: { gameCount: -1, totalDownloads: -1 } },
    {
      $project: {
        _id:            0,
        developer:      '$_id',
        gameCount:      1,
        avgRating:      { $round: ['$avgRating', 2] },
        totalDownloads: 1,
        latestRelease:  1,
      },
    },
  ]);
