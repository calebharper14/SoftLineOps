const { Pool } = require('pg');
require('dotenv').config();

// Database configuration using .env variables
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'softlineops',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    const result = await client.query('SELECT NOW()');
    console.log('📅 Database time:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database tables
const initializeTables = async () => {
  const client = await pool.connect();
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'technician', 'user')),
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // Devices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        ip_address INET,
        mac_address VARCHAR(17),
        os VARCHAR(50),
        os_version VARCHAR(50),
        device_type VARCHAR(50) DEFAULT 'computer',
        status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance', 'error')),
        last_seen TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        location VARCHAR(100),
        notes TEXT
      )
    `);

    // Issues table
    await client.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
        status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        category VARCHAR(50),
        tags TEXT[]
      )
    `);

    // Device Health table
    await client.query(`
      CREATE TABLE IF NOT EXISTS device_health (
        id SERIAL PRIMARY KEY,
        device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
        cpu_usage DECIMAL(5,2),
        ram_usage DECIMAL(5,2),
        disk_usage DECIMAL(5,2),
        network_status VARCHAR(20) DEFAULT 'unknown',
        temperature DECIMAL(5,2),
        uptime BIGINT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        additional_metrics JSONB
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
      CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
      CREATE INDEX IF NOT EXISTS idx_issues_user_id ON issues(user_id);
      CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON issues(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
      CREATE INDEX IF NOT EXISTS idx_device_health_device_id ON device_health(device_id);
      CREATE INDEX IF NOT EXISTS idx_device_health_timestamp ON device_health(timestamp);
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database tables:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Closing database connections...');
  await pool.end();
  console.log('✅ Database connections closed');
  process.exit(0);
});

module.exports = {
  pool,
  testConnection,
  initializeTables
};