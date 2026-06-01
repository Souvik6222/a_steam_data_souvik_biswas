import { Router } from 'express';
import {
  // ── CRUD
  getAllGames,
  getGameByAppid,
  createGame,
  replaceGame,
  updateGame,
  deleteGame,
  // ── Per-game sub-resources
  gameExists,
  getGameSummary,
  getUpdateHistory,
  archiveGame,
  restoreGame,
  getRelatedGames,
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

const router = Router();

// ── Collection routes ─────────────────────────────────────────────────────────
router.get('/',    getAllGames);  // GET  /api/games
router.post('/',   createGame);  // POST /api/games

// ── Sort routes (static — before /filter/* and param routes) ────────────────
router.get('/sort/price-desc',       getSortedByPriceDesc);       // GET /api/games/sort/price-desc
router.get('/sort/rating-desc',      getSortedByRatingDesc);      // GET /api/games/sort/rating-desc
router.get('/sort/downloads-desc',   getSortedByDownloadsDesc);   // GET /api/games/sort/downloads-desc
router.get('/sort/releaseDate-desc', getSortedByReleaseDateDesc); // GET /api/games/sort/releaseDate-desc
router.get('/sort/popularity-desc',  getSortedByPopularityDesc);  // GET /api/games/sort/popularity-desc

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

// ── Per-game sub-resource routes (before /:appid to avoid conflicts) ──────────
router.get('/:appid/exists',         gameExists);        // GET   /api/games/:appid/exists
router.get('/:appid/summary',        getGameSummary);    // GET   /api/games/:appid/summary
router.get('/:appid/update-history', getUpdateHistory);  // GET   /api/games/:appid/update-history
router.get('/:appid/related',        getRelatedGames);   // GET   /api/games/:appid/related
router.patch('/:appid/archive',      archiveGame);       // PATCH /api/games/:appid/archive
router.patch('/:appid/restore',      restoreGame);       // PATCH /api/games/:appid/restore

// ── Single-resource routes ────────────────────────────────────────────────────
router.get('/:appid',    getGameByAppid);  // GET    /api/games/:appid
router.put('/:appid',    replaceGame);     // PUT    /api/games/:appid
router.patch('/:appid',  updateGame);      // PATCH  /api/games/:appid
router.delete('/:appid', deleteGame);      // DELETE /api/games/:appid

export default router;
