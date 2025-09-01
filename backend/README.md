# SoftLineOps Backend API

A comprehensive Node.js backend API for the SoftLineOps IT Support and Device Management System.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Complete CRUD operations for users with different roles
- **Device Management**: Track and monitor IT devices with health metrics
- **Issue Tracking**: Full ticketing system for IT support requests
- **Security**: Rate limiting, CORS, helmet security headers
- **Database**: PostgreSQL with automated schema initialization
- **Validation**: Comprehensive input validation and sanitization

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: helmet, cors, bcryptjs, rate limiting
- **Environment**: dotenv for configuration

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🔧 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=softlineops
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=24h

   # Security
   BCRYPT_ROUNDS=12
   ```

3. **Database Setup**:
   - Create a PostgreSQL database named `softlineops`
   - The application will automatically create tables on first run

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "login": "johndoe", // username or email
  "password": "SecurePass123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

### User Management Endpoints

#### Get All Users (Admin only)
```http
GET /api/users?page=1&limit=20&role=user&search=john
Authorization: Bearer <jwt_token>
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <jwt_token>
```

#### Create User (Admin only)
```http
POST /api/users
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "role": "technician",
  "firstName": "New",
  "lastName": "User"
}
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name"
}
```

### Device Management Endpoints

#### Get All Devices
```http
GET /api/devices?page=1&limit=20&status=online&search=laptop
Authorization: Bearer <jwt_token>
```

#### Get Device by ID
```http
GET /api/devices/:id
Authorization: Bearer <jwt_token>
```

#### Get Device Health Data
```http
GET /api/devices/:id/health?hours=24&limit=100
Authorization: Bearer <jwt_token>
```

#### Register New Device
```http
POST /api/devices
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "John's Laptop",
  "ipAddress": "192.168.1.100",
  "macAddress": "00:11:22:33:44:55",
  "os": "Windows 11",
  "deviceType": "computer",
  "location": "Office Floor 2"
}
```

#### Update Device
```http
PUT /api/devices/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "maintenance",
  "location": "IT Department"
}
```

### Issue Tracking Endpoints

#### Get All Issues
```http
GET /api/issues?page=1&limit=20&status=open&priority=high
Authorization: Bearer <jwt_token>
```

#### Get Issue by ID
```http
GET /api/issues/:id
Authorization: Bearer <jwt_token>
```

#### Create New Issue
```http
POST /api/issues
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Computer won't start",
  "description": "My computer is not turning on after the power outage",
  "priority": "high",
  "category": "hardware",
  "deviceId": 1,
  "tags": ["hardware", "power", "urgent"]
}
```

#### Update Issue
```http
PUT /api/issues/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "in_progress",
  "assignedTo": 2
}
```

## 🔐 Authentication & Authorization

### Roles
- **admin**: Full system access
- **technician**: Can manage issues, devices, and view users
- **user**: Can manage own devices and issues

### JWT Token
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🗄️ Database Schema

### Users Table
- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password_hash`
- `role` (admin, technician, user)
- `first_name`, `last_name`
- `created_at`, `updated_at`, `last_login`
- `is_active`

### Devices Table
- `id` (Primary Key)
- `name`
- `user_id` (Foreign Key)
- `ip_address`, `mac_address`
- `os`, `os_version`, `device_type`
- `status` (online, offline, maintenance, error)
- `last_seen`, `location`, `notes`

### Issues Table
- `id` (Primary Key)
- `title`, `description`
- `priority` (low, medium, high, critical)
- `status` (open, in_progress, resolved, closed)
- `user_id`, `assigned_to`, `device_id` (Foreign Keys)
- `category`, `tags`
- `created_at`, `updated_at`, `resolved_at`

### Device Health Table
- `id` (Primary Key)
- `device_id` (Foreign Key)
- `cpu_usage`, `ram_usage`, `disk_usage`
- `network_status`, `temperature`, `uptime`
- `timestamp`, `additional_metrics`

## 🛡️ Security Features

- **Password Hashing**: bcrypt with configurable rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive validation using express-validator
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express apps
- **Role-based Access Control**: Fine-grained permissions

## 🧪 Testing

```bash
npm test
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `softlineops` |
| `DB_USER` | Database user | - |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure production database
- [ ] Set up SSL/TLS
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
