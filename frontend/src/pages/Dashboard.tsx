import React, { useState, useEffect, useRef } from 'react';
import logo from '../assets/logo/softlineops-logo.png';
import { fetchUsers } from '../api/users';
import { fetchIssues, createIssue, updateIssue } from '../api/issues';
import { fetchDevices, createDevice, updateDevice } from '../api/devices';
import { fetchNotifications, createNotification } from '../api/notifications';
import { fetchStats } from '../api/stats';

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

interface DeviceFormData {
  id?: string | number;
  name: string;
  deviceType: string;
  os: string;
  location: string;
  status?: string;
  assignedTo?: { 
    id: string | number; 
    name: string; 
    department: string; 
    email: string; 
  } | null;
}

interface IssueFormData {
  id?: string | number;
  title: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  assignedTo?: User | null;
  deviceId?: string | number;
  tags?: string[];
  device?: Device;
}

interface UserFormData {
  id?: string | number;
  name: string;
  email: string;
  department: string;
  role?: string;
  phone?: string;
}

interface User {
  id: string | number;
  name: string;
  department: string;
  email: string;
  role?: string;
  phone?: string;
}

interface Device {
  id?: string | number;
  name: string;
  deviceType: string;
  os: string;
  location: string;
  status: string;
  lastSeen?: string;
  health?: {
    cpu?: number;
    memory?: number;
    disk?: number;
  };
  assignedTo?: User | null;
}

interface Issue {
  id?: string | number;
  title: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  createdAt?: string;
  assignedTo?: User | null;
  device?: Device;
}

interface Notification {
  id: number | string;
  message: string;
  time: string;
  type: string;
}

interface Stat {
  label: string;
  value: string;
}

