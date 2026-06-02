/**
 * statsRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mounted at: /api/v1/stats
 *
 *   GET /count              → total active game count
 *   GET /top-rated          → top 10 by rating
 *   GET /most-downloaded    → top 10 by downloads
 *   GET /average-price      → avg / min / max of price.original
 *   GET /average-rating     → avg / min / max of rating
 *   GET /genre-count        → game count per genre
 *   GET /platform-count     → games per platform (windows/mac/linux)
 *   GET /free-to-play-count → count of isFreeToPlay games
 *   GET /multiplayer-count  → count of isMultiplayer games
 *   GET /monthly-releases   → game count per year+month
 */

import { Router } from 'express';
import {
  getCount,
  getTopRated,
  getMostDownloaded,
  getAveragePrice,
  getAverageRating,
  getGenreCount,
  getPlatformCount,
  getFreeToPlayCount,
  getMultiplayerCount,
  getMonthlyReleases,
} from '../controllers/statsController.js';

const router = Router();

router.get('/count',               getCount);            // GET /api/v1/stats/count
router.get('/top-rated',           getTopRated);         // GET /api/v1/stats/top-rated
router.get('/most-downloaded',     getMostDownloaded);   // GET /api/v1/stats/most-downloaded
router.get('/average-price',       getAveragePrice);     // GET /api/v1/stats/average-price
router.get('/average-rating',      getAverageRating);    // GET /api/v1/stats/average-rating
router.get('/genre-count',         getGenreCount);       // GET /api/v1/stats/genre-count
router.get('/platform-count',      getPlatformCount);    // GET /api/v1/stats/platform-count
router.get('/free-to-play-count',  getFreeToPlayCount);  // GET /api/v1/stats/free-to-play-count
router.get('/multiplayer-count',   getMultiplayerCount); // GET /api/v1/stats/multiplayer-count
router.get('/monthly-releases',    getMonthlyReleases);  // GET /api/v1/stats/monthly-releases

export default router;
