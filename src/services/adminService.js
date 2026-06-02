/**
 * adminService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin-only aggregation pipelines.  No JS computation — everything is
 * calculated inside MongoDB.
 *
 * Exported functions:
 *   getAllGamesAdmin     – full game list including archived (isDeleted:true)
 *   getAnalyticsSummary – single $facet pipeline: total, avgRating, avgPrice,
 *                         platformDist, genreDist
 *   getReports          – $facet across Game + $lookup to User for totalUsers,
 *                         totalGames, and the 10 most recently updated games
 */

import Game from '../models/Game.js';
import User from '../models/User.js';

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET ALL GAMES (ADMIN — includes archived)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns every game document regardless of isDeleted flag, with a curated
 * admin projection.  Supports optional sort / page / limit from query params.
 *
 * @param {{ sort?: string, page?: string, limit?: string }} query
 */
export const getAllGamesAdmin = async (query = {}) => {
  const safePage  = Math.max(1, parseInt(query.page,  10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip      = (safePage - 1) * safeLimit;

  // Allowed sort fields → MongoDB field paths
  const SORT_MAP = {
    rating:      { rating: -1 },
    downloads:   { downloads: -1 },
    price:       { 'price.original': 1 },
    title:       { title: 1 },
    releaseDate: { release_date: -1 },
    createdAt:   { createdAt: -1 },
  };
  const sortDoc = SORT_MAP[query.sort] ?? { createdAt: -1 };

  const [countResult, data] = await Promise.all([
    Game.aggregate([{ $count: 'total' }]),
    Game.aggregate([
      // NO $match on isDeleted — admin sees everything
      { $sort: sortDoc },
      { $skip: skip },
      { $limit: safeLimit },
      {
        $project: {
          appid:       1,
          title:       1,
          developer:   1,
          publisher:   1,
          rating:      1,
          downloads:   1,
          isDeleted:   1,   // admin-visible field
          isEarlyAccess: 1,
          isFreeToPlay:  1,
          genres:      1,
          platforms:   1,
          'price.original': 1,
          release_date: 1,
          createdAt:   1,
          updatedAt:   1,
        },
      },
    ]),
  ]);

  const total = countResult[0]?.total ?? 0;

  return {
    data,
    total,
    page:       safePage,
    limit:      safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. ANALYTICS SUMMARY  (one $facet round-trip)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns a single aggregated object with five sub-results computed
 * in one query via $facet:
 *   totalGames       – count of ALL games (including archived)
 *   activeGames      – count of non-deleted games
 *   archivedGames    – count of deleted games
 *   avgRating        – mean rating across active games
 *   avgPrice         – mean price.original across active games
 *   platformDist     – { windows, mac, linux } counts for active games
 *   genreDist        – [{ genre, count }] sorted desc for active games
 */
export const getAnalyticsSummary = async () => {
  const result = await Game.aggregate([
    {
      $facet: {
        // ── Total counts (no isDeleted filter) ─────────────────────────────
        totalGames: [
          { $count: 'count' },
        ],

        // ── Active / archived split ─────────────────────────────────────────
        statusSplit: [
          {
            $group: {
              _id:      '$isDeleted',
              count:    { $sum: 1 },
            },
          },
        ],

        // ── Average rating (active only) ────────────────────────────────────
        avgRating: [
          { $match: { isDeleted: false } },
          {
            $group: {
              _id:       null,
              avgRating: { $avg: '$rating' },
              minRating: { $min: '$rating' },
              maxRating: { $max: '$rating' },
            },
          },
          {
            $project: {
              _id:       0,
              avgRating: { $round: ['$avgRating', 2] },
              minRating: 1,
              maxRating: 1,
            },
          },
        ],

        // ── Average price (active only) ─────────────────────────────────────
        avgPrice: [
          { $match: { isDeleted: false } },
          {
            $group: {
              _id:      null,
              avgPrice: { $avg: '$price.original' },
              minPrice: { $min: '$price.original' },
              maxPrice: { $max: '$price.original' },
            },
          },
          {
            $project: {
              _id:      0,
              avgPrice: { $round: ['$avgPrice', 2] },
              minPrice: 1,
              maxPrice: 1,
            },
          },
        ],

        // ── Platform distribution (active only) ─────────────────────────────
        platformDist: [
          { $match: { isDeleted: false } },
          {
            $group: {
              _id:     null,
              windows: { $sum: { $cond: ['$platforms.windows', 1, 0] } },
              mac:     { $sum: { $cond: ['$platforms.mac',     1, 0] } },
              linux:   { $sum: { $cond: ['$platforms.linux',   1, 0] } },
            },
          },
          { $project: { _id: 0, windows: 1, mac: 1, linux: 1 } },
        ],

        // ── Genre distribution (active only) ────────────────────────────────
        genreDist: [
          { $match: { isDeleted: false } },
          { $unwind: { path: '$genres', preserveNullAndEmptyArrays: false } },
          {
            $group: {
              _id:   '$genres',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 20 },
          { $project: { _id: 0, genre: '$_id', count: 1 } },
        ],
      },
    },

    // ── Reshape $facet output into a clean flat object ──────────────────────
    {
      $project: {
        totalGames:   { $ifNull: [{ $arrayElemAt: ['$totalGames.count', 0] }, 0] },
        activeGames: {
          $ifNull: [
            {
              $getField: {
                field: 'count',
                input: {
                  $first: {
                    $filter: {
                      input: '$statusSplit',
                      cond:  { $eq: ['$$this._id', false] },
                    },
                  },
                },
              },
            },
            0,
          ],
        },
        archivedGames: {
          $ifNull: [
            {
              $getField: {
                field: 'count',
                input: {
                  $first: {
                    $filter: {
                      input: '$statusSplit',
                      cond:  { $eq: ['$$this._id', true] },
                    },
                  },
                },
              },
            },
            0,
          ],
        },
        avgRating:    { $arrayElemAt: ['$avgRating',    0] },
        avgPrice:     { $arrayElemAt: ['$avgPrice',     0] },
        platformDist: { $arrayElemAt: ['$platformDist', 0] },
        genreDist:    '$genreDist',
      },
    },
  ]);

  return result[0];
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. REPORTS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns a dashboard report object:
 *   totalUsers      – User collection count via $lookup
 *   totalGames      – Game collection count (all)
 *   activeGames     – non-deleted count
 *   archivedGames   – soft-deleted count
 *   recentActivity  – 10 most recently updated games (any status)
 *
 * Implemented as two parallel aggregations (Game doesn't embed Users) to keep
 * the pipeline readable; both are awaited concurrently with Promise.all.
 */
export const getReports = async () => {
  const [gameReport, userCount] = await Promise.all([
    // ── Game facet ──────────────────────────────────────────────────────────
    Game.aggregate([
      {
        $facet: {
          counts: [
            {
              $group: {
                _id:      '$isDeleted',
                count:    { $sum: 1 },
              },
            },
          ],
          recentActivity: [
            { $sort: { updatedAt: -1 } },
            { $limit: 10 },
            {
              $project: {
                _id:       0,
                appid:     1,
                title:     1,
                developer: 1,
                isDeleted: 1,
                rating:    1,
                updatedAt: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          totalGames: { $sum: '$counts.count' },
          activeGames: {
            $ifNull: [
              {
                $getField: {
                  field: 'count',
                  input: {
                    $first: {
                      $filter: {
                        input: '$counts',
                        cond:  { $eq: ['$$this._id', false] },
                      },
                    },
                  },
                },
              },
              0,
            ],
          },
          archivedGames: {
            $ifNull: [
              {
                $getField: {
                  field: 'count',
                  input: {
                    $first: {
                      $filter: {
                        input: '$counts',
                        cond:  { $eq: ['$$this._id', true] },
                      },
                    },
                  },
                },
              },
              0,
            ],
          },
          recentActivity: 1,
        },
      },
    ]),

    // ── User count ──────────────────────────────────────────────────────────
    User.aggregate([
      { $count: 'count' },
    ]),
  ]);

  const game = gameReport[0] ?? {
    totalGames: 0, activeGames: 0, archivedGames: 0, recentActivity: [],
  };

  return {
    totalUsers:     userCount[0]?.count    ?? 0,
    totalGames:     game.totalGames        ?? 0,
    activeGames:    game.activeGames       ?? 0,
    archivedGames:  game.archivedGames     ?? 0,
    recentActivity: game.recentActivity    ?? [],
  };
};
