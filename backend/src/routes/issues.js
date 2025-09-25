const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { auth, technicianOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/issues
// @desc    Get all issues with filtering and pagination
// @access  Private
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  query('assigned_to').optional().isInt({ min: 1 }).withMessage('Assigned to must be a positive integer'),
  query('user_id').optional().isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
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
      status,
      priority,
      assigned_to,
      user_id,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query conditions
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Filter by status
    if (status) {
      paramCount++;
      whereConditions.push(`i.status = $${paramCount}`);
      queryParams.push(status);
    }

    // Filter by priority
    if (priority) {
      paramCount++;
      whereConditions.push(`i.priority = $${paramCount}`);
      queryParams.push(priority);
    }

    // Filter by assigned technician
    if (assigned_to) {
      paramCount++;
      whereConditions.push(`i.assigned_to = $${paramCount}`);
      queryParams.push(assigned_to);
    }

    // Filter by user (for regular users, only show their issues)
    if (req.user.role === 'user') {
      paramCount++;
      whereConditions.push(`i.user_id = $${paramCount}`);
      queryParams.push(req.user.userId);
    } else if (user_id) {
      paramCount++;
      whereConditions.push(`i.user_id = $${paramCount}`);
      queryParams.push(user_id);
    }

    // Search functionality
    if (search) {
      paramCount++;
      whereConditions.push(`(i.title ILIKE $${paramCount} OR i.description ILIKE $${paramCount} OR i.category ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Valid sort columns
    const validSortColumns = ['title', 'status', 'priority', 'created_at', 'updated_at'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get issues with user and assignee information
    const issuesQuery = `
      SELECT 
        i.id,
        i.title,
        i.description,
        i.priority,
        i.status,
        i.created_at,
        i.updated_at,
        i.resolved_at,
        i.category,
        i.tags,
        u.username as user_username,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        a.username as assigned_username,
        a.first_name as assigned_first_name,
        a.last_name as assigned_last_name,
        a.email as assigned_email,
        d.name as device_name,
        d.id as device_id
      FROM issues i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN users a ON i.assigned_to = a.id
      LEFT JOIN devices d ON i.device_id = d.id
      ${whereClause}
      ORDER BY i.${sortColumn} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const issuesResult = await pool.query(issuesQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM issues i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN users a ON i.assigned_to = a.id
      LEFT JOIN devices d ON i.device_id = d.id
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, queryParams.slice(0, -2)); // Remove limit and offset
    const totalIssues = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalIssues / limit);

    res.json({
      issues: issuesResult.rows.map(issue => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        priority: issue.priority,
        status: issue.status,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        resolvedAt: issue.resolved_at,
        category: issue.category,
        tags: issue.tags,
        user: issue.user_username ? {
          username: issue.user_username,
          firstName: issue.user_first_name,
          lastName: issue.user_last_name,
          email: issue.user_email
        } : null,
        assignedTo: issue.assigned_username ? {
          username: issue.assigned_username,
          firstName: issue.assigned_first_name,
          lastName: issue.assigned_last_name,
          email: issue.assigned_email
        } : null,
        device: issue.device_name ? {
          id: issue.device_id,
          name: issue.device_name
        } : null
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalIssues,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({
      error: 'Failed to retrieve issues',
      message: 'An error occurred while retrieving issues'
    });
  }
});

// @route   GET /api/issues/:id
// @desc    Get issue by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const issueId = req.params.id;

    const issueResult = await pool.query(`
      SELECT 
        i.*,
        u.username as user_username,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        a.username as assigned_username,
        a.first_name as assigned_first_name,
        a.last_name as assigned_last_name,
        a.email as assigned_email,
        d.name as device_name,
        d.id as device_id
      FROM issues i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN users a ON i.assigned_to = a.id
      LEFT JOIN devices d ON i.device_id = d.id
      WHERE i.id = $1
    `, [issueId]);

    if (issueResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Issue not found',
        message: 'The requested issue does not exist'
      });
    }

    const issue = issueResult.rows[0];

    // Check if user can access this issue
    if (req.user.role === 'user' && issue.user_id !== req.user.userId) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You can only access your own issues'
      });
    }

    res.json({
      issue: {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        priority: issue.priority,
        status: issue.status,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        resolvedAt: issue.resolved_at,
        category: issue.category,
        tags: issue.tags,
        user: issue.user_username ? {
          username: issue.user_username,
          firstName: issue.user_first_name,
          lastName: issue.user_last_name,
          email: issue.user_email
        } : null,
        assignedTo: issue.assigned_username ? {
          username: issue.assigned_username,
          firstName: issue.assigned_first_name,
          lastName: issue.assigned_last_name,
          email: issue.assigned_email
        } : null,
        device: issue.device_name ? {
          id: issue.device_id,
          name: issue.device_name
        } : null
      }
    });

  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({
      error: 'Failed to retrieve issue',
      message: 'An error occurred while retrieving the issue'
    });
  }
});

