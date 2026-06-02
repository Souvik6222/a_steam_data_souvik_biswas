/**
 * advancedController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * HTTP adapter layer for the advanced game routes.
 *
 * Route → Handler mapping:
 *   GET /api/v1/games/random                → getRandomGame
 *   GET /api/v1/recommendations/games/:appid → getRecommendations
 *   GET /api/v1/trending/games              → getTrendingGames
 *   GET /api/v1/compare/games/:id1/:id2     → compareGames
 *   GET /api/v1/timeline/game/:appid        → getTimeline
 *   GET /api/v1/activity/logs               → getActivityLogs
 *   GET /api/v1/news/latest                 → getLatestNews
 *   GET /api/v1/news/trending               → getTrendingNews
 */

import * as gameService from '../services/gameService.js';
import { requestLogs }  from '../middlewares/requestLogger.js';

// ── Shared response helper ────────────────────────────────────────────────────
const respond = (res, code, success, message, data) =>
  res.status(code).json({ success, message, data });

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/games/random
// ─────────────────────────────────────────────────────────────────────────────
export const getRandomGame = async (req, res, next) => {
  try {
    const game = await gameService.getRandomGame();
    if (!game) return respond(res, 404, false, 'No games found in the database.');
    respond(res, 200, true, 'Random game fetched successfully.', game);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/recommendations/games/:appid
// ─────────────────────────────────────────────────────────────────────────────
export const getRecommendations = async (req, res, next) => {
  try {
    const data = await gameService.getRecommendations(req.params.appid);
    if (data === null) return respond(res, 404, false, 'Game not found or has no genres.');
    respond(res, 200, true, 'Recommendations fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/trending/games
// ─────────────────────────────────────────────────────────────────────────────
export const getTrendingGames = async (req, res, next) => {
  try {
    const data = await gameService.getTrendingGames();
    respond(res, 200, true, 'Trending games fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/compare/games/:id1/:id2
// ─────────────────────────────────────────────────────────────────────────────
export const compareGames = async (req, res, next) => {
  try {
    const { id1, id2 } = req.params;
    const data = await gameService.compareGames(id1, id2);

    if (!data.game1 && !data.game2) {
      return respond(res, 404, false, 'Neither game was found.');
    }

    respond(res, 200, true, 'Game comparison fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/timeline/game/:appid
// ─────────────────────────────────────────────────────────────────────────────
export const getTimeline = async (req, res, next) => {
  try {
    const data = await gameService.getTimeline(req.params.appid);
    if (data === null) return respond(res, 404, false, 'Game not found.');
    respond(res, 200, true, 'Timeline fetched successfully.', data);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/activity/logs
// Returns the last 20 request logs stored in memory by requestLogger.
// ─────────────────────────────────────────────────────────────────────────────
export const getActivityLogs = (req, res) => {
  const last20 = requestLogs.slice(-20).reverse(); // newest first
  respond(res, 200, true, 'Activity logs fetched successfully.', {
    count: last20.length,
    logs:  last20,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/news/latest
// Returns 5 mock latest news items.
// ─────────────────────────────────────────────────────────────────────────────
export const getLatestNews = (req, res) => {
  const now     = new Date();
  const oneDay  = 24 * 60 * 60 * 1000;

  const news = [
    {
      id: 1,
      headline: 'Steam Summer Sale 2025 officially announced',
      body: 'Valve has confirmed the dates for the annual Steam Summer Sale, featuring discounts of up to 90% across thousands of titles.',
      publishedAt: new Date(now - 1 * oneDay).toISOString(),
      source: 'Steam Blog',
    },
    {
      id: 2,
      headline: 'New indie hit surpasses 1 million downloads in its first week',
      body: 'An unexpected indie title has taken the gaming world by storm, reaching an unprecedented milestone within days of launch.',
      publishedAt: new Date(now - 2 * oneDay).toISOString(),
      source: 'Gaming News',
    },
    {
      id: 3,
      headline: 'Major game engine update brings real-time ray tracing to all platforms',
      body: 'The latest engine update democratizes ray tracing technology, making it accessible to developers of all sizes.',
      publishedAt: new Date(now - 3 * oneDay).toISOString(),
      source: 'Developer Weekly',
    },
    {
      id: 4,
      headline: 'E-sports viewership hits new all-time record',
      body: 'Global e-sports viewership surpassed 600 million concurrent viewers during the latest championship finals.',
      publishedAt: new Date(now - 4 * oneDay).toISOString(),
      source: 'E-Sports Daily',
    },
    {
      id: 5,
      headline: 'Community modding tools receive a massive overhaul',
      body: 'Steam Workshop integration now supports larger file sizes and cross-game mod compatibility.',
      publishedAt: new Date(now - 5 * oneDay).toISOString(),
      source: 'Steam Community',
    },
  ];

  respond(res, 200, true, 'Latest news fetched successfully.', news);
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/news/trending
// Returns 5 mock trending news items.
// ─────────────────────────────────────────────────────────────────────────────
export const getTrendingNews = (req, res) => {
  const now     = new Date();
  const oneDay  = 24 * 60 * 60 * 1000;

  const news = [
    {
      id: 1,
      headline: 'Battle royale genre sees massive resurgence in 2025',
      body: 'After years of market saturation, innovative new mechanics are bringing players back to the battle royale genre in record numbers.',
      publishedAt: new Date(now - 1 * oneDay).toISOString(),
      source: 'Gaming Trends',
      trending: true,
    },
    {
      id: 2,
      headline: 'AI-generated NPCs revolutionize open-world gaming',
      body: 'Several AAA studios have integrated AI-driven NPC behavior, creating unprecedented levels of immersion in open-world titles.',
      publishedAt: new Date(now - 1 * oneDay).toISOString(),
      source: 'Tech Gaming',
      trending: true,
    },
    {
      id: 3,
      headline: 'Cross-platform play becomes the new industry standard',
      body: 'Over 80% of new multiplayer releases now ship with full cross-platform support across PC, console, and mobile.',
      publishedAt: new Date(now - 2 * oneDay).toISOString(),
      source: 'Industry Report',
      trending: true,
    },
    {
      id: 4,
      headline: 'Retro gaming renaissance: pixel art titles dominate wishlists',
      body: 'Nostalgia-driven pixel art games account for 35% of all Steam wishlists this quarter, signaling a major market shift.',
      publishedAt: new Date(now - 3 * oneDay).toISOString(),
      source: 'Market Analysis',
      trending: true,
    },
    {
      id: 5,
      headline: 'Cloud gaming latency drops below 10ms for the first time',
      body: 'Breakthrough server architecture has reduced cloud gaming latency to near-native levels, potentially eliminating the need for gaming hardware.',
      publishedAt: new Date(now - 3 * oneDay).toISOString(),
      source: 'Tech News',
      trending: true,
    },
  ];

  respond(res, 200, true, 'Trending news fetched successfully.', news);
};
