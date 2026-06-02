/**
 * requestLogger.js
 * ─────────────────────────────────────────────────────────────────
 * Logs every incoming request in the format:
 *   [METHOD] /path - ISO-timestamp - Xms
 *
 * Uses res.on('finish') so the response time is measured from the
 * moment the request arrives until the response is fully flushed.
 */

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    console.log(`[${req.method}] ${req.originalUrl} - ${timestamp} - ${duration}ms`);
  });

  next();
};

export default requestLogger;
