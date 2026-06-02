/**
 * advancedRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Advanced game-related routes: random, recommendations, trending, compare,
 * timeline, activity logs, and mock news.
 *
 * All routes are mounted under /api/v1 in server.js.
 */

import { Router } from 'express';
import {
  getRandomGame,
  getRecommendations,
  getTrendingGames,
  compareGames,
  getTimeline,
  getActivityLogs,
  getLatestNews,
  getTrendingNews,
} from '../controllers/advancedController.js';
import { addHeadOptions } from '../utils/httpMethods.js';

const router = Router();

// ── Random game ──────────────────────────────────────────────────────────────
router.get('/games/random', getRandomGame);                // GET /api/v1/games/random

// ── Recommendations ──────────────────────────────────────────────────────────
router.get('/recommendations/games/:appid', getRecommendations); // GET /api/v1/recommendations/games/:appid

// ── Trending ─────────────────────────────────────────────────────────────────
router.get('/trending/games', getTrendingGames);            // GET /api/v1/trending/games

// ── Compare ──────────────────────────────────────────────────────────────────
router.get('/compare/games/:id1/:id2', compareGames);       // GET /api/v1/compare/games/:id1/:id2

// ── Timeline ─────────────────────────────────────────────────────────────────
router.get('/timeline/game/:appid', getTimeline);           // GET /api/v1/timeline/game/:appid

// ── Activity logs ────────────────────────────────────────────────────────────
router.get('/activity/logs', getActivityLogs);              // GET /api/v1/activity/logs

// ── News ─────────────────────────────────────────────────────────────────────
router.get('/news/latest',   getLatestNews);                // GET /api/v1/news/latest
router.get('/news/trending', getTrendingNews);              // GET /api/v1/news/trending

// ── HEAD + OPTIONS ────────────────────────────────────────────────────────────
addHeadOptions(router, '/games/random',                  'GET, HEAD, OPTIONS');
addHeadOptions(router, '/recommendations/games/:appid',  'GET, HEAD, OPTIONS');
addHeadOptions(router, '/trending/games',                'GET, HEAD, OPTIONS');
addHeadOptions(router, '/compare/games/:id1/:id2',       'GET, HEAD, OPTIONS');
addHeadOptions(router, '/timeline/game/:appid',          'GET, HEAD, OPTIONS');
addHeadOptions(router, '/activity/logs',                 'GET, HEAD, OPTIONS');
addHeadOptions(router, '/news/latest',                   'GET, HEAD, OPTIONS');
addHeadOptions(router, '/news/trending',                 'GET, HEAD, OPTIONS');

export default router;

