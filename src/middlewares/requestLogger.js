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

// Maximum limit of log records stored in the in-memory circular buffer
const MAX_LOGS = 100;

/** 
 * Exported log storage array. Holds the records of recent incoming requests.
 * @type {Array<{ method: string, url: string, statusCode: number, duration: number, timestamp: string }>} 
 */
export const requestLogs = [];

/**
 * Middleware function that measures API endpoint latency and tracks requests.
 */
const requestLogger = (req, res, next) => {
  // Capture the start timestamp when the request begins processing
  const start = Date.now();

  // Listen to the 'finish' event of the response object.
  // This event fires when the response headers and payload have been successfully written and sent to the TCP connection.
  res.on('finish', () => {
    // Calculate difference between start timestamp and finish timestamp (latency duration in milliseconds)
    const duration  = Date.now() - start;
    // Create an ISO format string of the current timestamp
    const timestamp = new Date().toISOString();

    // Log the request method, path, time, and execution duration to the terminal console
    console.log(`[${req.method}] ${req.originalUrl} - ${timestamp} - ${duration}ms`);

    // Store log record details in our exported memory array
    requestLogs.push({
      method:     req.method,
      url:        req.originalUrl,
      statusCode: res.statusCode,
      duration,
      timestamp,
    });
    
    // Ring buffer check: If the array length exceeds MAX_LOGS (100), pop the oldest element (first element) using array.shift()
    if (requestLogs.length > MAX_LOGS) requestLogs.shift();
  });

  // Call next() immediately so the request flow continues executing the actual controllers without blocking
  next();
};

// Export the logger middleware as the default export
export default requestLogger;
