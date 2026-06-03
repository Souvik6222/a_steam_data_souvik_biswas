/**
 * gameRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mounted at: /api/games
 *
 * Includes HEAD + OPTIONS for every resource path so HTTP clients,
 * browsers, and CORS preflight requests are answered correctly.
 */

// Import Express Router
import { Router } from 'express';
// Import game controller endpoints
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
// Import query and body validation middleware sets
import { validateGame, validateGameListQuery } from '../middlewares/validate.js';
// Import utility helper to register CORS preflight routes
import { addHeadOptions } from '../utils/httpMethods.js';

// Initialize the Express router instance
const router = Router();

// ── HEAD + OPTIONS: collection ────────────────────────────────────────────────
// Registers preflight responses for the root collection path
addHeadOptions(router, '/',       'GET, POST, HEAD, OPTIONS');

// ── Collection routes ─────────────────────────────────────────────────────────
// GET /api/games: runs validation checks, then fetches the page of game records
router.get('/',    validateGameListQuery, getAllGames);  
// POST /api/games: runs field validation checks, then inserts the game record
router.post('/',   validateGame,         createGame);   

// ── Sort routes (static segments) ─────────────────────────────────────────────
// IMPORTANT ROUTING RULE:
// Static paths (like /sort/* and /filter/*) must be declared BEFORE routes containing parameters (like /:appid)
// otherwise Express will interpret the word "sort" as an :appid parameter value (e.g. req.params.appid = "sort").
router.get('/sort/price-desc',       getSortedByPriceDesc);       // GET /api/games/sort/price-desc
router.get('/sort/rating-desc',      getSortedByRatingDesc);      // GET /api/games/sort/rating-desc
router.get('/sort/downloads-desc',   getSortedByDownloadsDesc);   // GET /api/games/sort/downloads-desc
router.get('/sort/releaseDate-desc', getSortedByReleaseDateDesc); // GET /api/games/sort/releaseDate-desc
router.get('/sort/popularity-desc',  getSortedByPopularityDesc);  // GET /api/games/sort/popularity-desc

// HEAD + OPTIONS for sort collection endpoints
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

// HEAD + OPTIONS for filter collection endpoints
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
// Registers endpoints matching dynamic parameter paths (e.g. /genre/RPG, /developer/Valve)
router.get('/genre/:genre',              getGamesByGenre);        
router.get('/developer/:developer',      getGamesByDeveloper);    
router.get('/publisher/:publisher',      getGamesByPublisher);    
router.get('/platform/:platform',        getGamesByPlatform);     
router.get('/tag/:tag',                  getGamesByTag);           
router.get('/release-year/:year',        getGamesByReleaseYear);  
router.get('/rating/:rating',            getGamesByMinRating);    
router.get('/price/:price',              getGamesByMaxPrice);     
router.get('/feature/:feature',          getGamesByFeature);      

// HEAD + OPTIONS for parameterized query routes
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
// These contain explicit sub-resource paths under the appid parameter (e.g. /:appid/exists)
router.get('/:appid/exists',               gameExists);             
router.get('/:appid/summary',              getGameSummary);         
router.get('/:appid/update-history',       getUpdateHistory);       
router.get('/:appid/related',              getRelatedGames);        
router.patch('/:appid/archive',            archiveGame);            
router.patch('/:appid/restore',            restoreGame);            

// ── New sub-resource routes ───────────────────────────────────────────────────
router.get('/:appid/screenshots',          getScreenshots);         
router.get('/:appid/trailers',             getTrailers);            
router.get('/:appid/reviews',              getReviews);             
router.post('/:appid/reviews',             addReview);              
router.patch('/:appid/reviews/:reviewId',  updateReview);           
router.delete('/:appid/reviews/:reviewId', deleteReview);           
router.get('/:appid/system-requirements',  getSystemRequirements);  
router.get('/:appid/dlc',                  getDLC);                 
router.get('/:appid/achievements',         getAchievements);        
router.get('/:appid/leaderboard',          getLeaderboards);        
router.get('/:appid/updates',              getUpdates);             
router.get('/:appid/news',                 getNews);                

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
// These match dynamic GET/PUT/PATCH/DELETE on the dynamic appid parameter (e.g. GET /api/games/730)
// This must be placed last because it is the most general parameter route.
router.get('/:appid',    getGameByAppid);  
router.put('/:appid',    replaceGame);     
router.patch('/:appid',  updateGame);      
router.delete('/:appid', deleteGame);      

// HEAD + OPTIONS: single game resource preflights
addHeadOptions(router, '/:appid', 'GET, PUT, PATCH, DELETE, HEAD, OPTIONS');

// Export router instance
export default router;
