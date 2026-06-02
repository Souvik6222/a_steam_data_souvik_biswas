import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/db.js';

// ── Routes ───────────────────────────────────────────────────────
import userRoutes        from './src/routes/userRoutes.js';
import gameRoutes        from './src/routes/gameRoutes.js';
import searchRoutes      from './src/routes/searchRoutes.js';
import authRoutes        from './src/routes/authRoutes.js';
import jwtRoutes         from './src/routes/jwtRoutes.js';
import middlewareRoutes  from './src/routes/middlewareRoutes.js';
import analyticsRoutes  from './src/routes/analyticsRoutes.js';
import statsRoutes       from './src/routes/statsRoutes.js';

// ── Middlewares ──────────────────────────────────────────────────
import requestLogger     from './src/middlewares/requestLogger.js';
import { generalLimiter } from './src/middlewares/rateLimiter.js';
import errorHandler      from './src/middlewares/errorHandler.js';
import { notFound }      from './src/middlewares/errorMiddleware.js';

// Load environment variables from .env file
dotenv.config();

// Establish database connection
connectDB();

const app = express();

// ── Standard body/cors middlewares ──────────────────────────────
app.use(cors());
app.use(express.json());

// ── 1. Request logger (fires on every request) ───────────────────
app.use(requestLogger);

// ── 2. General rate limiter (global) ────────────────────────────
app.use(generalLimiter);

// ── Health check endpoint ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'healthy', message: 'API is up and running successfully.' });
});

// ── 3. Route handlers ────────────────────────────────────────────
app.use('/api/users',                userRoutes);
app.use('/api/games',                gameRoutes);
app.use('/api/v1/search',            searchRoutes);
app.use('/api/v1/auth',              authRoutes);
app.use('/api/v1/jwt',               jwtRoutes);
app.use('/api/v1/middleware',        middlewareRoutes);
app.use('/api/v1/analytics',         analyticsRoutes);
app.use('/api/v1/stats',             statsRoutes);

// ── 4. 404 fallback ──────────────────────────────────────────────
app.use(notFound);

// ── 5. Global error handler (must be last, 4 params) ────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
