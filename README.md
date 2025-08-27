<div align="center">

# SoftlineOps  
**Smarter Systems, Smoother Operations**

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

SoftlineOps is a comprehensive IT Management System built to make IT operations in organizations more efficient. It caters to two types of users — End Users and Administrators — each with features tailored to their needs. End Users can report issues and keep an eye on device health, while Administrators have the tools to manage users, monitor devices, and create insightful reports.

## Key Features

### End User

- **Issue Reporting**

  - A straightforward web form to log issues (Hardware, Network, Software, Access).

   - All entries are stored in PostgreSQL for admin review.

   - Users get updates on the status of their reported issues.

- **Device Health Reports**

  - A Python agent gathers system metrics (CPU, RAM, Disk, Network).

  - Data is securely transmitted via REST APIs.

  - Users can see a real-time view of their device's health.

- **Notifications & Updates**

  - Alerts for updates on issues, solutions, or any unusual activity.

### Administrator

- **User & Device Management**

  - Add, edit, or remove users and devices as needed.

  - Assign devices to specific users.

  - Maintain a complete inventory of devices along with their history.

- **Issue Tracking Dashboard**

  - A centralized list of reported issues with filtering options.

  - Update issue statuses and assign them to IT staff.

- **System Monitoring Dashboard**

  - A comprehensive overview of all devices on the network.

  - Highlight devices that are showing warnings or errors.

  - Generate compliance reports that can be exported.

- **Reporting & Analytics**

  - Weekly and monthly summaries (issues resolved, device performance, recurring problems).

  - Exportable in PDF or CSV formats.

## Interaction Flow

### User Flow

1. Log in to the user dashboard.

2. Report issues, view health reports, and track issues in-progress.

3. Notifications guide users to updates.

### Admin Flow

1. Log in to the admin dashboard.

2. Manage devices and users

3. Monitor live health stats across the organization.

4. Generate reports with one click.

## Technical Stack

- Frontend: React (modern and responsive UI for admins and users.)

- Backend: Node.js and Express (for REST APIs, issue management, and notifications.)

- Database: PostgreSQL (stores users, devices, issues, and metrics.)

- Agent: Python (lightweight script installed on client devices to collect metrics.)