// @route   POST /api/issues
// @desc    Create a new issue
// @access  Private
router.post('/', [
  auth,
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description is required and must be less than 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level'),
  body('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),
  body('deviceId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Device ID must be a positive integer'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
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
      title,
      description,
      priority = 'medium',
      category,
      deviceId,
      tags = []
    } = req.body;

    // Validate device ownership if deviceId is provided
    if (deviceId) {
      const deviceResult = await pool.query('SELECT user_id FROM devices WHERE id = $1', [deviceId]);
      
      if (deviceResult.rows.length === 0) {
        return res.status(400).json({
          error: 'Invalid device',
          message: 'The specified device does not exist'
        });
      }

      const device = deviceResult.rows[0];
      
      // Users can only create issues for their own devices
      if (req.user.role === 'user' && device.user_id !== req.user.userId) {
        return res.status(403).json({
          error: 'Access forbidden',
          message: 'You can only create issues for your own devices'
        });
      }
    }

    // Create issue
    const newIssue = await pool.query(`
      INSERT INTO issues (title, description, priority, user_id, device_id, category, tags, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')
      RETURNING *
    `, [title, description, priority, req.user.userId, deviceId, category, tags]);

    const issue = newIssue.rows[0];

    res.status(201).json({
      message: 'Issue created successfully',
      issue: {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        priority: issue.priority,
        status: issue.status,
        category: issue.category,
        tags: issue.tags,
        createdAt: issue.created_at
      }
    });

  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      error: 'Failed to create issue',
      message: 'An error occurred while creating the issue'
    });
  }
});

// @route   PUT /api/issues/:id
// @desc    Update issue
// @access  Private (Issue owner, Technician, or Admin)
router.put('/:id', [
  auth,
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level'),
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('assignedTo')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assigned to must be a positive integer'),
  body('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters')
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

    const issueId = req.params.id;
    const updates = req.body;

    // Check if issue exists and get current data
    const issueResult = await pool.query('SELECT * FROM issues WHERE id = $1', [issueId]);
    
    if (issueResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Issue not found',
        message: 'The requested issue does not exist'
      });
    }

    const issue = issueResult.rows[0];

    // Check permissions
    const canUpdate = req.user.role === 'admin' || 
                     req.user.role === 'technician' || 
                     issue.user_id === req.user.userId;

    if (!canUpdate) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You can only update your own issues'
      });
    }

    // Regular users can only update certain fields
    const userAllowedFields = ['title', 'description', 'category', 'tags'];
    const techAllowedFields = ['title', 'description', 'priority', 'status', 'assignedTo', 'category', 'tags'];
    
    const allowedFields = req.user.role === 'user' ? userAllowedFields : techAllowedFields;

    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    Object.keys(updates).forEach(key => {
      const dbField = key === 'assignedTo' ? 'assigned_to' : key;
      
      if (allowedFields.includes(key) && updates[key] !== undefined) {
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

    // Add resolved_at timestamp if status is being changed to resolved
    if (updates.status === 'resolved' && issue.status !== 'resolved') {
      paramCount++;
      updateFields.push(`resolved_at = $${paramCount}`);
      updateValues.push(new Date());
    }

    // Add updated_at timestamp
    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(new Date());

    // Add issue ID for WHERE clause
    paramCount++;
    updateValues.push(issueId);

    const updateQuery = `
      UPDATE issues 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const updatedIssue = await pool.query(updateQuery, updateValues);

    res.json({
      message: 'Issue updated successfully',
      issue: {
        id: updatedIssue.rows[0].id,
        title: updatedIssue.rows[0].title,
        description: updatedIssue.rows[0].description,
        priority: updatedIssue.rows[0].priority,
        status: updatedIssue.rows[0].status,
        category: updatedIssue.rows[0].category,
        tags: updatedIssue.rows[0].tags,
        updatedAt: updatedIssue.rows[0].updated_at,
        resolvedAt: updatedIssue.rows[0].resolved_at
      }
    });

  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({
      error: 'Failed to update issue',
      message: 'An error occurred while updating the issue'
    });
  }
});

// @route   DELETE /api/issues/:id
// @desc    Delete an issue
// @access  Private (Admin only)
router.delete('/:id', [auth, technicianOrAdmin], async (req, res) => {
  try {
    const issueId = req.params.id;

    // Check if issue exists
    const issueResult = await pool.query('SELECT title FROM issues WHERE id = $1', [issueId]);
    
    if (issueResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Issue not found',
        message: 'The requested issue does not exist'
      });
    }

    const issueTitle = issueResult.rows[0].title;

    // Delete issue
    await pool.query('DELETE FROM issues WHERE id = $1', [issueId]);

    res.json({
      message: 'Issue deleted successfully',
      issueTitle
    });

  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      error: 'Failed to delete issue',
      message: 'An error occurred while deleting the issue'
    });
  }
});

// @route   GET /api/issues/stats
// @desc    Get issue statistics
// @access  Private (Technician/Admin)
router.get('/stats/overview', [auth, technicianOrAdmin], async (req, res) => {
  try {
    // Get issue counts by status
    const statusStats = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM issues
      GROUP BY status
      ORDER BY status
    `);

    // Get issue counts by priority
    const priorityStats = await pool.query(`
      SELECT 
        priority,
        COUNT(*) as count
      FROM issues
      GROUP BY priority
      ORDER BY 
        CASE priority
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END
    `);

    // Get recent issues (last 7 days)
    const recentIssues = await pool.query(`
      SELECT COUNT(*) as count
      FROM issues
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);

    // Get resolved issues (last 30 days)
    const resolvedIssues = await pool.query(`
      SELECT COUNT(*) as count
      FROM issues
      WHERE status = 'resolved' 
        AND resolved_at >= NOW() - INTERVAL '30 days'
    `);

    res.json({
      statusBreakdown: statusStats.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      priorityBreakdown: priorityStats.rows.reduce((acc, row) => {
        acc[row.priority] = parseInt(row.count);
        return acc;
      }, {}),
      recentIssues: parseInt(recentIssues.rows[0].count),
      resolvedThisMonth: parseInt(resolvedIssues.rows[0].count)
    });

  } catch (error) {
    console.error('Get issue stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve issue statistics',
      message: 'An error occurred while retrieving issue statistics'
    });
  }
});

module.exports = router;
