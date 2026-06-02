/**
 * notificationRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * In-memory notification routes.
 *
 * Mounted at /api/v1/notifications in server.js.
 */

import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = Router();

router.get('/',         getNotifications);   // GET    /api/v1/notifications
router.patch('/read/:id', markAsRead);       // PATCH  /api/v1/notifications/read/:id
router.delete('/:id',  deleteNotification);  // DELETE /api/v1/notifications/:id

export default router;
