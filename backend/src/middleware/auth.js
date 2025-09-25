const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token format. Use Bearer token'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const userResult = await pool.query(
      'SELECT id, username, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User no longer exists'
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User account is disabled'
      });
    }

    // Add user info to request object
    req.user = {
      userId: user.id,
      username: user.username,
      role: user.role
    };

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Admin only middleware
const adminOnly = authorize('admin');

// Admin or technician middleware
const technicianOrAdmin = authorize('admin', 'technician');

module.exports = {
  auth,
  authorize,
  adminOnly,
  technicianOrAdmin
};
