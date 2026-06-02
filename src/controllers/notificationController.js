/**
 * notificationController.js
 * ─────────────────────────────────────────────────────────────────────────────
 * In-memory notification system.
 *
 * Route → Handler mapping:
 *   GET    /api/v1/notifications          → getNotifications
 *   PATCH  /api/v1/notifications/read/:id → markAsRead
 *   DELETE /api/v1/notifications/:id      → deleteNotification
 */

// ── Shared response helper ────────────────────────────────────────────────────
const respond = (res, code, success, message, data = null) =>
  res.status(code).json({ success, message, data });

// ── In-memory store ───────────────────────────────────────────────────────────

let nextId = 1;

/** @type {Array<{ id: number, title: string, body: string, read: boolean, createdAt: string }>} */
const notifications = [];

// Seed a few sample notifications so the endpoint isn't empty on first hit
const seed = () => {
  if (notifications.length > 0) return;

  const now = Date.now();
  const hour = 60 * 60 * 1000;

  const items = [
    { title: 'Welcome!',                  body: 'Thanks for using the Steam Data API. Explore the /api/v1 endpoints to get started.' },
    { title: 'New games added',            body: '150 new game entries have been imported into the database.' },
    { title: 'Scheduled maintenance',      body: 'The API will undergo brief maintenance tonight at 02:00 UTC.' },
    { title: 'Rate limits updated',        body: 'Rate limits have been adjusted to 100 requests per 15 minutes per IP.' },
    { title: 'New analytics endpoints',    body: 'Check out /api/v1/analytics for rich data aggregations.' },
  ];

  items.forEach((item, i) => {
    notifications.push({
      id:        nextId++,
      title:     item.title,
      body:      item.body,
      read:      false,
      createdAt: new Date(now - (items.length - i) * hour).toISOString(),
    });
  });
};

seed();

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/notifications
// Returns all notifications, newest first.
// ─────────────────────────────────────────────────────────────────────────────
export const getNotifications = (req, res) => {
  const sorted = [...notifications].reverse(); // newest first
  respond(res, 200, true, 'Notifications fetched successfully.', {
    total:  sorted.length,
    unread: sorted.filter((n) => !n.read).length,
    items:  sorted,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/notifications/read/:id
// Marks a single notification as read.
// ─────────────────────────────────────────────────────────────────────────────
export const markAsRead = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const notification = notifications.find((n) => n.id === id);

  if (!notification) {
    return respond(res, 404, false, `Notification with id ${id} not found.`);
  }

  notification.read = true;
  respond(res, 200, true, 'Notification marked as read.', notification);
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/notifications/:id
// Removes a notification from memory.
// ─────────────────────────────────────────────────────────────────────────────
export const deleteNotification = (req, res) => {
  const id  = parseInt(req.params.id, 10);
  const idx = notifications.findIndex((n) => n.id === id);

  if (idx === -1) {
    return respond(res, 404, false, `Notification with id ${id} not found.`);
  }

  const [removed] = notifications.splice(idx, 1);
  respond(res, 200, true, 'Notification deleted successfully.', removed);
};
