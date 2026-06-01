import { Router } from 'express';
import { search } from '../controllers/searchController.js';

const router = Router();

// GET /api/v1/search?q=&page=&limit=
router.get('/', search);

export default router;
