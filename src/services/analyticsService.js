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

// Import the Mongoose model representing the steam games collection
import Game from '../models/Game.js';

// ── Shared base filter ────────────────────────────────────────────────────────
// Standard match condition to filter out soft-deleted documents
const ACTIVE = { isDeleted: false };

// ── Shared $project for list results ─────────────────────────────────────────
// projection document to limit fields returned by MongoDB (1 = include, 0 = exclude)
const GAME_LIST_PROJECT = {
  _id:       0, // Exclude the MongoDB Object _id
  appid:     1, // Include appid
  title:     1, // Include title
  developer: 1, // Include developer name
  rating:    1, // Include user rating
  downloads: 1, // Include download count
  'price.original': 1, // Include nested original price
  genres:    1, // Include genres array
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. TOP RATED
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns the 10 highest-rated active games.
 * Pipeline: $match → $sort → $limit → $project
 */
export const topRated = () =>
  // Game.aggregate executes a list of pipeline stages sequentially
  Game.aggregate([
    // Stage 1: Filter active games
    { $match: ACTIVE },
    // Stage 2: Sort by rating field descending (-1 = desc, 1 = asc)
    { $sort: { rating: -1 } },
    // Stage 3: Limit the output array size to 10
    { $limit: 10 },
    // Stage 4: Apply field filter projection
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
    // Stage 1: Filter active records
    { $match: ACTIVE },
    // Stage 2: Sort by downloads field descending
    { $sort: { downloads: -1 } },
    // Stage 3: Return only top 10
    { $limit: 10 },
    // Stage 4: Apply field filter projection
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
    // Stage 1: Filter active games
    { $match: ACTIVE },
    // Stage 2: Group documents by developer
    {
      $group: {
        // Group key: the 'developer' field (each unique developer gets one group)
        _id:           '$developer',
        // Multiply original price by downloads for each game, and sum ($sum) the results
        totalRevenue:  { $sum: { $multiply: ['$price.original', '$downloads'] } },
        // Sum total downloads for this developer
        totalDownloads:{ $sum: '$downloads' },
        // Count total games published by this developer ($sum: 1 acts as a counter)
        gameCount:     { $sum: 1 },
        // Compute mathematical average ($avg) of game original prices
        avgPrice:      { $avg: '$price.original' },
      },
    },
    // Stage 3: Sort resulting groups by totalRevenue descending
    { $sort: { totalRevenue: -1 } },
    // Stage 4: Reshape output document keys
    {
      $project: {
        _id:            0, // Suppress group ID from output
        developer:      '$_id', // Map group ID back to developer name
        totalRevenue:   { $round: ['$totalRevenue', 2] }, // Round revenue float to 2 decimal places
        totalDownloads: 1,
        gameCount:      1,
        avgPrice:       { $round: ['$avgPrice', 2] }, // Round average price float to 2 decimal places
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
    // Stage 1: Filter active records
    { $match: ACTIVE },
    // Stage 2: Accumulate counts into a single summary group (_id: null)
    {
      $group: {
        _id:     null, // Single group aggregating all documents
        // If platforms.windows boolean is true ($cond), add 1 to the sum, else add 0
        windows: { $sum: { $cond: ['$platforms.windows', 1, 0] } },
        // If platforms.mac is true, add 1, else add 0
        mac:     { $sum: { $cond: ['$platforms.mac',     1, 0] } },
        // If platforms.linux is true, add 1, else add 0
        linux:   { $sum: { $cond: ['$platforms.linux',   1, 0] } },
        // Total active game documents in collection
        total:   { $sum: 1 },
      },
    },
    // Stage 3: Reshape output fields
    {
      $project: {
        _id:     0, // Exclude null group key
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
    // Stage 1: Filter active records
    { $match: ACTIVE },
    // Stage 2: Deconstruct ("unwind") the genres array field.
    // If a game has genres ["Action", "RPG"], unwind creates two duplicate documents:
    // one with genres: "Action", and one with genres: "RPG".
    { $unwind: { path: '$genres', preserveNullAndEmptyArrays: false } },
    // Stage 3: Group by the unwound genre field
    {
      $group: {
        _id:       '$genres', // Group key is the single genre name
        gameCount: { $sum: 1 }, // Count total games belonging to this genre
        avgRating: { $avg: '$rating' }, // Calculate average user rating for this genre
      },
    },
    // Stage 4: Sort genres by total gameCount descending
    { $sort: { gameCount: -1 } },
    // Stage 5: Reshape keys and round rating float values
    {
      $project: {
        _id:       0,
        genre:     '$_id', // Map group key back to genre string
        gameCount: 1,
        avgRating: { $round: ['$avgRating', 2] }, // Round average rating float
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
  // $$NOW is a MongoDB system variable representing the current date-time — no JS Date arithmetic enters the pipeline
  return Game.aggregate([
    // Stage 1: Filter games matching criteria
    {
      $match: {
        isDeleted: false,
        // $expr allows utilizing aggregation operators inside a standard query $match stage
        $expr: {
          // Compare release_date to be greater than or equal ($gte) to calculated offset date
          $gte: [
            '$release_date',
            {
              // Subtract 6 months from the current database execution date ($$NOW)
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
    // Stage 2: Sort descending by downloads first, then by rating as tiebreaker
    { $sort: { downloads: -1, rating: -1 } },
    // Stage 3: Return top 20 trending games
    { $limit: 20 },
    // Stage 4: Apply projection layout and include release date
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
    // Stage 1: Filter out soft deleted games and games missing release dates
    { $match: { isDeleted: false, release_date: { $exists: true, $ne: null } } },
    // Stage 2: Group games by release year
    {
      $group: {
        // Use $year aggregation operator to parse and extract the 4-digit calendar year (e.g. 2024) from release_date Date object
        _id:           { $year: '$release_date' },
        gameCount:     { $sum: 1 }, // Count total games released in that year
        avgRating:     { $avg: '$rating' }, // Average rating of games in that year
        totalDownloads:{ $sum: '$downloads' }, // Total downloads for that year's releases
      },
    },
    // Stage 3: Sort chronologically by year ascending
    { $sort: { _id: 1 } },
    // Stage 4: Reshape properties
    {
      $project: {
        _id:            0,
        year:           '$_id', // Map year group key
        gameCount:      1,
        avgRating:      { $round: ['$avgRating', 2] }, // Round avg rating
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
    // Stage 1: Filter games with at least 1 review (checks if index 0 in reviews array exists)
    { $match: { isDeleted: false, 'reviews.0': { $exists: true } } }, 
    // Stage 2: Explode the embedded reviews array into duplicate documents for each individual review
    { $unwind: '$reviews' },
    // Stage 3: Group by unique game AppID
    {
      $group: {
        _id:         '$appid',
        title:       { $first: '$title' }, // Capture first title matching group
        developer:   { $first: '$developer' }, // Capture developer
        avgScore:    { $avg: '$reviews.score' }, // Compute average review score from exploded reviews
        reviewCount: { $sum: 1 }, // Sum total reviews count
        minScore:    { $min: '$reviews.score' }, // Get lowest score in review groups
        maxScore:    { $max: '$reviews.score' }, // Get highest score in review groups
      },
    },
    // Stage 4: Sort by calculated average review score descending
    { $sort: { avgScore: -1 } },
    // Stage 5: Reshape keys and round calculations
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
    // Stage 1: Filter active games
    { $match: ACTIVE },
    // Stage 2: Sort by downloads descending
    { $sort: { downloads: -1 } },
    // Stage 3: Fetch top 10
    { $limit: 10 },
    // Stage 4: Reshape and map downloads count to a proxy key name (estimatedWishlists)
    {
      $project: {
        _id:              0,
        appid:            1,
        title:            1,
        developer:        1,
        downloads:        1,
        rating:           1,
        estimatedWishlists: '$downloads', // Map downloads value to estimatedWishlists label
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
    // Stage 1: Filter active records
    { $match: ACTIVE },
    // Stage 2: Group by developer name
    {
      $group: {
        _id:            '$developer',
        gameCount:      { $sum: 1 }, // Total game releases count
        avgRating:      { $avg: '$rating' }, // Average rating
        totalDownloads: { $sum: '$downloads' }, // Sum of total downloads
        latestRelease:  { $max: '$release_date' }, // Find most recent release date using $max operator
      },
    },
    // Stage 3: Sort by publishers with most games first, using downloads as tiebreaker
    { $sort: { gameCount: -1, totalDownloads: -1 } },
    // Stage 4: Reshape output
    {
      $project: {
        _id:            0,
        developer:      '$_id',
        gameCount:      1,
        avgRating:      { $round: ['$avgRating', 2] }, // Round average rating
        totalDownloads: 1,
        latestRelease:  1,
      },
    },
  ]);
