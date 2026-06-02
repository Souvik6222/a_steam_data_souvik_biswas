/**
 * catchAsync.js
 * ─────────────────────────────────────────────────────────────────
 * Higher-order function that wraps an async Express route handler
 * and automatically forwards any rejected promise to next(err),
 * eliminating repetitive try/catch boilerplate in controllers.
 *
 * Usage:
 *   import catchAsync from '../utils/catchAsync.js';
 *
 *   export const getGame = catchAsync(async (req, res) => {
 *     const game = await gameService.getGameByAppid(req.params.appid);
 *     res.json({ success: true, data: game });
 *   });
 *
 * @param {Function} fn - async (req, res, next) => Promise<void>
 * @returns {Function}  - (req, res, next) => void
 */

const catchAsync = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default catchAsync;
