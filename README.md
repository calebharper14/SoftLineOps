<div align="center">

# SoftlineOps  
### **Smarter Systems, Smoother Operations**

[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](#tech-stack)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](#tech-stack)
[![Express.js](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](#tech-stack)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](#tech-stack)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)](#tech-stack)

[![License](https://img.shields.io/github/license/calebharper14/SoftLineOps)](LICENSE)
[![Issues](https://img.shields.io/github/issues/calebharper14/SoftLineOps)](../../issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/calebharper14/SoftLineOps)](../../pulls)
[![Last Commit](https://img.shields.io/github/last-commit/calebharper14/SoftLineOps)](../../commits/main)

</div>

---

## Overview
**SoftlineOps** is a comprehensive IT Management System designed to help organizations enhance their support processes and gain better visibility.
It caters to two main roles:
- **End Users:** who can report issues, check on their assigned devices, and keep track of updates.
- **Administrators:** who oversee user and device management, monitor the health of the fleet, and create reports

---

## Key Features

### End User
- **Issue Reporting:** Log issues (Hardware / Network / Software / Access) via a simple web form.
- **Device Health:** View real-time health (CPU, RAM, Disk, Network) collected by a lightweight Python agent.
- **Notifications:** In-app updates on ticket status and unusual device activity.

### Administrator
- **User & Device Management:** Add/edit/remove users and devices; assign devices to people.
- **Issue Dashboard:** Filter, triage, and update ticket status; assign to IT staff.
- **Monitoring:** Fleet-wide view, highlight devices with warnings/threshold breaches.
- **Reporting & Analytics:** Weekly/monthly summaries; export **PDF/CSV**.

---

## Interaction Flow

**User Flow:**  
Login → Dashboard → (Report Issue | View Device Health | Track Tickets) → Receive Notifications.

**Admin Flow:**  
Login → Admin Dashboard → (Manage Users/Devices | Review & Assign Tickets | Monitor Fleet) → Generate Reports.

---

## Technical Stack

- Frontend: React (modern and responsive UI for admins and users.)

- Backend: Node.js and Express (for REST APIs, issue management, and notifications.)

- Database: PostgreSQL (stores users, devices, issues, and metrics.)

- Agent: Python (lightweight script installed on client devices to collect metrics.)

