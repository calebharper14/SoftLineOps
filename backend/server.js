const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { testConnection, initializeTables } = require('./src/config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Parse allowed origins from .env
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173').split(',');

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error(`CORS blocked origin: ${origin}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const deviceRoutes = require('./src/routes/devices');
const issueRoutes = require('./src/routes/issues');
const statsRouter = require('./src/routes/stats');
const notificationsRouter = require('./src/routes/notifications');

// API routes (all prefixed with /api)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/stats', statsRouter);
app.use('/api/notifications', notificationsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SoftLineOps Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (dbConnected) {
      // Initialize database tables
      await initializeTables();
      console.log('Database initialization complete');
    } else {
      console.warn('Database connection failed - server will start but database features may not work');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`SoftLineOps Backend API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
