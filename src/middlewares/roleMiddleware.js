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
export const roleGuard = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Not authenticated.',
      data: null,
      error: null,
    });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: [${roles.join(', ')}].`,
      data: null,
      error: null,
    });
  }

  next();
};
