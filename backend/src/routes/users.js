const express = require('express');
const bcrypt = require('bcryptjs');
const { body, query, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { auth, adminOnly, technicianOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', [
  auth,
  adminOnly,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['admin', 'technician', 'user']).withMessage('Invalid role'),
  query('search').optional().isLength({ max: 100 }).withMessage('Search term too long')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      role,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query conditions
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Filter by role
    if (role) {
      paramCount++;
      whereConditions.push(`role = $${paramCount}`);
      queryParams.push(role);
    }

    // Search functionality
    if (search) {
      paramCount++;
      whereConditions.push(`(username ILIKE $${paramCount} OR email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Valid sort columns
    const validSortColumns = ['username', 'email', 'role', 'created_at', 'last_login'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get users
    const usersQuery = `
      SELECT 
        id,
        username,
        email,
        first_name,
        last_name,
        role,
        created_at,
        last_login,
        is_active
      FROM users
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const usersResult = await pool.query(usersQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, queryParams.slice(0, -2)); // Remove limit and offset
    const totalUsers = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users: usersResult.rows.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        isActive: user.is_active
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to retrieve users',
      message: 'An error occurred while retrieving users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin or own profile)
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user can access this profile
    if (req.user.role !== 'admin' && req.user.userId !== parseInt(userId)) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You can only access your own profile'
      });
    }

    const userResult = await pool.query(`
      SELECT 
        id,
        username,
        email,
        first_name,
        last_name,
        role,
        created_at,
        updated_at,
        last_login,
        is_active
      FROM users 
      WHERE id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    const user = userResult.rows[0];

    // Get user statistics
    const statsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM devices WHERE user_id = $1) as device_count,
        (SELECT COUNT(*) FROM issues WHERE user_id = $1) as issue_count,
        (SELECT COUNT(*) FROM issues WHERE user_id = $1 AND status = 'open') as open_issues,
        (SELECT COUNT(*) FROM issues WHERE assigned_to = $1) as assigned_issues
    `, [userId]);

    const stats = statsResult.rows[0];

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login,
        isActive: user.is_active,
        statistics: {
          deviceCount: parseInt(stats.device_count),
          issueCount: parseInt(stats.issue_count),
          openIssues: parseInt(stats.open_issues),
          assignedIssues: parseInt(stats.assigned_issues)
        }
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user',
      message: 'An error occurred while retrieving the user'
    });
  }
});

// @route   POST /api/users
// @desc    Create a new user (Admin only)
// @access  Private (Admin)
router.post('/', [
  auth,
  adminOnly,
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .isIn(['admin', 'technician', 'user'])
    .withMessage('Invalid role'),
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { username, email, password, role, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'A user with this email or username already exists'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await pool.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, username, email, first_name, last_name, role, created_at`,
      [username, email, passwordHash, firstName, lastName, role]
    );

    const user = newUser.rows[0];

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Failed to create user',
      message: 'An error occurred while creating the user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user information
// @access  Private (Admin or own profile)
router.put('/:id', [
  auth,
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'technician', 'user'])
    .withMessage('Invalid role')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.params.id;
    const updates = req.body;

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Check permissions
    const isOwnProfile = req.user.userId === parseInt(userId);
    const isAdmin = req.user.role === 'admin';

    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You can only update your own profile'
      });
    }

    // Regular users cannot change their role
    if (!isAdmin && updates.role) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You cannot change your own role'
      });
    }

    // Check for duplicate username/email
    if (updates.username || updates.email) {
      const checkQuery = [];
      const checkParams = [];
      
      if (updates.username) {
        checkQuery.push('username = $1');
        checkParams.push(updates.username);
      }
      
      if (updates.email) {
        checkQuery.push(`email = $${checkParams.length + 1}`);
        checkParams.push(updates.email);
      }
      
      checkParams.push(userId);
      
      const duplicateCheck = await pool.query(
        `SELECT id FROM users WHERE (${checkQuery.join(' OR ')}) AND id != $${checkParams.length}`,
        checkParams
      );

      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({
          error: 'Duplicate data',
          message: 'Username or email already exists'
        });
      }
    }

    // Build update query
    const allowedFields = ['username', 'email', 'first_name', 'last_name', 'role'];
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    Object.keys(updates).forEach(key => {
      const dbField = key === 'firstName' ? 'first_name' : 
                     key === 'lastName' ? 'last_name' : key;
      
      if (allowedFields.includes(dbField) && updates[key] !== undefined) {
        paramCount++;
        updateFields.push(`${dbField} = $${paramCount}`);
        updateValues.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
        message: 'Please provide at least one valid field to update'
      });
    }

    // Add updated_at timestamp
    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(new Date());

    // Add user ID for WHERE clause
    paramCount++;
    updateValues.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, username, email, first_name, last_name, role, updated_at
    `;

    const updatedUser = await pool.query(updateQuery, updateValues);

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.rows[0].id,
        username: updatedUser.rows[0].username,
        email: updatedUser.rows[0].email,
        firstName: updatedUser.rows[0].first_name,
        lastName: updatedUser.rows[0].last_name,
        role: updatedUser.rows[0].role,
        updatedAt: updatedUser.rows[0].updated_at
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: 'An error occurred while updating the user'
    });
  }
});

