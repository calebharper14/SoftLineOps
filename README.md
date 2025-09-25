<div align="center">

# SoftLineOps  
### **Smarter Systems, Smoother Operations**

---

[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](#tech-stack)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](#tech-stack)
[![Express.js](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](#tech-stack)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](#tech-stack)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](#tech-stack)

[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Issues](https://img.shields.io/github/issues/calebharper14/SoftLineOps)](../../issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/calebharper14/SoftLineOps)](../../pulls)
[![Last Commit](https://img.shields.io/github/last-commit/calebharper14/SoftLineOps)](../../commits/main)

[![GitHub Repo](https://img.shields.io/badge/GitHub-SoftLineOps-181717?logo=github)](https://github.com/calebharper14/SoftLineOps)

</div>

---

## Overview

**SoftLineOps** is a comprehensive IT management system designed to help organizations enhance their support processes by simplifying issue reporting, device monitoring, and infrastructure tracking.

> *Supporting two main roles: **End Users** and **Administrators***

---

##  Quick Start

### Prerequisites
- Node.js (v16 or newer)
- npm or yarn
- PostgreSQL (optional - app works with mock data)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/calebharper14/SoftLineOps.git
cd SoftLineOps
```

2. **Install dependencies:**
```bash
# Backend (optional - frontend works independently)
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Start the application:**
```bash
# Frontend (main application)
cd frontend
npm run dev

# Backend (optional - for database integration)
cd backend
npm run dev
```

4. **Access at:** `http://localhost:3000`

### Demo Login

Use these credentials to test the application:

- **Username:** admin
- **Password:** P@55w0rd

---

## How It Works

SoftLineOps operates in two modes:

###  **Mock Data Mode (Default)**
- No backend required
- Built-in sample data (users, devices, issues)
- All CRUD operations work locally
- Perfect for testing and demonstration

###  **Database Mode**
- PostgreSQL backend integration
- Persistent data storage
- JWT authentication
- Real-time updates

---

## Features

### **End User Capabilities**
- **Issue Reporting:** Submit hardware, network, software, or access issues
- **Device Health:** View real-time CPU, RAM, disk, and network status
- **Notifications:** Track ticket status and system alerts
- **Dashboard:** Personal overview of assigned devices and active issues

### **Administrator Tools**
- **User & Device Management:** Add, edit, remove users and assign roles
- **Device Management:** Monitor fleet health, assign devices to users
- **Issue Dashboard:** Filter, prioritize, assign, and resolve tickets
- **Analytics:** System statistics and health monitoring

---

## Target Users

- **Small & Medium Businesses:** Efficient IT monitoring without enterprise complexity
- **IT Teams & Helpdesks:** Streamlined ticket management and device monitoring
- **Educational Institutions:** Computer lab and student device management
- **IT Consultants:** Professional tool for managing multiple client environments

---

## User Workflow

| **End User Flow** |
|---|
| Login  Dashboard  Report Issue/View Devices  Track Status  Notifications |

| **Admin Flow** |
|---|
| Login  Admin Dashboard  Manage Users/Devices  Review Tickets  Monitor Fleet |

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + PostgreSQL
- **State Management:** React Context API
- **Authentication:** JWT tokens
- **Styling:** CSS3 with modern design patterns

---

## Project Structure

```
SoftLineOps/
 frontend/               # React + TypeScript application
    src/
       pages/         # Login, Dashboard components
       api/           # Backend integration
       assets/        # Images and styles
    package.json

 backend/                # Node.js + Express API
    src/
       routes/        # API endpoints
       middleware/    # Authentication & validation
       config/        # Database configuration
    package.json

 README.md
 TODO.md
```

---

## Environment Setup

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
JWT_SECRET=your_jwt_secret_here
POSTGRES_USER=admin
POSTGRES_PASSWORD=P@55w0rd
POSTGRES_DB=softlineops
DATABASE_URL=postgresql://admin:P@55w0rd@localhost:5432/softlineops
```

---

## Development Status

 **Completed:**
- Fully functional frontend with mock data
- Backend API with PostgreSQL integration
- Authentication system
- CRUD operations for users, devices, and issues
- Responsive UI design

 **In Progress:**
- Frontend-backend integration
- Enhanced testing coverage

 **Planned:**
- Docker deployment
- Real-time WebSocket updates
- Advanced analytics

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [`LICENSE`](LICENSE) file for details.

---

## Support

For support, please open an issue on GitHub or contact the development team.