/**
 * httpMethods.js
 * ─────────────────────────────────────────────────────────────────
 * Shared factory helpers for adding HEAD and OPTIONS handlers to
 * Express routers without repeating boilerplate across every route file.
 *
 * Usage:
 *   import { head, options, headOptions } from '../utils/httpMethods.js';
 *
 *   // HEAD only
 *   router.head('/games', head('GET, POST, HEAD, OPTIONS'));
 *
 *   // OPTIONS only
 *   router.options('/games', options('GET, POST, HEAD, OPTIONS'));
 *
 *   // Both at once (returns [headHandler, optionsHandler] — use spread)
 *   router.head('/games',    ...headOptions('GET, POST, HEAD, OPTIONS'));
 *   router.options('/games', ...headOptions('GET, POST, HEAD, OPTIONS'));
 *
 *   // Or via the register helper which adds both to a router in one call:
 *   addHeadOptions(router, '/games', 'GET, POST, HEAD, OPTIONS');
 *
 * HEAD semantics (RFC 9110 §9.3.2):
 *   - Identical to GET but MUST NOT send a body.
 *   - We set Content-Type so clients know what they'd receive.
 *   - Optionally set X-Total-Count for collection endpoints.
 *
 * OPTIONS semantics (RFC 9110 §9.3.7):
 *   - Describes the communication options for the target resource.
 *   - We set the Allow header listing all supported methods.
 */

/**
 * Returns a HEAD handler that sets Content-Type + Allow and ends with no body.
 * @param {string} allow  - Comma-separated allowed methods, e.g. 'GET, POST, HEAD, OPTIONS'
 * @param {object} [extraHeaders={}] - Any additional headers to set (e.g. X-Total-Count)
 */
export const head = (allow, extraHeaders = {}) => (req, res) => {
  res.set('Content-Type', 'application/json');
  res.set('Allow', allow);
  for (const [key, value] of Object.entries(extraHeaders)) {
    res.set(key, value);
  }
  res.status(200).end();
};

/**
 * Returns an OPTIONS handler that sets Allow and ends with no body.
 * @param {string} allow - Comma-separated allowed methods
 */
export const options = (allow) => (req, res) => {
  res.set('Allow', allow);
  res.set('Content-Type', 'application/json');
  res.status(200).end();
};

/**
 * Registers both HEAD and OPTIONS on a router for the given path.
 * Keeps route files DRY — one call per path.
 *
 * @param {import('express').Router} router
 * @param {string} path    - Route path, e.g. '/' or '/:appid'
 * @param {string} allow   - Comma-separated allowed methods
 * @param {object} [extraHeaders={}] - Extra headers for the HEAD response
 */
export const addHeadOptions = (router, path, allow, extraHeaders = {}) => {
  router.head(path,    head(allow, extraHeaders));
  router.options(path, options(allow));
};
