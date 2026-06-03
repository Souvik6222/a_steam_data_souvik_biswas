// Import jsonwebtoken library to verify and decode signed JWTs
import jwt from 'jsonwebtoken';

/**
 * Middleware function to authenticate incoming requests via a JSON Web Token (JWT).
 * Signature is (req, res, next) which is standard for Express middlewares.
 * 
 * Verifies the Bearer JWT in the Authorization header.
 * On success, attaches `req.user = { id, role }` and calls next() to pass execution to the next handler.
 * On failure, returns a 401 Unauthorized status response.
 */
const authMiddleware = (req, res, next) => {
  // Extract the 'authorization' header from the incoming request headers
  const authHeader = req.headers.authorization;

  // Check if the header exists and starts with the standard prefix 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If authorization header is missing or malformed, return 401 Unauthorized immediately
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
      data: null,
      error: null,
    });
  }

  // Split the header string by space and retrieve the token part (index 1 of the resulting array)
  // Example: "Bearer <token>" -> ["Bearer", "<token>"]
  const token = authHeader.split(' ')[1];

  try {
    // Verify the authenticity and expiration of the token using jwt.verify and our server's secret key (process.env.JWT_SECRET)
    // If the token is invalid or expired, this method throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the decoded payload properties (id and role) to the req.user object so subsequent routes can access them
    req.user = { id: decoded.id, role: decoded.role };
    
    // Call next() to pass the request control to the next middleware or route handler in the execution stack
    next();
  } catch (error) {
    // If jwt.verify fails (e.g. token signature is modified or expired), return 401 Unauthorized
    return res.status(401).json({
      success: false,
      message: 'Access denied. Token is invalid or expired.',
      data: null,
      error: null,
    });
  }
};

// Export authMiddleware as the default export
export default authMiddleware;
