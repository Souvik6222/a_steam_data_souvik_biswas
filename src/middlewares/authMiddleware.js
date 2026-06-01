import jwt from 'jsonwebtoken';

/**
 * Verifies the Bearer JWT in the Authorization header.
 * On success attaches `req.user = { id, role }` and calls next().
 * On failure returns 401.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
      data: null,
      error: null,
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Token is invalid or expired.',
      data: null,
      error: null,
    });
  }
};

export default authMiddleware;
