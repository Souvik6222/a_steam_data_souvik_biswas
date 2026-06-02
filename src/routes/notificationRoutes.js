/**
 * notificationRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * In-memory notification routes.
 *
 * Mounted at /api/v1/notifications in server.js.
 *
 * HEAD + OPTIONS registered for all paths.
 */

import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { addHeadOptions } from '../utils/httpMethods.js';

const router = Router();

router.get('/',           getNotifications);   // GET    /api/v1/notifications
router.patch('/read/:id', markAsRead);         // PATCH  /api/v1/notifications/read/:id
router.delete('/:id',     deleteNotification); // DELETE /api/v1/notifications/:id

// ── HEAD + OPTIONS ────────────────────────────────────────────────────────────
addHeadOptions(router, '/',          'GET, HEAD, OPTIONS');
addHeadOptions(router, '/read/:id',  'PATCH, HEAD, OPTIONS');
addHeadOptions(router, '/:id',       'DELETE, HEAD, OPTIONS');

export default router;
