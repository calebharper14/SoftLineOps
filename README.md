<div align="center">

# SoftlineOps  
### **Smarter Systems, Smoother Operations**

[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](#tech-stack)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](#tech-stack)
[![Express.js](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](#tech-stack)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](#tech-stack)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)](#tech-stack)

[![GitHub Repo](https://img.shields.io/badge/GitHub-SoftLineOps-181717?logo=github)](https://github.com/calebharper14/SoftLineOps)


</div>

---

## Overview

**SoftLineOps** is a comprehensive IT management system designed to help organizations enhance their support processes by simplifying reports, user and device management, and device health tracking. Providing support for two main roles: **End Users** and **Administrators**

---

## Features

 ***End User***
- **Issue Reporting** Log issues (Hardware / Network / Software / Access) via a simple web form.
- **Device Health:** View real-time health (CPU, RAM, Disk, Network) collected by a lightweight Python agent.
- **Notifications:** In-app updates on ticket status and unusual device activity.

***Administrator***
- **User & Device Management:** Add/edit/remove users and devices; assign devices to people.
- **Issue Dashboard:** Filter, prioritize, and update ticket status; assign to IT staff.
- **Monitoring:** Fleet-wide view, highlight devices with warnings/threshold breaches.
- **Reporting & Analytics:** Weekly/monthly summaries; export **PDF/CSV**.

---

## Interaction Flow

***User Flow:*** 
- Login → Dashboard → (Report Issue | View Device Health | Track Tickets) → Receive Notifications.

***Admin Flow:***  
- Login → Admin Dashboard → (Manage Users/Devices | Review & Assign Tickets | Monitor Fleet) → Generate Reports.

---

## Visuals
> replace the image paths below with screenshots.
> keep images between 1200px wide for clarity.

| Login | User Dashboard | Admin Issues | Monitoring |
|---|---|---|---|
| ![Login](docs/screenshots/login.png) | ![User Dashboard](docs/screenshots/user-dashboard.png) | ![Admin Issues](docs/screenshots/admin-issues.png) | ![Monitoring](docs/screenshots/monitoring.png) |

---

## Tech Stack
- **Frontend:** React (SPA)
- **Backend:** Node.js + Express (REST API)
- **Database:** PostgreSQL
- **Agent:** Python (psutil + requests)

---
