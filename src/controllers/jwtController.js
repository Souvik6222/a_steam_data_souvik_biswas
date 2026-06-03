// Import the jsonwebtoken library for signing, verifying, and decoding JWTs
import jwt from 'jsonwebtoken';
// Import gameService to retrieve database records for auth-gated endpoints
import * as gameService from '../services/gameService.js';
// Import custom wrapper to capture asynchronous errors and forward them to the global error handler middleware
import catchAsync from '../utils/catchAsync.js';

// ── Shared response helper (matches project convention) ───────────────────────

/**
 * Standard utility function to unify response shapes across this controller.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Operation success flag
 * @param {string} message - API response message
 * @param {any} data - Content payload (defaults to null)
 * @param {any} error - Error description (defaults to null)
 */
const respond = (res, statusCode, success, message, data = null, error = null) =>
  res.status(statusCode).json({ success, message, data, error });

// ── In-memory token blacklist ─────────────────────────────────────────────────
// A Javascript Set is used here. A Set provides O(1) constant-time lookup complexity, which is highly efficient.
// This Set persists for the lifetime of the Node process.
// Note: For production architectures with multiple server instances, this should be migrated to Redis.
export const revokedTokens = new Set();

// ── GET /api/v1/jwt/profile ───────────────────────────────────────────────────
/**
 * Returns the decoded user data attached by authMiddleware.
 * No DB hit — the payload carried inside the JWT is returned as-is.
 */
export const getProfile = (req, res) => {
  // Respond with the authenticated user object attached to the request (req.user)
  respond(res, 200, true, 'Profile fetched from token.', req.user);
};

// ── GET /api/v1/jwt/dashboard ─────────────────────────────────────────────────
/**
 * Returns a dashboard snapshot: a welcome message, the token user, and
 * a server-side timestamp so the client can verify freshness.
 */
export const getDashboard = (req, res) => {
  respond(res, 200, true, 'Dashboard data fetched successfully.', {
    message: `Welcome to the dashboard, ${req.user.role}!`, // Greet the user based on their role
    user: req.user, // Return req.user credentials
    timestamp: new Date().toISOString(), // Server-side execution timestamp in ISO-8601 string format
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
  // Destructure payload and optional expiration from the request body (defaulting expiresIn to '1h')
  const { payload, expiresIn = '1h' } = req.body;

  // Validate that a valid payload object is provided
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return respond(res, 400, false, 'Request body must include a "payload" object.', null, 'Invalid payload.');
  }

  try {
    // Generate a signed JWT using jwt.sign() with the payload, JWT_SECRET, and option configurations
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    // Respond with 201 Created and return the newly generated JWT token
    respond(res, 201, true, 'Token generated successfully.', { token, expiresIn });
  } catch (err) {
    // Catch token-signing failures (e.g. invalid options syntax)
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
  // Extract token from request body
  const { token } = req.body;

  // Validate that a token string was passed
  if (!token) {
    return respond(res, 400, false, 'A "token" field is required in the request body.', null, 'Missing token.');
  }

  // Check if this token exists inside our Set blacklist (revokedTokens)
  if (revokedTokens.has(token)) {
    return respond(res, 401, false, 'Token has been revoked.', null, 'Revoked token.');
  }

  try {
    // Verify signature validity and expiration using jwt.verify()
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Respond with 200 OK and return the decoded token parameters
    respond(res, 200, true, 'Token is valid.', { decoded });
  } catch (err) {
    // If the token failed verification (expired, invalid signature), return 401 Unauthorized
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
  // Destructure current token and new expiration window
  const { token, expiresIn = '1h' } = req.body;

  // Validate token is provided
  if (!token) {
    return respond(res, 400, false, 'A "token" field is required in the request body.', null, 'Missing token.');
  }

  // Check if token has been revoked
  if (revokedTokens.has(token)) {
    return respond(res, 401, false, 'Cannot refresh a revoked token.', null, 'Revoked token.');
  }

  try {
    // Verify current token and extract fields.
    // Use Javascript's object rest/spread properties to extract exp and iat (so we can discard them)
    // and store all remaining payload fields in 'payload'. This prevents conflicts when signing a fresh token.
    const { exp, iat, ...payload } = jwt.verify(token, process.env.JWT_SECRET);

    // Blacklist the old token to prevent reuse of old tokens (replay attacks)
    revokedTokens.add(token);

    // Sign a fresh token with the remaining payload fields and new expiration
    const newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    // Respond with the new token
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
  // Split "Bearer <token>" by space and retrieve the token string
  const token = req.headers.authorization.split(' ')[1];
  // Add the token to the blacklisted Set
  revokedTokens.add(token);
  // Respond to the client indicating success
  respond(res, 200, true, 'Token revoked successfully.', { revokedAt: new Date().toISOString() });
};

// ── GET /api/v1/jwt/private-games ────────────────────────────────────────────
/**
 * Auth-guarded mirror of GET /api/games.
 * Delegates to gameService.getAllGames with the same query-string support.
 */
export const getPrivateGames = catchAsync(async (req, res) => {
  // Call gameService to query, paginate and return games according to req.query specifications
  const result = await gameService.getAllGames(req.query);
  respond(res, 200, true, 'Private games fetched successfully.', result);
});

// ── GET /api/v1/jwt/private-analytics ────────────────────────────────────────
/**
 * Auth-guarded analytics summary derived from the games collection.
 * Aggregates: total game count, free / paid split, average rating,
 * top genres, and the most-downloaded game.
 */
export const getPrivateAnalytics = catchAsync(async (req, res) => {
  // Fetch all games from database (setting limit to 0 to disable pagination limit and retrieve the full catalog)
  const { data: games = [], total = 0 } = await gameService.getAllGames({ limit: 0 });

  // 1. Calculate how many games are free (price equals 0) using array.filter()
  const freeCount = games.filter((g) => g.price === 0).length;
  // Calculate paid games count as remaining amount of games
  const paidCount = total - freeCount;

  // 2. Map all games to an array of ratings and filter out non-numeric values
  const ratings = games.map((g) => g.rating).filter((r) => typeof r === 'number');
  
  // Calculate the average rating using array.reduce() to sum elements, divided by length, rounded to 2 decimal places
  const avgRating =
    ratings.length > 0
      ? parseFloat((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(2))
      : null;

  // 3. Tally occurrence of genres using a hash map
  const genreMap = {};
  for (const game of games) {
    // Loop through the genres of each game, or default to an empty array
    for (const genre of game.genres ?? []) {
      // Increment count for the genre, defaulting to 0 if not encountered yet
      genreMap[genre] = (genreMap[genre] ?? 0) + 1;
    }
  }
  
  // Convert genreMap into an array of [genre, count] entries, sort by count descending, slice to top 5, and map back to objects
  const topGenres = Object.entries(genreMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([genre, count]) => ({ genre, count }));

  // 4. Find the most-downloaded game in the dataset using array.reduce()
  const mostDownloaded =
    games.length > 0
      ? games.reduce(
          (best, g) => ((g.downloads ?? 0) > (best.downloads ?? 0) ? g : best),
          games[0],
        )
      : null;

  // Return standard response with the generated statistics
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
});
