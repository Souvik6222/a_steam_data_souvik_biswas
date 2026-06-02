/**
 * gameRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mounted at: /api/games
 *
 * Includes HEAD + OPTIONS for every resource path so HTTP clients,
 * browsers, and CORS preflight requests are answered correctly.
 */

import { Router } from 'express';
import {
  // ── CRUD
  getAllGames,
  getGameByAppid,
  createGame,
  replaceGame,
  updateGame,
  deleteGame,
  // ── Per-game sub-resources (existing)
  gameExists,
  getGameSummary,
  getUpdateHistory,
  archiveGame,
  restoreGame,
  getRelatedGames,
  // ── Per-game sub-resources (new)
  getScreenshots,
  getTrailers,
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  getSystemRequirements,
  getDLC,
  getAchievements,
  getLeaderboards,
  getUpdates,
  getNews,
  // ── Param-route controllers
  getGamesByGenre,
  getGamesByDeveloper,
  getGamesByPublisher,
  getGamesByPlatform,
  getGamesByTag,
  getGamesByReleaseYear,
  getGamesByMinRating,
  getGamesByMaxPrice,
  getGamesByFeature,
  // ── Filter-route controllers
  getFreeToPlayGames,
  getPaidGames,
  getDiscountedGames,
  getEarlyAccessGames,
  getVROnlyGames,
  getControllerGames,
  getMultiplayerGames,
  getSingleplayerGames,
  getCoopGames,
  getOpenWorldGames,
  getSurvivalGames,
  getHorrorGames,
  getAnimeGames,
  getIndieGames,
  getTopRatedGames,
  // ── Sort-route controllers
  getSortedByPriceDesc,
  getSortedByRatingDesc,
  getSortedByDownloadsDesc,
  getSortedByReleaseDateDesc,
  getSortedByPopularityDesc,
} from '../controllers/gameController.js';
import { validateGame, validateGameListQuery } from '../middlewares/validate.js';
import { addHeadOptions } from '../utils/httpMethods.js';

const router = Router();

// ── HEAD + OPTIONS: collection ────────────────────────────────────────────────
addHeadOptions(router, '/',       'GET, POST, HEAD, OPTIONS');

// ── Collection routes ─────────────────────────────────────────────────────────
router.get('/',    validateGameListQuery, getAllGames);  // GET  /api/games
router.post('/',   validateGame,         createGame);   // POST /api/games

// ── Sort routes (static — before /filter/* and param routes) ────────────────
router.get('/sort/price-desc',       getSortedByPriceDesc);       // GET /api/games/sort/price-desc
router.get('/sort/rating-desc',      getSortedByRatingDesc);      // GET /api/games/sort/rating-desc
router.get('/sort/downloads-desc',   getSortedByDownloadsDesc);   // GET /api/games/sort/downloads-desc
router.get('/sort/releaseDate-desc', getSortedByReleaseDateDesc); // GET /api/games/sort/releaseDate-desc
router.get('/sort/popularity-desc',  getSortedByPopularityDesc);  // GET /api/games/sort/popularity-desc

// HEAD + OPTIONS: sort collection (all sort endpoints share same methods)
addHeadOptions(router, '/sort/price-desc',       'GET, HEAD, OPTIONS');
addHeadOptions(router, '/sort/rating-desc',      'GET, HEAD, OPTIONS');
addHeadOptions(router, '/sort/downloads-desc',   'GET, HEAD, OPTIONS');
addHeadOptions(router, '/sort/releaseDate-desc', 'GET, HEAD, OPTIONS');
addHeadOptions(router, '/sort/popularity-desc',  'GET, HEAD, OPTIONS');

