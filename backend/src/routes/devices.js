const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { auth, technicianOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/devices
// @desc    Get all devices with filtering and pagination
// @access  Private
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['online', 'offline', 'maintenance', 'error']).withMessage('Invalid status'),
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
      whereConditions.push(`d.status = $${paramCount}`);
      queryParams.push(status);
    }

    // Filter by user (for regular users, only show their devices)
    if (req.user.role === 'user') {
      paramCount++;
      whereConditions.push(`d.user_id = $${paramCount}`);
      queryParams.push(req.user.userId);
    } else if (user_id) {
      paramCount++;
      whereConditions.push(`d.user_id = $${paramCount}`);
      queryParams.push(user_id);
    }

    // Search functionality
    if (search) {
      paramCount++;
      whereConditions.push(`(d.name ILIKE $${paramCount} OR d.ip_address::text ILIKE $${paramCount} OR d.os ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Valid sort columns
    const validSortColumns = ['name', 'status', 'last_seen', 'created_at', 'os'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get devices with user information
    const devicesQuery = `
      SELECT 
        d.id,
        d.name,
        d.ip_address,
        d.mac_address,
        d.os,
        d.os_version,
        d.device_type,
        d.status,
        d.last_seen,
        d.created_at,
        d.updated_at,
        d.location,
        d.notes,
        u.username,
        u.first_name,
        u.last_name,
        u.email
      FROM devices d
      LEFT JOIN users u ON d.user_id = u.id
      ${whereClause}
      ORDER BY d.${sortColumn} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const devicesResult = await pool.query(devicesQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM devices d
      LEFT JOIN users u ON d.user_id = u.id
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, queryParams.slice(0, -2)); // Remove limit and offset
    const totalDevices = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalDevices / limit);

    res.json({
      devices: devicesResult.rows.map(device => ({
        id: device.id,
        name: device.name,
        ipAddress: device.ip_address,
        macAddress: device.mac_address,
        os: device.os,
        osVersion: device.os_version,
        deviceType: device.device_type,
        status: device.status,
        lastSeen: device.last_seen,
        createdAt: device.created_at,
        updatedAt: device.updated_at,
        location: device.location,
        notes: device.notes,
        user: device.username ? {
          username: device.username,
          firstName: device.first_name,
          lastName: device.last_name,
          email: device.email
        } : null
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalDevices,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      error: 'Failed to retrieve devices',
      message: 'An error occurred while retrieving devices'
    });
  }
});

// @route   GET /api/devices/:id
// @desc    Get device by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const deviceId = req.params.id;

    const deviceResult = await pool.query(`
      SELECT 
        d.*,
        u.username,
        u.first_name,
        u.last_name,
        u.email
      FROM devices d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.id = $1
    `, [deviceId]);

    if (deviceResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'The requested device does not exist'
      });
    }

    const device = deviceResult.rows[0];

    // Check if user can access this device
    if (req.user.role === 'user' && device.user_id !== req.user.userId) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You can only access your own devices'
      });
    }

    res.json({
      device: {
        id: device.id,
        name: device.name,
        ipAddress: device.ip_address,
        macAddress: device.mac_address,
        os: device.os,
        osVersion: device.os_version,
        deviceType: device.device_type,
        status: device.status,
        lastSeen: device.last_seen,
        createdAt: device.created_at,
        updatedAt: device.updated_at,
        location: device.location,
        notes: device.notes,
        user: device.username ? {
          username: device.username,
          firstName: device.first_name,
          lastName: device.last_name,
          email: device.email
        } : null
      }
    });

  } catch (error) {
    console.error('Get device error:', error);
    res.status(500).json({
      error: 'Failed to retrieve device',
      message: 'An error occurred while retrieving the device'
    });
  }
});

// @route   GET /api/devices/:id/health
// @desc    Get device health data
// @access  Private
router.get('/:id/health', auth, async (req, res) => {
  try {
    const deviceId = req.params.id;
    const { hours = 24, limit = 100 } = req.query;

    // Check if device exists and user has access
    const deviceResult = await pool.query('SELECT user_id FROM devices WHERE id = $1', [deviceId]);
    
    if (deviceResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'The requested device does not exist'
      });
    }

    const device = deviceResult.rows[0];

    // Check access permissions
    if (req.user.role === 'user' && device.user_id !== req.user.userId) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You can only access health data for your own devices'
      });
    }

    // Get health data
    const healthResult = await pool.query(`
      SELECT 
        id,
        cpu_usage,
        ram_usage,
        disk_usage,
        network_status,
        temperature,
        uptime,
        timestamp,
        additional_metrics
      FROM device_health
      WHERE device_id = $1 
        AND timestamp >= NOW() - INTERVAL '${parseInt(hours)} hours'
      ORDER BY timestamp DESC
      LIMIT $2
    `, [deviceId, limit]);

    // Get latest health status
    const latestHealthResult = await pool.query(`
      SELECT 
        cpu_usage,
        ram_usage,
        disk_usage,
        network_status,
        temperature,
        uptime,
        timestamp
      FROM device_health
      WHERE device_id = $1
      ORDER BY timestamp DESC
      LIMIT 1
    `, [deviceId]);

    res.json({
      deviceId: parseInt(deviceId),
      currentHealth: latestHealthResult.rows[0] || null,
      healthHistory: healthResult.rows,
      timeRange: `${hours} hours`,
      totalRecords: healthResult.rows.length
    });

  } catch (error) {
    console.error('Get device health error:', error);
    res.status(500).json({
      error: 'Failed to retrieve device health',
      message: 'An error occurred while retrieving device health data'
    });
  }
});

