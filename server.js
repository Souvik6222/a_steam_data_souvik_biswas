import 'dotenv/config';
import express from 'express';
import cors    from 'cors';
import connectDB from './src/config/db.js';


// ── Database ──────────────────────────────────────────────────────
connectDB();

// ── Route imports ─────────────────────────────────────────────────
//
// MOUNT ORDER RULES (critical for Express path matching):
//
//  1. Static prefix routes must come BEFORE wildcard/param routes
//     that share the same mount point.
//
//  2. Within /api/v1 the specific-path routers (search, auth, jwt,
//     analytics, stats, admin, protected, notifications) are mounted
//     BEFORE the two catch-all /api/v1 routers (advancedRoutes,
//     systemRoutes) so their static paths win the match first.
//
//  Mount order (final):
//    /api/users             → userRoutes       (legacy user CRUD)
//    /api/games             → gameRoutes       (full CRUD + sub-resources)
//    /api/v1/search         → searchRoutes
//    /api/v1/auth           → authRoutes
//    /api/v1/jwt            → jwtRoutes        (JWT token management)
//    /api/v1/middleware      → middlewareRoutes (demo)
//    /api/v1/analytics      → analyticsRoutes
//    /api/v1/stats          → statsRoutes
//    /api/v1/admin          → adminRoutes      (JWT + admin role)
//    /api/v1/protected      → protectedRoutes  (JWT required)
//    /api/v1/notifications  → notificationRoutes (in-memory)
//    /api/v1                → advancedRoutes   (random, trending, compare…)
//    /api/v1                → systemRoutes     (health, system/info, version)

import userRoutes          from './src/routes/userRoutes.js';
import gameRoutes          from './src/routes/gameRoutes.js';
import searchRoutes        from './src/routes/searchRoutes.js';
import authRoutes          from './src/routes/authRoutes.js';
import jwtRoutes           from './src/routes/jwtRoutes.js';
import middlewareRoutes    from './src/routes/middlewareRoutes.js';
import analyticsRoutes     from './src/routes/analyticsRoutes.js';
import statsRoutes         from './src/routes/statsRoutes.js';
import adminRoutes         from './src/routes/adminRoutes.js';
import protectedRoutes     from './src/routes/protectedRoutes.js';
import notificationRoutes  from './src/routes/notificationRoutes.js';
import advancedRoutes      from './src/routes/advancedRoutes.js';
import systemRoutes        from './src/routes/systemRoutes.js';

// ── Middleware imports ────────────────────────────────────────────
import requestLogger        from './src/middlewares/requestLogger.js';
import { generalLimiter }   from './src/middlewares/rateLimiter.js';
import errorHandler         from './src/middlewares/errorHandler.js';
import { notFound }         from './src/middlewares/errorMiddleware.js';

const app = express();

// ── 1. Core middlewares ───────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── 2. Request logger (captures every request in memory) ─────────
app.use(requestLogger);

// ── 3. Global rate limiter ────────────────────────────────────────
app.use(generalLimiter);

// ── 4. Root health-check (outside versioned API) ─────────────────
app.get('/', (req, res) => {
  res.json({
    status:  'healthy',
    message: 'Steam Data API is up and running.',
    docs:    'See /api/v1/health for detailed status.',
  });
});

// ── 5. Route handlers (see mount-order comment above) ────────────

// Legacy (pre-v1) user routes
app.use('/api/users',                userRoutes);

// Core game resource (static sub-paths inside gameRoutes are
// already registered before param routes — see src/routes/gameRoutes.js)
app.use('/api/games',                gameRoutes);

// ── Specific-path /api/v1 routes (must precede catch-all /api/v1) ──
app.use('/api/v1/search',            searchRoutes);
app.use('/api/v1/auth',              authRoutes);
app.use('/api/v1/jwt',               jwtRoutes);
app.use('/api/v1/middleware',        middlewareRoutes);
app.use('/api/v1/analytics',         analyticsRoutes);
app.use('/api/v1/stats',             statsRoutes);
app.use('/api/v1/admin',             adminRoutes);       // JWT + role:admin
app.use('/api/v1/protected',         protectedRoutes);   // JWT required
app.use('/api/v1/notifications',     notificationRoutes);// In-memory notifications

// ── Catch-all /api/v1 routers (must come last within /api/v1) ────
app.use('/api/v1',                   advancedRoutes);   // random, trending, compare…
app.use('/api/v1',                   systemRoutes);     // health, system/info, version

// ── 6. 404 fallback ───────────────────────────────────────────────
app.use(notFound);

// ── 7. Global error handler (4-arg — must be last middleware) ─────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀  Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});