// ── Filter routes (static segments — must be registered BEFORE param routes) ──
router.get('/filter/free-to-play',        getFreeToPlayGames);   // GET /api/games/filter/free-to-play
router.get('/filter/paid',                getPaidGames);          // GET /api/games/filter/paid
router.get('/filter/discounted',          getDiscountedGames);    // GET /api/games/filter/discounted
router.get('/filter/early-access',        getEarlyAccessGames);  // GET /api/games/filter/early-access
router.get('/filter/vr-only',             getVROnlyGames);        // GET /api/games/filter/vr-only
router.get('/filter/controller-support',  getControllerGames);   // GET /api/games/filter/controller-support
router.get('/filter/multiplayer',         getMultiplayerGames);  // GET /api/games/filter/multiplayer
router.get('/filter/singleplayer',        getSingleplayerGames); // GET /api/games/filter/singleplayer
router.get('/filter/coop',                getCoopGames);          // GET /api/games/filter/coop
router.get('/filter/open-world',          getOpenWorldGames);    // GET /api/games/filter/open-world
router.get('/filter/survival',            getSurvivalGames);     // GET /api/games/filter/survival
router.get('/filter/horror',              getHorrorGames);        // GET /api/games/filter/horror
router.get('/filter/anime',               getAnimeGames);         // GET /api/games/filter/anime
router.get('/filter/indie',               getIndieGames);         // GET /api/games/filter/indie
router.get('/filter/top-rated',           getTopRatedGames);     // GET /api/games/filter/top-rated

// HEAD + OPTIONS: filter collection endpoints
addHeadOptions(router, '/filter/free-to-play',       'GET, HEAD, OPTIONS');
addHeadOptions(router, '/filter/paid',               'GET, HEAD, OPTIONS');
addHeadOptions(router, '/filter/discounted',         'GET, HEAD, OPTIONS');
addHeadOptions(router, '/filter/early-access',       'GET, HEAD, OPTIONS');
addHeadOptions(router, '/filter/vr-only',            'GET, HEAD, OPTIONS');
addHeadOptions(router, '/filter/controller-support', 'GET, HEAD, OPTIONS');
addHeadOptions(router, '/filter/multiplayer',        'GET, HEAD, OPTIONS');
addHeadOptions(router, '/filter/singleplayer',       'GET, HEAD, OPTIONS');
addHeadOptions(router, '/filter/coop',               'GET, HEAD, OPTIONS');
addHeadOptions(router, '/filter/open-world',         'GET, HEAD, OPTIONS');
addHeadOptions(router, '/filter/survival',           'GET, HEAD, OPTIONS');
addHeadOptions(router, '/filter/horror',             'GET, HEAD, OPTIONS');
addHeadOptions(router, '/filter/anime',              'GET, HEAD, OPTIONS');
addHeadOptions(router, '/filter/indie',              'GET, HEAD, OPTIONS');
addHeadOptions(router, '/filter/top-rated',          'GET, HEAD, OPTIONS');

// ── Param routes ──────────────────────────────────────────────────────────────
router.get('/genre/:genre',              getGamesByGenre);        // GET /api/games/genre/Action
router.get('/developer/:developer',      getGamesByDeveloper);    // GET /api/games/developer/Valve
router.get('/publisher/:publisher',      getGamesByPublisher);    // GET /api/games/publisher/EA
router.get('/platform/:platform',        getGamesByPlatform);     // GET /api/games/platform/linux
router.get('/tag/:tag',                  getGamesByTag);           // GET /api/games/tag/roguelike
router.get('/release-year/:year',        getGamesByReleaseYear);  // GET /api/games/release-year/2023
router.get('/rating/:rating',            getGamesByMinRating);    // GET /api/games/rating/8
router.get('/price/:price',              getGamesByMaxPrice);     // GET /api/games/price/20
router.get('/feature/:feature',          getGamesByFeature);      // GET /api/games/feature/coop

// HEAD + OPTIONS: param routes (wildcard param paths)
addHeadOptions(router, '/genre/:genre',         'GET, HEAD, OPTIONS');
addHeadOptions(router, '/developer/:developer', 'GET, HEAD, OPTIONS');
addHeadOptions(router, '/publisher/:publisher', 'GET, HEAD, OPTIONS');
addHeadOptions(router, '/platform/:platform',   'GET, HEAD, OPTIONS');
addHeadOptions(router, '/tag/:tag',             'GET, HEAD, OPTIONS');
addHeadOptions(router, '/release-year/:year',   'GET, HEAD, OPTIONS');
addHeadOptions(router, '/rating/:rating',       'GET, HEAD, OPTIONS');
addHeadOptions(router, '/price/:price',         'GET, HEAD, OPTIONS');
addHeadOptions(router, '/feature/:feature',     'GET, HEAD, OPTIONS');

