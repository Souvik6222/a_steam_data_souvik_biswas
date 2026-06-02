/**
 * analyticsRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mounted at: /api/v1/analytics
 *
 *   GET /top-rated             → top 10 by rating
 *   GET /most-downloaded       → top 10 by downloads
 *   GET /revenue               → estimated revenue per developer
 *   GET /platform-distribution → games per platform
 *   GET /genre-distribution    → games per genre
 *   GET /trending              → released in last 6 months, sorted by popularity
 *   GET /release-trends        → game count per release year
 *   GET /review-analysis       → avg review score per game
 *   GET /wishlist-analysis     → top 10 by downloads (proxy for wishlists)
 *   GET /user-activity         → per-developer: game count + avg rating
 *
 * HEAD + OPTIONS registered for every path above.
 */

import { Router } from 'express';
import {
  getTopRated,
  getMostDownloaded,
  getRevenue,
  getPlatformDistribution,
  getGenreDistribution,
  getTrending,
  getReleaseTrends,
  getReviewAnalysis,
  getWishlistAnalysis,
  getUserActivity,
} from '../controllers/analyticsController.js';
import { addHeadOptions } from '../utils/httpMethods.js';

const router = Router();

router.get('/top-rated',              getTopRated);             // GET /api/v1/analytics/top-rated
router.get('/most-downloaded',        getMostDownloaded);       // GET /api/v1/analytics/most-downloaded
router.get('/revenue',                getRevenue);              // GET /api/v1/analytics/revenue
router.get('/platform-distribution',  getPlatformDistribution); // GET /api/v1/analytics/platform-distribution
router.get('/genre-distribution',     getGenreDistribution);    // GET /api/v1/analytics/genre-distribution
router.get('/trending',               getTrending);             // GET /api/v1/analytics/trending
router.get('/release-trends',         getReleaseTrends);        // GET /api/v1/analytics/release-trends
router.get('/review-analysis',        getReviewAnalysis);       // GET /api/v1/analytics/review-analysis
router.get('/wishlist-analysis',      getWishlistAnalysis);     // GET /api/v1/analytics/wishlist-analysis
router.get('/user-activity',          getUserActivity);         // GET /api/v1/analytics/user-activity

// ── HEAD + OPTIONS ────────────────────────────────────────────────────────────
addHeadOptions(router, '/top-rated',             'GET, HEAD, OPTIONS');
addHeadOptions(router, '/most-downloaded',       'GET, HEAD, OPTIONS');
addHeadOptions(router, '/revenue',               'GET, HEAD, OPTIONS');
addHeadOptions(router, '/platform-distribution', 'GET, HEAD, OPTIONS');
addHeadOptions(router, '/genre-distribution',    'GET, HEAD, OPTIONS');
addHeadOptions(router, '/trending',              'GET, HEAD, OPTIONS');
addHeadOptions(router, '/release-trends',        'GET, HEAD, OPTIONS');
addHeadOptions(router, '/review-analysis',       'GET, HEAD, OPTIONS');
addHeadOptions(router, '/wishlist-analysis',     'GET, HEAD, OPTIONS');
addHeadOptions(router, '/user-activity',         'GET, HEAD, OPTIONS');

export default router;
