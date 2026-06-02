/**
 * systemRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * System-level informational routes.
 *
 * Mounted at /api/v1 in server.js (alongside advancedRoutes).
 *
 *   GET /api/v1/health          → health check
 *   GET /api/v1/system/info     → runtime & database info
 *   GET /api/v1/system/version  → version from package.json
 */

import { Router } from 'express';
import mongoose   from 'mongoose';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join }  from 'path';
import { addHeadOptions } from '../utils/httpMethods.js';

const router = Router();

// ── Resolve the project root so we can read package.json ──────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const PKG_PATH   = join(__dirname, '..', '..', 'package.json');

// ── Shared response helper ────────────────────────────────────────────────────
const respond = (res, code, success, message, data) =>
  res.status(code).json({ success, message, data });

// ── Mongoose readyState labels ────────────────────────────────────────────────
const DB_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/health
// ─────────────────────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  respond(res, 200, true, 'API is healthy.', {
    status:    'ok',
    uptime:    `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/system/info
// ─────────────────────────────────────────────────────────────────────────────
router.get('/system/info', (req, res) => {
  const dbState = mongoose.connection.readyState;

  respond(res, 200, true, 'System info fetched successfully.', {
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    platform:    process.platform,
    memoryUsage: process.memoryUsage(),
    database: {
      status: DB_STATES[dbState] ?? 'unknown',
      host:   mongoose.connection.host || null,
      name:   mongoose.connection.name || null,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/system/version
// ─────────────────────────────────────────────────────────────────────────────
router.get('/system/version', async (req, res, next) => {
  try {
    const raw = await readFile(PKG_PATH, 'utf8');
    const pkg = JSON.parse(raw);

    respond(res, 200, true, 'Version info fetched successfully.', {
      name:        pkg.name,
      version:     pkg.version,
      description: pkg.description,
    });
  } catch (err) {
    next(err);
  }
});

// ── HEAD + OPTIONS ────────────────────────────────────────────────────────────
addHeadOptions(router, '/health',         'GET, HEAD, OPTIONS');
addHeadOptions(router, '/system/info',    'GET, HEAD, OPTIONS');
addHeadOptions(router, '/system/version', 'GET, HEAD, OPTIONS');

export default router;