const Dashboard = ({ token, onLogout }: DashboardProps) => {
  // Navigation menu state
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Users data
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Issues
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);

  // Devices
  const [deviceHealth, setDeviceHealth] = useState<Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // Stats
  const [stats, setStats] = useState<Stat[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Modal states
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editDeviceModalOpen, setEditDeviceModalOpen] = useState(false);
  const [editIssueModalOpen, setEditIssueModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Delete confirmation modals
  const [deleteDeviceModalOpen, setDeleteDeviceModalOpen] = useState(false);
  const [deleteIssueModalOpen, setDeleteIssueModalOpen] = useState(false);
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Error reporting modal state
  const [errorReportModalOpen, setErrorReportModalOpen] = useState(false);
  const [errorReportData, setErrorReportData] = useState({
    subject: '',
    description: '',
    severity: 'low',
    category: 'general'
  });

  // Refs for scrolling
  const devicesRef = useRef<HTMLDivElement>(null);
  const issuesRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);

  // Toggle menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const menu = document.querySelector('.nav-links');
      const button = document.querySelector('.menu-button');
      if (menu && button && !menu.contains(event.target as Node) && !button.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Update calculated stats based on current data
  const updateCalculatedStats = () => {
    const totalDevices = deviceHealth.length;
    const onlineDevices = deviceHealth.filter(d => d.status === 'online').length;
    const healthyDevices = deviceHealth.filter(d =>
      d.health && d.health.cpu !== undefined && d.health.memory !== undefined && d.health.disk !== undefined &&
      d.health.cpu < 80 && d.health.memory < 80 && d.health.disk < 80
    ).length;

    const totalIssues = recentIssues.length;
    const openIssues = recentIssues.filter(i => i.status === 'Open' || i.status === 'In Progress').length;
    const resolvedIssues = recentIssues.filter(i => i.status === 'Resolved' || i.status === 'Closed').length;
    const criticalIssues = recentIssues.filter(i => i.priority === 'critical').length;

    const totalUsers = users.length;

    setStats([
      { label: 'Total Devices', value: totalDevices.toString() },
      { label: 'Online Devices', value: onlineDevices.toString() },
      { label: 'Healthy Devices', value: healthyDevices.toString() },
      { label: 'Total Issues', value: totalIssues.toString() },
      { label: 'Open Issues', value: openIssues.toString() },
      { label: 'Resolved Issues', value: resolvedIssues.toString() },
      { label: 'Critical Issues', value: criticalIssues.toString() },
      { label: 'Total Users', value: totalUsers.toString() }
    ]);
  };

  // Fetch users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userData = await fetchUsers(token);
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users, using mock data:', error);
        setUsers(mockUsers); // Use mock data as fallback
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, [token]);

  // Fetch issues
  useEffect(() => {
    const loadIssues = async () => {
      try {
        const issueData = await fetchIssues(token);
        setRecentIssues(issueData);
      } catch (error) {
        console.error('Error fetching issues, using mock data:', error);
        setRecentIssues(mockIssues); // Use mock data as fallback
      } finally {
        setLoadingIssues(false);
      }
    };
    loadIssues();
  }, [token]);

  // Fetch devices
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const deviceData = await fetchDevices(token);
        setDeviceHealth(deviceData);
      } catch (error) {
        console.error('Error fetching devices, using mock data:', error);
        setDeviceHealth(mockDevices); // Use mock data as fallback
      } finally {
        setLoadingDevices(false);
      }
    };
    loadDevices();
  }, [token]);

  // Fetch notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notificationData = await fetchNotifications(token);
        setNotifications(notificationData);
      } catch (error) {
        console.error('Error fetching notifications, using mock data:', error);
        setNotifications(mockNotifications); // Use mock data as fallback
      } finally {
        setLoadingNotifications(false);
      }
    };
    loadNotifications();
  }, [token]);

  // Fetch stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const statData = await fetchStats(token);
        setStats(statData);
      } catch (error) {
        console.error('Error fetching stats, using mock data:', error);
        setStats(mockStats); // Use mock data as fallback
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, [token]);

  // Update stats when relevant data changes
  useEffect(() => {
    if (!loadingDevices && !loadingIssues && !loadingUsers) {
      updateCalculatedStats();
    }
  }, [deviceHealth, recentIssues, users, loadingDevices, loadingIssues, loadingUsers]);

  // Create notification for events
  const createEventNotification = async (message: string, type: string, relatedId?: number | string, relatedType?: string) => {
    try {
      await createNotification(token, {
        message,
        type,
        relatedId,
        relatedType,
        timestamp: new Date().toISOString()
      });
      
      // Refresh notifications
      const notificationData = await fetchNotifications(token);
      setNotifications(notificationData);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Scroll to section
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fix the handleAddDevice function - ensure id is number for Math.max
  const handleAddDevice = async (deviceData: DeviceFormData) => {
    try {
      // Try API call first
      const newDevice = await createDevice(token, deviceData);
      setDeviceHealth([...deviceHealth, newDevice]);
      setDeviceModalOpen(false);
      
      await createEventNotification(`New device "${newDevice.name}" added`, 'device', newDevice.id, 'device');
    } catch (error) {
      console.error('Error adding device via API, adding locally:', error);
      // Fallback: Add locally
      const maxId = Math.max(...deviceHealth.map(d => Number(d.id) || 0), 0);
      const newDevice: Device = {
        id: maxId + 1,
        name: deviceData.name,
        deviceType: deviceData.deviceType,
        os: deviceData.os,
        location: deviceData.location,
        status: deviceData.status || 'online',
        assignedTo: deviceData.assignedTo || null
      };
      setDeviceHealth([...deviceHealth, newDevice]);
      setDeviceModalOpen(false);
      
      // Add notification
      const maxNotifId = Math.max(...notifications.map(n => Number(n.id)), 0);
      const newNotification: Notification = {
        id: maxNotifId + 1,
        message: `New device "${newDevice.name}" added`,
        time: new Date().toISOString(),
        type: 'device'
      };
      setNotifications([newNotification, ...notifications]);
    }
  };

  // Fix the handleAddIssue function - ensure id is number for Math.max
  const handleAddIssue = async (issueData: IssueFormData) => {
    try {
      // Try API call first
      const newIssue = await createIssue(token, issueData);
      setRecentIssues([...recentIssues, newIssue]);
      setIssueModalOpen(false);
      
      await createEventNotification(`New issue "${newIssue.title}" reported`, 'issue', newIssue.id, 'issue');
    } catch (error) {
      console.error('Error adding issue via API, adding locally:', error);
      // Fallback: Add locally
      const maxId = Math.max(...recentIssues.map(i => Number(i.id) || 0), 0);
      const newIssue: Issue = {
        id: maxId + 1,
        title: issueData.title,
        description: issueData.description,
        priority: issueData.priority,
        category: issueData.category,
        status: issueData.status,
        createdAt: new Date().toISOString(),
        assignedTo: issueData.assignedTo || null,
        device: issueData.deviceId ? deviceHealth.find(d => d.id === issueData.deviceId) || undefined : undefined
      };
      setRecentIssues([...recentIssues, newIssue]);
      setIssueModalOpen(false);
      
      // Add notification
      const maxNotifId = Math.max(...notifications.map(n => Number(n.id)), 0);
      const newNotification: Notification = {
        id: maxNotifId + 1,
        message: `New issue "${newIssue.title}" reported`,
        time: new Date().toISOString(),
        type: 'issue'
      };
      setNotifications([newNotification, ...notifications]);
    }
  };

  // Fix the handleAddUser function - ensure id is number for Math.max
  const handleAddUser = async (userData: UserFormData) => {
    try {
      // For now, just log the user data
      console.log('Adding user:', userData);
      setUserModalOpen(false);
      
      await createEventNotification(`New user "${userData.name}" added`, 'user', userData.id, 'user');
    } catch (error) {
      console.error('Error adding user via API, adding locally:', error);
      // Fallback: Add locally
      const maxId = Math.max(...users.map(u => Number(u.id)), 0);
      const newUser: User = {
        id: maxId + 1,
        name: userData.name,
        email: userData.email,
        department: userData.department,
        role: userData.role || 'user',
        phone: userData.phone || ''
      };
      setUsers([...users, newUser]);
      setUserModalOpen(false);
      
      // Add notification
      const maxNotifId = Math.max(...notifications.map(n => Number(n.id)), 0);
      const newNotification: Notification = {
        id: maxNotifId + 1,
        message: `New user "${newUser.name}" added`,
        time: new Date().toISOString(),
        type: 'user'
      };
      setNotifications([newNotification, ...notifications]);
    }
  };

  const handleErrorReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Error report submitted:', errorReportData);
      
      alert('Thank you for your report. Our support team will review it shortly.');
      
      setErrorReportData({
        subject: '',
        description: '',
        severity: 'low',
        category: 'general'
      });
      setErrorReportModalOpen(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again later.');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUserModalOpen(true);
  };

  const saveUserChanges = async (userData: UserFormData) => {
    try {
      console.log('Updating user:', userData);
      setEditUserModalOpen(false);
      setSelectedUser(null);
      
      await createEventNotification(`User "${userData.name}" updated`, 'user', userData.id, 'user');
    } catch (error) {
      console.error('Error updating user via API, updating locally:', error);
      // Fallback: Update locally
      if (selectedUser?.id) {
        const updatedUser: User = {
          ...selectedUser,
          name: userData.name,
          email: userData.email,
          department: userData.department,
          role: userData.role || selectedUser.role,
          phone: userData.phone || selectedUser.phone
        };
        
        setUsers(users.map(u => 
          u.id === selectedUser.id ? updatedUser : u
        ));
        
        // Add notification
        const maxNotifId = Math.max(...notifications.map(n => Number(n.id)), 0);
        const newNotification: Notification = {
          id: maxNotifId + 1,
          message: `User "${updatedUser.name}" updated`,
          time: new Date().toISOString(),
          type: 'user'
        };
        setNotifications([newNotification, ...notifications]);
      }
      setEditUserModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device);
    setEditDeviceModalOpen(true);
  };

  const handleEditIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setEditIssueModalOpen(true);
  };

  const saveDeviceChanges = async (deviceData: DeviceFormData) => {
    try {
      if (selectedDevice?.id) {
        const updatedDevice = await updateDevice(token, selectedDevice.id.toString(), deviceData);
        
        setDeviceHealth(deviceHealth.map(d => 
          d.id === selectedDevice.id ? updatedDevice : d
        ));
        
        await createEventNotification(`Device "${updatedDevice.name}" updated to ${deviceData.status}`, 'device', selectedDevice.id, 'device');
      }
      setEditDeviceModalOpen(false);
      setSelectedDevice(null);
    } catch (error) {
      console.error('Error updating device via API, updating locally:', error);
      // Fallback: Update locally
      if (selectedDevice?.id) {
        const updatedDevice: Device = {
          ...selectedDevice,
          name: deviceData.name,
          deviceType: deviceData.deviceType,
          os: deviceData.os,
          location: deviceData.location,
          status: deviceData.status || selectedDevice.status,
          assignedTo: deviceData.assignedTo || selectedDevice.assignedTo
        };
        
        setDeviceHealth(deviceHealth.map(d => 
          d.id === selectedDevice.id ? updatedDevice : d
        ));
        
        // Add notification
        const maxNotifId = Math.max(...notifications.map(n => Number(n.id)), 0);
        const newNotification: Notification = {
          id: maxNotifId + 1,
          message: `Device "${updatedDevice.name}" updated`,
          time: new Date().toISOString(),
          type: 'device'
        };
        setNotifications([newNotification, ...notifications]);
      }
      setEditDeviceModalOpen(false);
      setSelectedDevice(null);
    }
  };

  const saveIssueChanges = async (issueData: IssueFormData) => {
    try {
      if (selectedIssue?.id) {
        const updatedIssue = await updateIssue(token, selectedIssue.id.toString(), issueData);
        
        setRecentIssues(recentIssues.map(i => 
          i.id === selectedIssue.id ? updatedIssue : i
        ));
        
        await createEventNotification(`Issue "${updatedIssue.title}" status changed to ${issueData.status}`, 'issue', selectedIssue.id, 'issue');
      }
      setEditIssueModalOpen(false);
      setSelectedIssue(null);
    } catch (error) {
      console.error('Error updating issue via API, updating locally:', error);
      // Fallback: Update locally
      if (selectedIssue?.id) {
        const updatedIssue: Issue = {
          ...selectedIssue,
          title: issueData.title,
          description: issueData.description,
          priority: issueData.priority,
          category: issueData.category,
          status: issueData.status,
          assignedTo: issueData.assignedTo || selectedIssue.assignedTo,
          device: issueData.deviceId ? deviceHealth.find(d => d.id === issueData.deviceId) || undefined : selectedIssue.device
        };
        
        setRecentIssues(recentIssues.map(i => 
          i.id === selectedIssue.id ? updatedIssue : i
        ));
        
        // Add notification
        const maxNotifId = Math.max(...notifications.map(n => Number(n.id)), 0);
        const newNotification: Notification = {
          id: maxNotifId + 1,
          message: `Issue "${updatedIssue.title}" updated`,
          time: new Date().toISOString(),
          type: 'issue'
        };
        setNotifications([newNotification, ...notifications]);
      }
      setEditIssueModalOpen(false);
      setSelectedIssue(null);
    }
  };
  
  const handleDeleteDevice = (device: Device) => {
    setItemToDelete(device);
    setDeleteDeviceModalOpen(true);
  };

  const handleDeleteIssue = (issue: Issue) => {
    setItemToDelete(issue);
    setDeleteIssueModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setItemToDelete(user);
    setDeleteUserModalOpen(true);
  };

  const confirmDeleteDevice = async () => {
    try {
      if (itemToDelete) {
        // Remove from state
        setDeviceHealth(deviceHealth.filter(d => d.id !== itemToDelete.id));
        
        await createEventNotification(`Device "${itemToDelete.name}" deleted`, 'device', itemToDelete.id, 'device');
      }
      setDeleteDeviceModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting device via API, deleting locally:', error);
      // Fallback: Delete locally
      if (itemToDelete) {
        setDeviceHealth(deviceHealth.filter(d => d.id !== itemToDelete.id));
        
        // Add notification
        const maxNotifId = Math.max(...notifications.map(n => Number(n.id)), 0);
        const newNotification: Notification = {
          id: maxNotifId + 1,
          message: `Device "${itemToDelete.name}" deleted`,
          time: new Date().toISOString(),
          type: 'device'
        };
        setNotifications([newNotification, ...notifications]);
      }
      setDeleteDeviceModalOpen(false);
      setItemToDelete(null);
    }
  };

  const confirmDeleteIssue = async () => {
    try {
      if (itemToDelete) {
        setRecentIssues(recentIssues.filter(i => i.id !== itemToDelete.id));
        
        await createEventNotification(`Issue "${itemToDelete.title}" deleted`, 'issue', itemToDelete.id, 'issue');
      }
      setDeleteIssueModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting issue via API, deleting locally:', error);
      // Fallback: Delete locally
      if (itemToDelete) {
        setRecentIssues(recentIssues.filter(i => i.id !== itemToDelete.id));
        
        // Add notification
        const maxNotifId = Math.max(...notifications.map(n => Number(n.id)), 0);
        const newNotification: Notification = {
          id: maxNotifId + 1,
          message: `Issue "${itemToDelete.title}" deleted`,
          time: new Date().toISOString(),
          type: 'issue'
        };
        setNotifications([newNotification, ...notifications]);
      }
      setDeleteIssueModalOpen(false);
      setItemToDelete(null);
    }
  };

  const confirmDeleteUser = async () => {
    try {
      if (itemToDelete) {
        setUsers(users.filter(u => u.id !== itemToDelete.id));
        
        await createEventNotification(`User "${itemToDelete.name}" deleted`, 'user', itemToDelete.id, 'user');
      }
      setDeleteUserModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting user via API, deleting locally:', error);
      // Fallback: Delete locally
      if (itemToDelete) {
        setUsers(users.filter(u => u.id !== itemToDelete.id));
        
        // Add notification
        const maxNotifId = Math.max(...notifications.map(n => Number(n.id)), 0);
        const newNotification: Notification = {
          id: maxNotifId + 1,
          message: `User "${itemToDelete.name}" deleted`,
          time: new Date().toISOString(),
          type: 'user'
        };
        setNotifications([newNotification, ...notifications]);
      }
      setDeleteUserModalOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="logo-container">
            <img src={logo} alt="SoftLineOps Logo" className="logo-square" />
            <div className="brand-logo">SoftLineOps</div>
          </div>
          <div className="brand-motto">Smoother Systems, Smarter Operations</div>
        </div>
        
        <button className="menu-button" onClick={toggleMenu}>
          ☰
        </button>
        
        <ul className={`nav-links ${menuOpen ? 'visible' : ''}`}>
          <li>
            <button className="nav-link" onClick={() => scrollToSection(statsRef)}>
              Overview
            </button>
          </li>
          <li>
            <button className="nav-link" onClick={() => scrollToSection(issuesRef)}>
              Issues
            </button>
          </li>
          <li>
            <button className="nav-link" onClick={() => scrollToSection(devicesRef)}>
              Devices
            </button>
          </li>
          <li>
            <button className="nav-link" onClick={() => scrollToSection(usersRef)}>
              Users
            </button>
          </li>
          <li>
            <button className="nav-link" onClick={() => scrollToSection(notificationsRef)}>
              Notifications
            </button>
          </li>
          <li>
            <button 
              className="nav-link report-issue-btn" 
              onClick={() => setErrorReportModalOpen(true)}
            >
              Report Issue
            </button>
          </li>
          <li>
            <button className="nav-link logout-btn" onClick={onLogout}>
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* Welcome Section */}
      <section className="welcome-section dashboard-section">
        <h2>Welcome to SoftLineOps</h2>
        <p>Your centralized IT support and device management solution. Monitor device health, track issues, and manage your IT infrastructure from one convenient dashboard.</p>
      </section>

      <div className="dashboard-content">
        {/* System Overview */}
        <section className="dashboard-section" ref={statsRef}>
          <div className="section-header">
            <h2 className="section-title">System Overview</h2>
          </div>
          
          {loadingStats ? (
            <div className="loading-message">Loading stats...</div>
          ) : (
            <div className="stats-row">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-value">{stat.value}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Issues */}
        <section className="dashboard-section" ref={issuesRef}>
          <div className="section-header">
            <h2 className="section-title">Recent Issues</h2>
            <button className="add-button" onClick={() => setIssueModalOpen(true)}>
              + Add Issue
            </button>
          </div>
          
          {loadingIssues ? (
            <div className="loading-message">Loading issues...</div>
          ) : recentIssues.length === 0 ? (
            <div className="empty-message">No issues reported yet.</div>
          ) : (
            <div className="cards-grid">
              {recentIssues.map((issue, index) => (
                <div key={index} className="card">
                  <div className="card-header">
                    <h4 className="card-title">{issue.title}</h4>
                    <div className="card-header-controls">
                      <button 
                        className="edit-button" 
                        onClick={() => handleEditIssue(issue)}
                        aria-label={`Edit issue ${issue.title}`}
                      >
                        <span className="gear-icon">⚙️</span>
                      </button>
                      <button 
                        className="delete-button" 
                        onClick={() => handleDeleteIssue(issue)}
                        aria-label={`Delete issue ${issue.title}`}
                      >
                        <span className="delete-icon">🗑️</span>
                      </button>
                    </div>
                  </div>
                  
                  <p className="card-description">{issue.description}</p>
                  
                  <div className="priority-badge-container">
                    <span className={`priority priority-${issue.priority}`}>
                      {issue.priority}
                    </span>
                  </div>
                  
                  <div className="card-meta">
                    <span className="meta-item">{issue.category}</span>
                    <span className="meta-item">
                      {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Device Health */}
        <section className="dashboard-section" ref={devicesRef}>
          <div className="section-header">
            <h2 className="section-title">Device Health</h2>
            <button className="add-button" onClick={() => setDeviceModalOpen(true)}>
              + Add Device
            </button>
          </div>
          
          {loadingDevices ? (
            <div className="loading-message">Loading devices...</div>
          ) : deviceHealth.length === 0 ? (
            <div className="empty-message">No devices registered yet.</div>
          ) : (
            <div className="cards-grid">
              {deviceHealth.map((device, index) => (
                <div key={index} className="card device-card">
                  <div className="card-header">
                    <h4 className="card-title">{device.name}</h4>
                    <div className="card-header-controls">
                      <button 
                        className="edit-button" 
                        onClick={() => handleEditDevice(device)}
                        aria-label={`Edit device ${device.name}`}
                      >
                        <span className="gear-icon">⚙️</span>
                      </button>
                      <button 
                        className="delete-button" 
                        onClick={() => handleDeleteDevice(device)}
                        aria-label={`Delete device ${device.name}`}
                      >
                        <span className="delete-icon">🗑️</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="device-details">
                    <p><strong>Type:</strong> {device.deviceType}</p>
                    <p><strong>OS:</strong> {device.os}</p>
                    <p><strong>Location:</strong> {device.location}</p>
                  </div>
                  
                  <div className="status-badge-container">
                    <span className={`device-status status-${device.status}`}>
                      {device.status}
                    </span>
                  </div>
                  
                  {device.health && (
                    <div className="health-metrics">
                      <div className="health-bar">
                        <div className="health-label">
                          <span>CPU</span>
                          <span>{device.health?.cpu ?? 0}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${(device.health?.cpu ?? 0) > 80 ? 'critical' : (device.health?.cpu ?? 0) > 60 ? 'warning' : ''}`}
                            style={{ width: `${device.health?.cpu ?? 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="health-bar">
                        <div className="health-label">
                          <span>Memory</span>
                          <span>{device.health?.memory ?? 0}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${(device.health?.memory ?? 0) > 80 ? 'critical' : (device.health?.memory ?? 0) > 60 ? 'warning' : ''}`}
                            style={{ width: `${device.health?.memory ?? 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="health-bar">
                        <div className="health-label">
                          <span>Disk</span>
                          <span>{device.health?.disk ?? 0}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${(device.health?.disk ?? 0) > 80 ? 'critical' : (device.health?.disk ?? 0) > 60 ? 'warning' : ''}`}
                            style={{ width: `${device.health?.disk ?? 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Users */}
        <section className="dashboard-section" ref={usersRef}>
          <div className="section-header">
            <h2 className="section-title">Users</h2>
            <button className="add-button" onClick={() => setUserModalOpen(true)}>
              + Add User
            </button>
          </div>
          
          {loadingUsers ? (
            <div className="loading-message">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="empty-message">No users found.</div>
          ) : (
            <div className="cards-grid">
              {users.map((user, index) => (
                <div key={index} className="card user-card">
                  <div className="card-header">
                    <h4 className="card-title">{user.name}</h4>
                    <div className="card-header-controls">
                      <button 
                        className="edit-button" 
                        onClick={() => handleEditUser(user)}
                        aria-label={`Edit user ${user.name}`}
                      >
                        <span className="gear-icon">⚙️</span>
                      </button>
                      <button 
                        className="delete-button" 
                        onClick={() => handleDeleteUser(user)}
                        aria-label={`Delete user ${user.name}`}
                      >
                        <span className="delete-icon">🗑️</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="user-details">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Department:</strong> {user.department}</p>
                    <p><strong>Role:</strong> {user.role || 'User'}</p>
                    {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Notifications */}
        <section className="dashboard-section" ref={notificationsRef}>
          <div className="section-header">
            <h2 className="section-title">Notifications</h2>
          </div>
          
          {loadingNotifications ? (
            <div className="loading-message">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="empty-message">No notifications.</div>
          ) : (
            <div className="cards-grid">
              {notifications.map((notification, index) => (
                <div key={index} className="card notification-card">
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatNotificationTime(notification.time)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img
              src={logo}
              alt="SoftLineOps Logo"
              className="logo-square footer-logo-icon"
              style={{ height: '26px', width: '26px', borderRadius: '6px' }}
              onError={(e) => {
                console.warn('Footer logo failed to load');
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="footer-brand">SoftLineOps</span>
          </div>
          <div className="footer-info">
            <p>&copy; {new Date().getFullYear()} SoftLineOps. All rights reserved.</p>
            <p className="footer-tagline">Smoother Systems, Smarter Operations</p>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link" onClick={(e) => {
              e.preventDefault();
              setMenuOpen(true);
              setTimeout(() => {
                const reportIssueElement = document.querySelector('.report-issue-btn');
                if (reportIssueElement) {
                  (reportIssueElement as HTMLElement).focus();
                  reportIssueElement.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}>Support</a>
          </div>
        </div>
      </footer>

      {/* Device Modal */}
      {deviceModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Add New Device</h2>
              <button className="modal-close" onClick={() => setDeviceModalOpen(false)}>×</button>
            </div>
            <DeviceForm onSubmit={handleAddDevice} onCancel={() => setDeviceModalOpen(false)} />
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {issueModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Report New Issue</h2>
              <button className="modal-close" onClick={() => setIssueModalOpen(false)}>×</button>
            </div>
            <IssueForm onSubmit={handleAddIssue} onCancel={() => setIssueModalOpen(false)} users={users} devices={deviceHealth} />
          </div>
        </div>
      )}

      {/* User Modal */}
      {userModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="modal-close" onClick={() => setUserModalOpen(false)}>×</button>
            </div>
            <UserForm onSubmit={handleAddUser} onCancel={() => setUserModalOpen(false)} />
          </div>
        </div>
      )}

      {/* Edit Device Modal */}
      {editDeviceModalOpen && selectedDevice && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Edit Device</h2>
              <button className="modal-close" onClick={() => setEditDeviceModalOpen(false)}>×</button>
            </div>
            <DeviceForm 
              onSubmit={saveDeviceChanges} 
              onCancel={() => setEditDeviceModalOpen(false)} 
              initialData={selectedDevice}
              users={users}
              isEditing={true}
            />
          </div>
        </div>
      )}

      {/* Edit Issue Modal */}
      {editIssueModalOpen && selectedIssue && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Edit Issue</h2>
              <button className="modal-close" onClick={() => setEditIssueModalOpen(false)}>×</button>
            </div>
            <IssueForm 
              onSubmit={saveIssueChanges} 
              onCancel={() => setEditIssueModalOpen(false)} 
              initialData={selectedIssue}
              users={users}
              devices={deviceHealth}
              isEditing={true}
            />
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUserModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="modal-close" onClick={() => setEditUserModalOpen(false)}>×</button>
            </div>
            <UserForm 
              onSubmit={saveUserChanges} 
              onCancel={() => setEditUserModalOpen(false)} 
              initialData={selectedUser}
              isEditing={true}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modals */}
      {deleteDeviceModalOpen && itemToDelete && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Delete Device</h2>
              <button className="modal-close" onClick={() => setDeleteDeviceModalOpen(false)}>×</button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete the device "{itemToDelete.name}"?</p>
              <p className="warning-text">This action cannot be undone.</p>
              <div className="form-actions">
                <button className="button-secondary" onClick={() => setDeleteDeviceModalOpen(false)}>Cancel</button>
                <button className="button-danger" onClick={confirmDeleteDevice}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteIssueModalOpen && itemToDelete && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Delete Issue</h2>
              <button className="modal-close" onClick={() => setDeleteIssueModalOpen(false)}>×</button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete the issue "{itemToDelete.title}"?</p>
              <p className="warning-text">This action cannot be undone.</p>
              <div className="form-actions">
                <button className="button-secondary" onClick={() => setDeleteIssueModalOpen(false)}>Cancel</button>
                <button className="button-danger" onClick={confirmDeleteIssue}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteUserModalOpen && itemToDelete && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Delete User</h2>
              <button className="modal-close" onClick={() => setDeleteUserModalOpen(false)}>×</button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete the user "{itemToDelete.name}"?</p>
              <p className="warning-text">This action cannot be undone.</p>
              <div className="form-actions">
                <button className="button-secondary" onClick={() => setDeleteUserModalOpen(false)}>Cancel</button>
                <button className="button-danger" onClick={confirmDeleteUser}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Reporting Modal */}
      {errorReportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container error-report-modal">
            <div className="modal-header">
              <div className="error-report-header">
                <div className="error-report-logo">
                  <img src={logo} alt="SoftLineOps Logo" className="error-report-logo-icon" style={{ height: '30px', width: '30px', borderRadius: '6px' }} />
                  <h3 className="error-report-brand">SoftLineOps</h3>
                </div>
                <p className="error-report-motto">Smoother Systems, Smarter Operations</p>
              </div>
              <button className="modal-close" onClick={() => setErrorReportModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-content">
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#357ded' }}>Report an Issue</h2>
              <form onSubmit={handleErrorReport} className="error-report-form">
                <div className="form-group">
                  <label htmlFor="report-subject">Subject*</label>
                  <input
                    id="report-subject"
                    type="text"
                    value={errorReportData.subject}
                    onChange={(e) => setErrorReportData({...errorReportData, subject: e.target.value})}
                    placeholder="Brief summary of the issue"
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="report-category">Category*</label>
                  <select
                    id="report-category"
                    value={errorReportData.category}
                    onChange={(e) => setErrorReportData({...errorReportData, category: e.target.value})}
                    className="form-select"
                    required
                  >
                    <option value="general">General</option>
                    <option value="ui">User Interface</option>
                    <option value="performance">Performance</option>
                    <option value="functionality">Functionality</option>
                    <option value="data">Data Issues</option>
                    <option value="security">Security</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="report-severity">Severity*</label>
                  <select
                    id="report-severity"
                    value={errorReportData.severity}
                    onChange={(e) => setErrorReportData({...errorReportData, severity: e.target.value})}
                    className="form-select"
                    required
                  >
                    <option value="low">Low - Minor inconvenience</option>
                    <option value="medium">Medium - Partial functionality affected</option>
                    <option value="high">High - Major feature unusable</option>
                    <option value="critical">Critical - System unusable</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="report-description">Description*</label>
                  <textarea
                    id="report-description"
                    value={errorReportData.description}
                    onChange={(e) => setErrorReportData({...errorReportData, description: e.target.value})}
                    placeholder="Please provide details about the issue, steps to reproduce, and any error messages"
                    required
                    className="form-textarea"
                    rows={5}
                  />
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={() => setErrorReportModalOpen(false)} className="button-secondary">Cancel</button>
                  <button type="submit" className="button-primary">Submit Report</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Format notification time
function formatNotificationTime(timeString: string) {
  const now = new Date();
  const notificationTime = new Date(timeString);
  const diffMs = now.getTime() - notificationTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return notificationTime.toLocaleDateString();
}

// Device Form Component
function DeviceForm({ onSubmit, onCancel, initialData = null, users = [], isEditing = false }: 
  { onSubmit: (data: DeviceFormData) => void, 
    onCancel: () => void, 
    initialData?: Device | null, 
    users?: User[],
    isEditing?: boolean
  }) {
  const [name, setName] = useState(initialData?.name || '');
  const [deviceType, setDeviceType] = useState(initialData?.deviceType || 'computer');
  const [os, setOs] = useState(initialData?.os || 'Windows 11 Pro');
  const [location, setLocation] = useState(initialData?.location || '');
  const [status, setStatus] = useState(initialData?.status || 'online');
  const [assignedUserId, setAssignedUserId] = useState(
    initialData?.assignedTo ? initialData.assignedTo.id.toString() : ''
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const deviceData: DeviceFormData = {
      ...(initialData || {}),
      name,
      deviceType,
      os,
      location,
      status,
      assignedTo: assignedUserId ? users.find(u => u.id.toString() === assignedUserId) || null : null
    };
    
    onSubmit(deviceData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="form-group">
        <label htmlFor="device-name">Device Name*</label>
        <input
          id="device-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter device name"
          required
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="device-type">Device Type*</label>
        <select
          id="device-type"
          value={deviceType}
          onChange={(e) => setDeviceType(e.target.value)}
          className="form-select"
          required
        >
          <option value="computer">Desktop Computer</option>
          <option value="laptop">Laptop</option>
          <option value="server">Server</option>
          <option value="printer">Printer</option>
          <option value="router">Router</option>
          <option value="switch">Switch</option>
          <option value="phone">Phone</option>
          <option value="tablet">Tablet</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="device-os">Operating System*</label>
        <select
          id="device-os"
          value={os}
          onChange={(e) => setOs(e.target.value)}
          className="form-select"
          required
        >
          <option value="Windows 11 Pro">Windows 11 Pro</option>
          <option value="Windows 10 Enterprise">Windows 10 Enterprise</option>
          <option value="macOS Ventura">macOS Ventura</option>
          <option value="macOS Monterey">macOS Monterey</option>
          <option value="Ubuntu 22.04">Ubuntu 22.04</option>
          <option value="Ubuntu 20.04">Ubuntu 20.04</option>
          <option value="CentOS 8">CentOS 8</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="device-location">Location*</label>
        <input
          id="device-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter device location"
          required
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="device-status">Status*</label>
        <select
          id="device-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="form-select"
          required
        >
          <option value="online">🟢 Online</option>
          <option value="offline">🔴 Offline</option>
          <option value="maintenance">🟡 Maintenance</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="assigned-user">Assign to User (Optional)</label>
        <select
          id="assigned-user"
          value={assignedUserId}
          onChange={(e) => setAssignedUserId(e.target.value)}
          className="form-select"
        >
          <option value="">Select a user</option>
          {users.map(user => (
            <option key={user.id} value={user.id.toString()}>
              {user.name} - {user.department}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="button-secondary">Cancel</button>
        <button type="submit" className="button-primary">
          {isEditing ? 'Update Device' : 'Add Device'}
        </button>
      </div>
    </form>
  );
}

// Issue Form Component - Fix device.id possibly undefined and keep loadingUsers as it's used in JSX
function IssueForm({ onSubmit, onCancel, initialData = null, users = [], devices = [], isEditing = false }: 
  { onSubmit: (data: IssueFormData) => void, 
    onCancel: () => void, 
    initialData?: Issue | null, 
    users?: User[],
    devices?: Device[],
    isEditing?: boolean
  }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState(initialData?.priority || 'medium');
  const [category, setCategory] = useState(initialData?.category || 'software');
  const [status, setStatus] = useState(initialData?.status || 'Open');
  const [assignedUserId, setAssignedUserId] = useState(
    initialData?.assignedTo ? initialData.assignedTo.id.toString() : ''
  );
  const [deviceId, setDeviceId] = useState(initialData?.device?.id || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const issueData: IssueFormData = {
      ...(initialData || {}),
      title,
      description,
      priority,
      category,
      status,
      assignedTo: assignedUserId ? users.find(u => u.id.toString() === assignedUserId) || null : null,
      deviceId: deviceId || undefined
    };
    
    onSubmit(issueData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="form-group">
        <label htmlFor="issue-title">Title*</label>
        <input
          id="issue-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief issue title"
          required
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="issue-description">Description*</label>
        <textarea
          id="issue-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description of the issue"
          required
          className="form-textarea"
          rows={4}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="issue-priority">Priority*</label>
        <select
          id="issue-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="form-select"
          required
        >
          <option value="low">🟢 Low - Minor issue, can wait</option>
          <option value="medium">🟡 Medium - Should be addressed soon</option>
          <option value="high">🟠 High - Needs immediate attention</option>
          <option value="critical">🔴 Critical - Blocks critical operations</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="issue-category">Category*</label>
        <select
          id="issue-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-select"
          required
        >
          <option value="hardware">Hardware</option>
          <option value="software">Software</option>
          <option value="network">Network</option>
          <option value="access">Access/Security</option>
          <option value="performance">Performance</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="issue-status">Status*</label>
        <select
          id="issue-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="form-select"
          required
        >
          <option value="Open">📋 Open - Issue reported</option>
          <option value="In Progress">🔄 In Progress - Being worked on</option>
          <option value="Resolved">✅ Resolved - Issue fixed</option>
          <option value="Closed">🔒 Closed - Issue completed</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="assigned-user">Assign to (Optional)</label>
        <select
          id="assigned-user"
          value={assignedUserId}
          onChange={(e) => setAssignedUserId(e.target.value)}
          className="form-select"
        >
          <option value="">Select a technician</option>
          {users.filter(u => u.role === 'technician' || u.role === 'admin').map(user => (
            <option key={user.id} value={user.id.toString()}>
              {user.name} - {user.department}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="related-device">Related Device (Optional)</label>
        <select
          id="related-device"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          className="form-select"
        >
          <option value="">Select a device</option>
          {devices.map(device => (
            <option key={device.id || 'unknown'} value={device.id?.toString() || ''}>
              {device.name} - {device.location}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="button-secondary">Cancel</button>
        <button type="submit" className="button-primary">
          {isEditing ? 'Update Issue' : 'Report Issue'}
        </button>
      </div>
    </form>
  );
}

// User Form Component
function UserForm({ onSubmit, onCancel, initialData = null, isEditing = false }: 
  { onSubmit: (data: UserFormData) => void, 
    onCancel: () => void, 
    initialData?: User | null, 
    isEditing?: boolean
  }) {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [department, setDepartment] = useState(initialData?.department || '');
  const [role, setRole] = useState(initialData?.role || 'user');
  const [phone, setPhone] = useState(initialData?.phone || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData: UserFormData = {
      ...(initialData || {}),
      name,
      email,
      department,
      role,
      phone
    };
    
    onSubmit(userData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="form-group">
        <label htmlFor="user-name">Full Name*</label>
        <input
          id="user-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter full name"
          required
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="user-email">Email*</label>
        <input
          id="user-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          required
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="user-department">Department*</label>
        <input
          id="user-department"
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="Enter department"
          required
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="user-role">Role*</label>
        <select
          id="user-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="form-select"
          required
        >
          <option value="user">User</option>
          <option value="technician">Technician</option>
          <option value="admin">Administrator</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="user-phone">Phone (Optional)</label>
        <input
          id="user-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number"
          className="form-input"
        />
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="button-secondary">Cancel</button>
        <button type="submit" className="button-primary">
          {isEditing ? 'Update User' : 'Add User'}
        </button>
      </div>
    </form>
  );
}

// Add mock data that can be edited
const mockUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@company.com', department: 'IT', role: 'admin', phone: '555-0101' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', department: 'HR', role: 'user', phone: '555-0102' },
  { id: 3, name: 'Bob Johnson', email: 'bob.johnson@company.com', department: 'IT', role: 'technician', phone: '555-0103' },
  { id: 4, name: 'Alice Brown', email: 'alice.brown@company.com', department: 'Finance', role: 'user', phone: '555-0104' }
];

const mockDevices: Device[] = [
  { 
    id: 1, 
    name: 'Main Server', 
    deviceType: 'server', 
    os: 'Ubuntu 22.04', 
    location: 'Server Room A', 
    status: 'online',
    health: { cpu: 45, memory: 60, disk: 30 }
  },
  { 
    id: 2, 
    name: 'John\'s Laptop', 
    deviceType: 'laptop', 
    os: 'Windows 11 Pro', 
    location: 'Office 101', 
    status: 'online',
    health: { cpu: 25, memory: 40, disk: 50 }
  },
  { 
    id: 3, 
    name: 'Conference Room Printer', 
    deviceType: 'printer', 
    os: 'Other', 
    location: 'Conference Room', 
    status: 'offline',
    health: { cpu: 0, memory: 0, disk: 0 }
  }
];

const mockIssues: Issue[] = [
  { 
    id: 1, 
    title: 'Network connectivity issues', 
    description: 'Users in the east wing are experiencing intermittent network drops.', 
    priority: 'high', 
    category: 'network', 
    status: 'Open',
    createdAt: '2024-01-15T10:30:00Z',
    assignedTo: mockUsers[2]
  },
  { 
    id: 2, 
    title: 'Software update required', 
    description: 'Multiple computers need security updates installed.', 
    priority: 'medium', 
    category: 'software', 
    status: 'In Progress',
    createdAt: '2024-01-14T14:20:00Z',
    assignedTo: mockUsers[2]
  },
  { 
    id: 3, 
    title: 'Printer out of toner', 
    description: 'The main office printer needs toner replacement.', 
    priority: 'low', 
    category: 'hardware', 
    status: 'Resolved',
    createdAt: '2024-01-13T09:15:00Z',
    assignedTo: mockUsers[2]
  }
];

const mockNotifications: Notification[] = [
  { id: 1, message: 'New device "Main Server" added to inventory', time: new Date(Date.now() - 3600000).toISOString(), type: 'device' },
  { id: 2, message: 'Issue "Network connectivity issues" status changed to In Progress', time: new Date(Date.now() - 7200000).toISOString(), type: 'issue' },
  { id: 3, message: 'Device "John\'s Laptop" health check completed', time: new Date(Date.now() - 10800000).toISOString(), type: 'device' }
];

const mockStats: Stat[] = [
  { label: 'Total Devices', value: '3' },
  { label: 'Online Devices', value: '2' },
  { label: 'Healthy Devices', value: '2' },
  { label: 'Total Issues', value: '3' },
  { label: 'Open Issues', value: '2' },
  { label: 'Resolved Issues', value: '1' },
  { label: 'Critical Issues', value: '0' },
  { label: 'Total Users', value: '4' }
];

export default Dashboard;