// @route   PUT /api/users/:id/password
// @desc    Change user password
// @access  Private (Admin or own profile)
router.put('/:id/password', [
  auth,
  body('currentPassword')
    .if((value, { req }) => req.user.role !== 'admin' || req.user.userId === parseInt(req.params.id))
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    // Check permissions
    const isOwnProfile = req.user.userId === parseInt(userId);
    const isAdmin = req.user.role === 'admin';

    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You can only change your own password'
      });
    }

    // Get current user data
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    const user = userResult.rows[0];

    // Verify current password (unless admin changing someone else's password)
    if (!isAdmin || isOwnProfile) {
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: 'Invalid password',
          message: 'Current password is incorrect'
        });
      }
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: 'An error occurred while changing the password'
    });
  }
});

// @route   PUT /api/users/:id/status
// @desc    Activate/Deactivate user (Admin only)
// @access  Private (Admin)
router.put('/:id/status', [
  auth,
  adminOnly,
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.params.id;
    const { isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (req.user.userId === parseInt(userId) && !isActive) {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'You cannot deactivate your own account'
      });
    }

    // Check if user exists
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    const username = userResult.rows[0].username;

    // Update user status
    await pool.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [isActive, userId]
    );

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      username,
      isActive
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      error: 'Failed to update user status',
      message: 'An error occurred while updating the user status'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user (Admin only)
// @access  Private (Admin)
router.delete('/:id', [auth, adminOnly], async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (req.user.userId === parseInt(userId)) {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'You cannot delete your own account'
      });
    }

    // Check if user exists
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    const username = userResult.rows[0].username;

    // Delete user (this will set user_id to NULL in related tables due to ON DELETE SET NULL)
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({
      message: 'User deleted successfully',
      username
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: 'An error occurred while deleting the user'
    });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics (Admin/Technician only)
// @access  Private (Admin/Technician)
router.get('/stats/overview', [auth, technicianOrAdmin], async (req, res) => {
  try {
    // Get user counts by role
    const roleStats = await pool.query(`
      SELECT 
        role,
        COUNT(*) as count
      FROM users
      WHERE is_active = true
      GROUP BY role
      ORDER BY role
    `);

    // Get total users
    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_active = true');

    // Get new users (last 30 days)
    const newUsers = await pool.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
        AND is_active = true
    `);

    // Get active users (logged in last 7 days)
    const activeUsers = await pool.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE last_login >= NOW() - INTERVAL '7 days'
        AND is_active = true
    `);

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      newUsersThisMonth: parseInt(newUsers.rows[0].count),
      activeUsersThisWeek: parseInt(activeUsers.rows[0].count),
      roleBreakdown: roleStats.rows.reduce((acc, row) => {
        acc[row.role] = parseInt(row.count);
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user statistics',
      message: 'An error occurred while retrieving user statistics'
    });
  }
});

module.exports = router;
