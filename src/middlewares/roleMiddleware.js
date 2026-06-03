/**
 * Role-based access guard middleware factory.
 *
 * Usage (in routes):
 *   import { roleGuard } from '../middlewares/roleMiddleware.js';
 *   router.delete('/:id', authMiddleware, roleGuard('admin'), deleteUser);
 *
 * @param {...string} roles — one or more allowed roles (e.g. 'admin', 'user')
 * @returns {import('express').RequestHandler}
 */

/**
 * Higher-order function (middleware factory) that returns an Express middleware.
 * Uses the ES6 rest operator (...roles) to capture any number of arguments as an array of allowed roles.
 */
export const roleGuard = (...roles) => (req, res, next) => {
  // First, verify that an authentication middleware has already run and attached the 'user' object to the request.
  if (!req.user) {
    // Return 401 Unauthorized because the client has not authenticated
    return res.status(401).json({
      success: false,
      message: 'Access denied. Not authenticated.',
      data: null,
      error: null,
    });
  }

  // Check if the authenticated user's role is included in the list of allowed roles using array.includes()
  if (!roles.includes(req.user.role)) {
    // Return 403 Forbidden because the user is authenticated but lacks the specific permissions/roles required to run the operation
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: [${roles.join(', ')}].`,
      data: null,
      error: null,
    });
  }

  // If the user's role is allowed, call next() to hand execution over to the controller
  next();
};
