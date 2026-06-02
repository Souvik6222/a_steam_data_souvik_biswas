/**
 * searchRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mounted at: /api/v1/search
 */

import { Router } from 'express';
import { search } from '../controllers/searchController.js';
import { addHeadOptions } from '../utils/httpMethods.js';

const router = Router();

// GET /api/v1/search?q=&page=&limit=
router.get('/', search);

// HEAD + OPTIONS: search endpoint
addHeadOptions(router, '/', 'GET, HEAD, OPTIONS');

export default router;