// ── Per-game sub-resource routes (before /:appid to avoid conflicts) ──────────
router.get('/:appid/exists',               gameExists);             // GET    /api/games/:appid/exists
router.get('/:appid/summary',              getGameSummary);         // GET    /api/games/:appid/summary
router.get('/:appid/update-history',       getUpdateHistory);       // GET    /api/games/:appid/update-history
router.get('/:appid/related',              getRelatedGames);        // GET    /api/games/:appid/related
router.patch('/:appid/archive',            archiveGame);            // PATCH  /api/games/:appid/archive
router.patch('/:appid/restore',            restoreGame);            // PATCH  /api/games/:appid/restore

// ── New sub-resource routes ───────────────────────────────────────────────────
router.get('/:appid/screenshots',          getScreenshots);         // GET    /api/games/:appid/screenshots
router.get('/:appid/trailers',             getTrailers);            // GET    /api/games/:appid/trailers
router.get('/:appid/reviews',              getReviews);             // GET    /api/games/:appid/reviews
router.post('/:appid/reviews',             addReview);              // POST   /api/games/:appid/reviews
router.patch('/:appid/reviews/:reviewId',  updateReview);           // PATCH  /api/games/:appid/reviews/:reviewId
router.delete('/:appid/reviews/:reviewId', deleteReview);           // DELETE /api/games/:appid/reviews/:reviewId
router.get('/:appid/system-requirements',  getSystemRequirements);  // GET    /api/games/:appid/system-requirements
router.get('/:appid/dlc',                  getDLC);                 // GET    /api/games/:appid/dlc
router.get('/:appid/achievements',         getAchievements);        // GET    /api/games/:appid/achievements
router.get('/:appid/leaderboard',          getLeaderboards);        // GET    /api/games/:appid/leaderboard
router.get('/:appid/updates',              getUpdates);             // GET    /api/games/:appid/updates
router.get('/:appid/news',                 getNews);                // GET    /api/games/:appid/news

// ── HEAD + OPTIONS: per-game sub-resources ────────────────────────────────────
addHeadOptions(router, '/:appid/exists',             'GET, HEAD, OPTIONS');
addHeadOptions(router, '/:appid/summary',            'GET, HEAD, OPTIONS');
addHeadOptions(router, '/:appid/update-history',     'GET, HEAD, OPTIONS');
addHeadOptions(router, '/:appid/related',            'GET, HEAD, OPTIONS');
addHeadOptions(router, '/:appid/archive',            'PATCH, HEAD, OPTIONS');
addHeadOptions(router, '/:appid/restore',            'PATCH, HEAD, OPTIONS');
addHeadOptions(router, '/:appid/screenshots',        'GET, HEAD, OPTIONS');
addHeadOptions(router, '/:appid/trailers',           'GET, HEAD, OPTIONS');
addHeadOptions(router, '/:appid/reviews',            'GET, POST, HEAD, OPTIONS');
addHeadOptions(router, '/:appid/reviews/:reviewId',  'PATCH, DELETE, HEAD, OPTIONS');
addHeadOptions(router, '/:appid/system-requirements','GET, HEAD, OPTIONS');
addHeadOptions(router, '/:appid/dlc',               'GET, HEAD, OPTIONS');
addHeadOptions(router, '/:appid/achievements',       'GET, HEAD, OPTIONS');
addHeadOptions(router, '/:appid/leaderboard',        'GET, HEAD, OPTIONS');
addHeadOptions(router, '/:appid/updates',            'GET, HEAD, OPTIONS');
addHeadOptions(router, '/:appid/news',               'GET, HEAD, OPTIONS');

// ── Single-resource routes ────────────────────────────────────────────────────
router.get('/:appid',    getGameByAppid);  // GET    /api/games/:appid
router.put('/:appid',    replaceGame);     // PUT    /api/games/:appid
router.patch('/:appid',  updateGame);      // PATCH  /api/games/:appid
router.delete('/:appid', deleteGame);      // DELETE /api/games/:appid

// HEAD + OPTIONS: single game resource
addHeadOptions(router, '/:appid', 'GET, PUT, PATCH, DELETE, HEAD, OPTIONS');

export default router;
