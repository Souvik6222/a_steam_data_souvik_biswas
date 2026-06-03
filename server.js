// Load environment variables from a .env file into process.env using dotenv/config
import 'dotenv/config';
// Import express framework to create the HTTP server and API routing
import express from 'express';
// Import cors (Cross-Origin Resource Sharing) middleware to allow cross-origin requests
import cors    from 'cors';
// Import database connection configuration function
import connectDB from './src/config/db.js';


// ── Database Connection ─────────────────────────────────────────────
// Execute the connectDB function to connect to the MongoDB instance
connectDB();

// ── Route imports ─────────────────────────────────────────────────
// Import custom routers for different API endpoints.
//
// MOUNT ORDER RULES (critical for Express path matching):
//  1. Static prefix routes must come BEFORE wildcard/param routes that share the same mount point.
//  2. Within /api/v1, specific-path routers (search, auth, jwt, analytics, stats, admin, protected, notifications)
//     are mounted BEFORE the catch-all /api/v1 routers (advancedRoutes, systemRoutes) so their static paths win the match first.
//
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
// Import request logging middleware to log incoming API request details
import requestLogger        from './src/middlewares/requestLogger.js';
// Import rate limiters to limit client request frequency and prevent abuse
import { generalLimiter }   from './src/middlewares/rateLimiter.js';
// Import global centralized error handler middleware
import errorHandler         from './src/middlewares/errorHandler.js';
// Import fallback handler for unmatched paths (404 Not Found)
import { notFound }         from './src/middlewares/errorMiddleware.js';

// Initialize the Express application instance
const app = express();

// ── 1. Core middlewares ───────────────────────────────────────────
// Enable CORS middleware with default configuration (allows all origins)
app.use(cors());
// Parse incoming requests with JSON payloads (adds parsed body object to req.body)
app.use(express.json());
// Parse incoming requests with urlencoded payloads (standard form submissions)
app.use(express.urlencoded({ extended: false }));

// ── 2. Request logger (captures every request in memory) ─────────
// Mount the custom logging middleware to run on every incoming request
app.use(requestLogger);

// ── 3. Global rate limiter ────────────────────────────────────────
// Apply rate limiting globally to all API routes (100 requests per 15 minutes per IP)
app.use(generalLimiter);

// ── 4. Root health-check (outside versioned API) ─────────────────
// Register a simple GET endpoint at the root URL ('/') to check if the server is alive
app.get('/', (req, res) => {
  // Respond with HTTP status 200 (OK) and basic health info in JSON format
  res.json({
    status:  'healthy',
    message: 'Steam Data API is up and running.',
    docs:    'See /api/v1/health for detailed status.',
  });
});

// ── 5. Route handlers (see mount-order comment above) ────────────

// Mount legacy (pre-v1) user management routes at '/api/users'
app.use('/api/users',                userRoutes);

// Mount the core steam games resource router at '/api/games'
app.use('/api/games',                gameRoutes);

// ── Specific-path /api/v1 routes (must precede catch-all /api/v1) ──
// Mount search query operations
app.use('/api/v1/search',            searchRoutes);
// Mount authentication endpoints (login, register)
app.use('/api/v1/auth',              authRoutes);
// Mount JWT helper/verification endpoints
app.use('/api/v1/jwt',               jwtRoutes);
// Mount middleware testing demo endpoints
app.use('/api/v1/middleware',        middlewareRoutes);
// Mount analytics pipelines (prices, publishers, dates)
app.use('/api/v1/analytics',         analyticsRoutes);
// Mount stats summary endpoints
app.use('/api/v1/stats',             statsRoutes);
// Mount admin dashboard endpoints (protected by JWT + admin role check)
app.use('/api/v1/admin',             adminRoutes);       
// Mount user-protected demo endpoints (protected by JWT check)
app.use('/api/v1/protected',         protectedRoutes);   
// Mount in-memory notification management endpoints
app.use('/api/v1/notifications',     notificationRoutes);

// ── Catch-all /api/v1 routers (must come last within /api/v1) ────
// Mount advanced operations (e.g., random game, trending list, comparisons)
app.use('/api/v1',                   advancedRoutes);   
// Mount system level utilities (e.g., detailed health status, process uptime)
app.use('/api/v1',                   systemRoutes);     

// ── 6. 404 fallback ───────────────────────────────────────────────
// If no routes matched the request, call the notFound middleware to trigger a 404
app.use(notFound);

// ── 7. Global error handler (4-arg signature — must be the last middleware) ─────
// Catches all next(err) calls thrown by routes/controllers and formats them cleanly
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────
// Retrieve port from env variables, or default to 5000 if not specified
const PORT = process.env.PORT || 5000;

// Tell Express to start listening for incoming connections on the specified port
app.listen(PORT, () => {
  // Log message indicating the server is running and in which environment mode
  console.log(
    `🚀  Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});
