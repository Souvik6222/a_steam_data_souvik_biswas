import { Router } from 'express';
import {
  getAllGames,
  getGameByAppid,
  createGame,
  replaceGame,
  updateGame,
  deleteGame,
  gameExists,
  getGameSummary,
  getUpdateHistory,
  archiveGame,
  restoreGame,
  getRelatedGames,
} from '../controllers/gameController.js';

const router = Router();

// ── Collection routes ─────────────────────────────────────────────────────────
router.get('/',    getAllGames);   // GET  /api/games
router.post('/',   createGame);   // POST /api/games

// ── Sub-resource routes (must come before /:appid to avoid conflicts) ─────────
router.get('/:appid/exists',         gameExists);        // GET  /api/games/:appid/exists
router.get('/:appid/summary',        getGameSummary);    // GET  /api/games/:appid/summary
router.get('/:appid/update-history', getUpdateHistory);  // GET  /api/games/:appid/update-history
router.get('/:appid/related',        getRelatedGames);   // GET  /api/games/:appid/related
router.patch('/:appid/archive',      archiveGame);       // PATCH /api/games/:appid/archive
router.patch('/:appid/restore',      restoreGame);       // PATCH /api/games/:appid/restore

// ── Single-resource routes ────────────────────────────────────────────────────
router.get('/:appid',    getGameByAppid);  // GET    /api/games/:appid
router.put('/:appid',    replaceGame);     // PUT    /api/games/:appid
router.patch('/:appid',  updateGame);      // PATCH  /api/games/:appid
router.delete('/:appid', deleteGame);      // DELETE /api/games/:appid

export default router;