// @route   POST /api/devices
// @desc    Register a new device
// @access  Private (Technician/Admin) or device owner
router.post('/', [
  auth,
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Device name is required and must be less than 100 characters'),
  body('ipAddress')
    .optional()
    .isIP()
    .withMessage('Invalid IP address format'),
  body('macAddress')
    .optional()
    .matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)
    .withMessage('Invalid MAC address format'),
  body('os')
    .optional()
    .isLength({ max: 50 })
    .withMessage('OS name must be less than 50 characters'),
  body('deviceType')
    .optional()
    .isIn(['computer', 'server', 'printer', 'router', 'switch', 'phone', 'tablet', 'other'])
    .withMessage('Invalid device type'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters')
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
      name,
      ipAddress,
      macAddress,
      os,
      osVersion,
      deviceType = 'computer',
      location,
      notes,
      userId
    } = req.body;

    // Determine the user_id for the device
    let deviceUserId = req.user.userId; // Default to current user

    // Only admins/technicians can assign devices to other users
    if (userId && ['admin', 'technician'].includes(req.user.role)) {
      deviceUserId = userId;
    }

    // Check if device with same IP or MAC already exists
    if (ipAddress || macAddress) {
      let checkQuery = 'SELECT id FROM devices WHERE ';
      let checkParams = [];
      let conditions = [];

      if (ipAddress) {
        conditions.push('ip_address = $1');
        checkParams.push(ipAddress);
      }

      if (macAddress) {
        conditions.push(`mac_address = $${checkParams.length + 1}`);
        checkParams.push(macAddress);
      }

      checkQuery += conditions.join(' OR ');

      const existingDevice = await pool.query(checkQuery, checkParams);
      if (existingDevice.rows.length > 0) {
        return res.status(400).json({
          error: 'Device already exists',
          message: 'A device with this IP address or MAC address already exists'
        });
      }
    }

    // Create device
    const newDevice = await pool.query(`
      INSERT INTO devices (name, user_id, ip_address, mac_address, os, os_version, device_type, location, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'offline')
      RETURNING *
    `, [name, deviceUserId, ipAddress, macAddress, os, osVersion, deviceType, location, notes]);

    const device = newDevice.rows[0];

    res.status(201).json({
      message: 'Device registered successfully',
      device: {
        id: device.id,
        name: device.name,
        ipAddress: device.ip_address,
        macAddress: device.mac_address,
        os: device.os,
        osVersion: device.os_version,
        deviceType: device.device_type,
        status: device.status,
        location: device.location,
        notes: device.notes,
        createdAt: device.created_at
      }
    });

  } catch (error) {
    console.error('Register device error:', error);
    res.status(500).json({
      error: 'Failed to register device',
      message: 'An error occurred while registering the device'
    });
  }
});

// @route   PUT /api/devices/:id
// @desc    Update device information
// @access  Private (Device owner, Technician, or Admin)
router.put('/:id', [
  auth,
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Device name must be between 1 and 100 characters'),
  body('status')
    .optional()
    .isIn(['online', 'offline', 'maintenance', 'error'])
    .withMessage('Invalid status'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters')
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

    const deviceId = req.params.id;
    const updates = req.body;

    // Check if device exists and get current data
    const deviceResult = await pool.query('SELECT * FROM devices WHERE id = $1', [deviceId]);
    
    if (deviceResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'The requested device does not exist'
      });
    }

    const device = deviceResult.rows[0];

    // Check permissions
    if (req.user.role === 'user' && device.user_id !== req.user.userId) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You can only update your own devices'
      });
    }

    // Build update query
    const allowedFields = ['name', 'status', 'location', 'notes', 'os', 'os_version'];
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
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

    // Add device ID for WHERE clause
    paramCount++;
    updateValues.push(deviceId);

    const updateQuery = `
      UPDATE devices 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const updatedDevice = await pool.query(updateQuery, updateValues);

    res.json({
      message: 'Device updated successfully',
      device: {
        id: updatedDevice.rows[0].id,
        name: updatedDevice.rows[0].name,
        status: updatedDevice.rows[0].status,
        location: updatedDevice.rows[0].location,
        notes: updatedDevice.rows[0].notes,
        updatedAt: updatedDevice.rows[0].updated_at
      }
    });

  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({
      error: 'Failed to update device',
      message: 'An error occurred while updating the device'
    });
  }
});

// @route   DELETE /api/devices/:id
// @desc    Delete a device
// @access  Private (Admin/Technician only)
router.delete('/:id', [auth, technicianOrAdmin], async (req, res) => {
  try {
    const deviceId = req.params.id;

    // Check if device exists
    const deviceResult = await pool.query('SELECT name FROM devices WHERE id = $1', [deviceId]);
    
    if (deviceResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Device not found',
        message: 'The requested device does not exist'
      });
    }

    const deviceName = deviceResult.rows[0].name;

    // Delete device (this will cascade delete health records)
    await pool.query('DELETE FROM devices WHERE id = $1', [deviceId]);

    res.json({
      message: 'Device deleted successfully',
      deviceName
    });

  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({
      error: 'Failed to delete device',
      message: 'An error occurred while deleting the device'
    });
  }
});

module.exports = router;
