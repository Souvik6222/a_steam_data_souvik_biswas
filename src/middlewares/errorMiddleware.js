/**
 * errorMiddleware.js
 * ─────────────────────────────────────────────────────────────────
 * Catches requests that don't match any registered route and returns
 * a friendly JSON response listing all available API endpoints.
 */

const availableRoutes = {
  'Health Check': {
    'GET /': 'Check if API is running',
  },
  'Users (Legacy)': {
    'POST   /api/users':         'Register a new user  — body: { name, email, password }',
    'POST   /api/users/login':   'Log in               — body: { email, password }',
    'GET    /api/users/profile':  'Get profile (JWT required)',
  },
  'Auth': {
    'POST   /api/v1/auth/register':        'Register            — body: { name, email, password }',
    'POST   /api/v1/auth/login':           'Log in              — body: { email, password }',
    'POST   /api/v1/auth/forgot-password': 'Forgot password     — body: { email }',
    'POST   /api/v1/auth/reset-password':  'Reset password      — body: { token, newPassword }',
    'POST   /api/v1/auth/send-otp':        'Send OTP            — body: { email }',
    'POST   /api/v1/auth/verify-email':    'Verify email        — body: { otpCode }',
    'GET    /api/v1/auth/profile':          'Get profile (JWT required)',
    'PATCH  /api/v1/auth/profile':          'Update profile (JWT required)',
    'POST   /api/v1/auth/change-password': 'Change password (JWT required)',
  },
  'Games': {
    'GET    /api/games':             'List all games (?page=&limit=&sort=)',
    'POST   /api/games':             'Create a game',
    'GET    /api/games/:appid':      'Get game by AppID',
    'PUT    /api/games/:appid':      'Replace a game',
    'PATCH  /api/games/:appid':      'Update a game',
    'DELETE /api/games/:appid':      'Delete a game',
  },
  'Games — Sort': {
    'GET /api/games/sort/price-desc':       'Sort by price (high → low)',
    'GET /api/games/sort/rating-desc':      'Sort by rating (high → low)',
    'GET /api/games/sort/downloads-desc':   'Sort by downloads (high → low)',
    'GET /api/games/sort/releaseDate-desc': 'Sort by release date (newest)',
    'GET /api/games/sort/popularity-desc':  'Sort by popularity (high → low)',
  },
  'Games — Filter': {
    'GET /api/games/filter/free-to-play':       'Free-to-play games',
    'GET /api/games/filter/paid':                'Paid games',
    'GET /api/games/filter/discounted':          'Discounted games',
    'GET /api/games/filter/early-access':        'Early-access games',
    'GET /api/games/filter/vr-only':             'VR-only games',
    'GET /api/games/filter/controller-support':  'Controller-supported games',
    'GET /api/games/filter/multiplayer':         'Multiplayer games',
    'GET /api/games/filter/singleplayer':        'Singleplayer games',
    'GET /api/games/filter/coop':                'Co-op games',
    'GET /api/games/filter/open-world':          'Open-world games',
    'GET /api/games/filter/survival':            'Survival games',
    'GET /api/games/filter/horror':              'Horror games',
    'GET /api/games/filter/anime':               'Anime games',
    'GET /api/games/filter/indie':               'Indie games',
    'GET /api/games/filter/top-rated':           'Top-rated games',
  },
  'Games — By Parameter': {
    'GET /api/games/genre/:genre':           'e.g. /genre/Action',
    'GET /api/games/developer/:developer':   'e.g. /developer/Valve',
    'GET /api/games/publisher/:publisher':   'e.g. /publisher/EA',
    'GET /api/games/platform/:platform':     'e.g. /platform/linux',
    'GET /api/games/tag/:tag':               'e.g. /tag/roguelike',
    'GET /api/games/release-year/:year':     'e.g. /release-year/2023',
    'GET /api/games/rating/:rating':         'e.g. /rating/8',
    'GET /api/games/price/:price':           'e.g. /price/20',
    'GET /api/games/feature/:feature':       'e.g. /feature/coop',
  },
  'Games — Sub-Resources': {
    'GET    /api/games/:appid/exists':               'Check if game exists',
    'GET    /api/games/:appid/summary':              'Game summary',
    'GET    /api/games/:appid/update-history':       'Update history',
    'GET    /api/games/:appid/related':              'Related games',
    'PATCH  /api/games/:appid/archive':              'Archive a game',
    'PATCH  /api/games/:appid/restore':              'Restore a game',
    'GET    /api/games/:appid/screenshots':          'Screenshots',
    'GET    /api/games/:appid/trailers':             'Trailers',
    'GET    /api/games/:appid/reviews':              'Get reviews',
    'POST   /api/games/:appid/reviews':              'Add a review',
    'PATCH  /api/games/:appid/reviews/:reviewId':    'Update a review',
    'DELETE /api/games/:appid/reviews/:reviewId':    'Delete a review',
    'GET    /api/games/:appid/system-requirements':  'System requirements',
    'GET    /api/games/:appid/dlc':                  'DLC list',
    'GET    /api/games/:appid/achievements':         'Achievements',
    'GET    /api/games/:appid/leaderboard':          'Leaderboards',
    'GET    /api/games/:appid/updates':              'Patch updates',
    'GET    /api/games/:appid/news':                 'News feed',
  },
  'Search': {
    'GET /api/v1/search?q=&page=&limit=': 'Search games by keyword',
  },
  'Statistics': {
    'GET /api/v1/stats/count':              'Total active game count',
    'GET /api/v1/stats/top-rated':          'Top 10 by rating',
    'GET /api/v1/stats/most-downloaded':    'Top 10 by downloads',
    'GET /api/v1/stats/average-price':      'Avg / min / max price',
    'GET /api/v1/stats/average-rating':     'Avg / min / max rating',
    'GET /api/v1/stats/genre-count':        'Games per genre',
    'GET /api/v1/stats/platform-count':     'Games per platform',
    'GET /api/v1/stats/free-to-play-count': 'Free-to-play count',
    'GET /api/v1/stats/multiplayer-count':  'Multiplayer count',
    'GET /api/v1/stats/monthly-releases':   'Monthly release count',
  },
  'Analytics': {
    'GET /api/v1/analytics/top-rated':              'Top rated games',
    'GET /api/v1/analytics/most-downloaded':         'Most downloaded',
    'GET /api/v1/analytics/revenue':                 'Revenue per developer',
    'GET /api/v1/analytics/platform-distribution':   'Platform distribution',
    'GET /api/v1/analytics/genre-distribution':      'Genre distribution',
    'GET /api/v1/analytics/trending':                'Trending games',
    'GET /api/v1/analytics/release-trends':          'Release trends by year',
    'GET /api/v1/analytics/review-analysis':         'Review score analysis',
    'GET /api/v1/analytics/wishlist-analysis':       'Wishlist analysis',
    'GET /api/v1/analytics/user-activity':           'Activity per developer',
  },
  'JWT (all require JWT)': {
    'GET    /api/v1/jwt/profile':          'User profile from token',
    'GET    /api/v1/jwt/dashboard':        'Dashboard snapshot',
    'POST   /api/v1/jwt/generate-token':   'Generate token (admin only)',
    'POST   /api/v1/jwt/verify-token':     'Verify a token',
    'POST   /api/v1/jwt/refresh-token':    'Refresh a token',
    'DELETE /api/v1/jwt/revoke-token':     'Revoke current token',
    'GET    /api/v1/jwt/private-games':    'Auth-gated games list',
    'GET    /api/v1/jwt/private-analytics':'Auth-gated analytics',
  },
  'Protected (JWT required)': {
    'POST   /api/v1/protected/games':          'Create a game',
    'PATCH  /api/v1/protected/games/:appid':   'Update a game',
    'DELETE /api/v1/protected/games/:appid':   'Delete a game',
  },
  'Admin (JWT + admin role required)': {
    'GET /api/v1/admin/games':      'All games (incl. archived)',
    'GET /api/v1/admin/analytics':  'Admin analytics',
    'GET /api/v1/admin/reports':    'Admin reports',
  },
  'Middleware Demo': {
    'GET /api/v1/middleware/logger':        'Logger demo',
    'GET /api/v1/middleware/auth':          'Auth limiter demo',
    'GET /api/v1/middleware/rate-limit':    'Rate-limit demo',
    'GET /api/v1/middleware/error-handler': 'Error handler demo (?type=validation|cast|duplicate|custom)',
  },
  'Advanced': {
    'GET /api/v1/games/random':                  'Random game',
    'GET /api/v1/recommendations/games/:appid':  'Game recommendations',
    'GET /api/v1/trending/games':                'Trending games (last 90 days)',
    'GET /api/v1/compare/games/:id1/:id2':       'Compare two games side-by-side',
    'GET /api/v1/timeline/game/:appid':          'Game update timeline',
    'GET /api/v1/activity/logs':                 'Last 20 request logs',
    'GET /api/v1/news/latest':                   'Latest news (mock)',
    'GET /api/v1/news/trending':                 'Trending news (mock)',
  },
  'Notifications': {
    'GET    /api/v1/notifications':            'List all notifications',
    'PATCH  /api/v1/notifications/read/:id':   'Mark notification as read',
    'DELETE /api/v1/notifications/:id':        'Delete a notification',
  },
  'System': {
    'GET /api/v1/health':          'Health check (status, uptime, timestamp)',
    'GET /api/v1/system/info':     'System info (node version, env, DB status)',
    'GET /api/v1/system/version':  'API version from package.json',
  },
};

export const notFound = (req, res, _next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    hint: 'Check the method (GET/POST/PATCH/DELETE) and the URL. Browse the available routes below.',
    availableRoutes,
  });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
