/**
 * requestLogger.js
 * ─────────────────────────────────────────────────────────────────
 * Logs every incoming request in the format:
 *   [METHOD] /path - ISO-timestamp - Xms
 *
 * Uses res.on('finish') so the response time is measured from the
 * moment the request arrives until the response is fully flushed.
 *
 * Also stores the last 100 log entries in memory so the
 * /api/v1/activity/logs endpoint can return them.
 */

const MAX_LOGS = 100;

/** @type {Array<{ method: string, url: string, statusCode: number, duration: number, timestamp: string }>} */
export const requestLogs = [];

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration  = Date.now() - start;
    const timestamp = new Date().toISOString();

    console.log(`[${req.method}] ${req.originalUrl} - ${timestamp} - ${duration}ms`);

    // Store in memory (ring buffer — drop oldest when full)
    requestLogs.push({
      method:     req.method,
      url:        req.originalUrl,
      statusCode: res.statusCode,
      duration,
      timestamp,
    });
    if (requestLogs.length > MAX_LOGS) requestLogs.shift();
  });

  next();
};

export default requestLogger;
