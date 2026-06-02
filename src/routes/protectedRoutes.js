/**
 * protectedRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mounted at: /api/v1/protected
 *
 * Every route passes through:
 *   authMiddleware   – verifies JWT, attaches req.user = { id, role }
 *                      Any logged-in user (role: 'user' or 'admin') may access.
 *
 * Routes:
 *   POST   /api/v1/protected/games/:appid   → create a new game
 *   PATCH  /api/v1/protected/games/:appid   → partial update a game
 *   DELETE /api/v1/protected/games/:appid   → hard-delete a game
 *
 * These delegate to the same controller functions used in the public gameRoutes
 * so no business logic is duplicated.  The separation of concerns is:
 *   • /api/games          – public read-only (GET) routes
 *   • /api/v1/protected   – authenticated write routes
 */

import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  createGame,
  updateGame,
  deleteGame,
} from '../controllers/gameController.js';

const router = Router();

// ── Apply authMiddleware to every route in this file ─────────────────────────
router.use(authMiddleware);

// ── Protected game write routes ───────────────────────────────────────────────

/**
 * POST /api/v1/protected/games
 * Create a new game document.
 * Body: { appid, title, developer, publisher, price, rating, genres, ... }
 */
router.post('/games',          createGame);   // POST   /api/v1/protected/games

/**
 * PATCH /api/v1/protected/games/:appid
 * Partial update of an existing game (only provided fields are changed).
 */
router.patch('/games/:appid',  updateGame);   // PATCH  /api/v1/protected/games/:appid

/**
 * DELETE /api/v1/protected/games/:appid
 * Hard-delete a game permanently.
 */
router.delete('/games/:appid', deleteGame);   // DELETE /api/v1/protected/games/:appid

export default router;
