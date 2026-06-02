import jwt from 'jsonwebtoken';
import * as gameService from '../services/gameService.js';

// ── Shared response helper (matches project convention) ───────────────────────

const respond = (res, statusCode, success, message, data = null, error = null) =>
  res.status(statusCode).json({ success, message, data, error });

// ── In-memory token blacklist ─────────────────────────────────────────────────
// Persists for the lifetime of the Node process.
// For production, migrate this to Redis or another shared store.
export const revokedTokens = new Set();

// ── GET /api/v1/jwt/profile ───────────────────────────────────────────────────
/**
 * Returns the decoded user data attached by authMiddleware.
 * No DB hit — the payload carried inside the JWT is returned as-is.
 */
export const getProfile = (req, res) => {
  respond(res, 200, true, 'Profile fetched from token.', req.user);
};

// ── GET /api/v1/jwt/dashboard ─────────────────────────────────────────────────
/**
 * Returns a dashboard snapshot: a welcome message, the token user, and
 * a server-side timestamp so the client can verify freshness.
 */
export const getDashboard = (req, res) => {
  respond(res, 200, true, 'Dashboard data fetched successfully.', {
    message: `Welcome to the dashboard, ${req.user.role}!`,
    user: req.user,
    timestamp: new Date().toISOString(),
  });
};

// ── POST /api/v1/jwt/generate-token (admin only) ──────────────────────────────
/**
 * Generates a signed JWT for an arbitrary payload supplied in req.body.
 * Restricted to admin role via roleGuard in the router.
 *
 * Body: { payload: object, expiresIn?: string }  (expiresIn defaults to '1h')
 */
export const generateToken = (req, res) => {
  const { payload, expiresIn = '1h' } = req.body;

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return respond(res, 400, false, 'Request body must include a "payload" object.', null, 'Invalid payload.');
  }

  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    respond(res, 201, true, 'Token generated successfully.', { token, expiresIn });
  } catch (err) {
    respond(res, 500, false, 'Failed to generate token.', null, err.message);
  }
};

// ── POST /api/v1/jwt/verify-token ────────────────────────────────────────────
/**
 * Verifies and decodes a token provided by the caller.
 * Also checks the in-process revocation blacklist.
 *
 * Body: { token: string }
 */
export const verifyToken = (req, res) => {
  const { token } = req.body;

  if (!token) {
    return respond(res, 400, false, 'A "token" field is required in the request body.', null, 'Missing token.');
  }

  if (revokedTokens.has(token)) {
    return respond(res, 401, false, 'Token has been revoked.', null, 'Revoked token.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    respond(res, 200, true, 'Token is valid.', { decoded });
  } catch (err) {
    respond(res, 401, false, 'Token is invalid or expired.', null, err.message);
  }
};

// ── POST /api/v1/jwt/refresh-token ───────────────────────────────────────────
/**
 * Accepts a valid (non-revoked) token, issues a fresh one with the same
 * payload but a new expiry.
 *
 * Body: { token: string, expiresIn?: string }
 */
export const refreshToken = (req, res) => {
  const { token, expiresIn = '1h' } = req.body;

  if (!token) {
    return respond(res, 400, false, 'A "token" field is required in the request body.', null, 'Missing token.');
  }

  if (revokedTokens.has(token)) {
    return respond(res, 401, false, 'Cannot refresh a revoked token.', null, 'Revoked token.');
  }

  try {
    // Verify current token; strip exp / iat so jwt.sign won't complain
    const { exp, iat, ...payload } = jwt.verify(token, process.env.JWT_SECRET);

    // Optionally add the old token to the blacklist so it cannot be reused
    revokedTokens.add(token);

    const newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    respond(res, 200, true, 'Token refreshed successfully.', { token: newToken, expiresIn });
  } catch (err) {
    respond(res, 401, false, 'Could not refresh token. It may be invalid or expired.', null, err.message);
  }
};

// ── DELETE /api/v1/jwt/revoke-token ──────────────────────────────────────────
/**
 * Adds the caller's current Bearer token to the in-memory blacklist.
 * authMiddleware has already validated it, so `req.headers.authorization`
 * is guaranteed to be present and well-formed.
 */
export const revokeToken = (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  revokedTokens.add(token);
  respond(res, 200, true, 'Token revoked successfully.', { revokedAt: new Date().toISOString() });
};

// ── GET /api/v1/jwt/private-games ────────────────────────────────────────────
/**
 * Auth-guarded mirror of GET /api/games.
 * Delegates to gameService.getAllGames with the same query-string support.
 */
export const getPrivateGames = async (req, res) => {
  try {
    const result = await gameService.getAllGames(req.query);
    respond(res, 200, true, 'Private games fetched successfully.', result);
  } catch (err) {
    respond(res, 500, false, 'Failed to fetch private games.', null, err.message);
  }
};

// ── GET /api/v1/jwt/private-analytics ────────────────────────────────────────
/**
 * Auth-guarded analytics summary derived from the games collection.
 * Aggregates: total game count, free / paid split, average rating,
 * top genres, and the most-downloaded game.
 */
export const getPrivateAnalytics = async (req, res) => {
  try {
    // Fetch all games once for in-memory aggregation.
    // For large collections, replace with Mongoose aggregation pipelines.
    const { games = [], total = 0 } = await gameService.getAllGames({ limit: 0 });

    const freeCount = games.filter((g) => g.price === 0).length;
    const paidCount = total - freeCount;

    const ratings = games.map((g) => g.rating).filter((r) => typeof r === 'number');
    const avgRating =
      ratings.length > 0
        ? parseFloat((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(2))
        : null;

    // Tally genres
    const genreMap = {};
    for (const game of games) {
      for (const genre of game.genres ?? []) {
        genreMap[genre] = (genreMap[genre] ?? 0) + 1;
      }
    }
    const topGenres = Object.entries(genreMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));

    // Most-downloaded game
    const mostDownloaded =
      games.length > 0
        ? games.reduce(
            (best, g) => ((g.downloads ?? 0) > (best.downloads ?? 0) ? g : best),
            games[0],
          )
        : null;

    respond(res, 200, true, 'Analytics summary fetched successfully.', {
      totalGames: total,
      freeGames: freeCount,
      paidGames: paidCount,
      averageRating: avgRating,
      topGenres,
      mostDownloaded: mostDownloaded
        ? { appid: mostDownloaded.appid, title: mostDownloaded.title, downloads: mostDownloaded.downloads }
        : null,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    respond(res, 500, false, 'Failed to fetch analytics.', null, err.message);
  }
};
