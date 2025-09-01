import { useState } from 'react'
import { 
  Monitor, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Settings, 
  LogOut,
  Plus,
  Bell,
  Activity,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Search,
  Filter
} from 'lucide-react'

interface DashboardProps {
  onLogout: () => void
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data
  const stats = {
    totalDevices: 24,
    activeIssues: 3,
    resolvedToday: 8,
    healthyDevices: 21
  }

  const recentIssues = [
    { id: 1, title: 'Network connectivity issue', status: 'open', priority: 'high', user: 'John Doe', time: '2 hours ago' },
    { id: 2, title: 'Software installation request', status: 'in-progress', priority: 'medium', user: 'Jane Smith', time: '4 hours ago' },
    { id: 3, title: 'Hardware malfunction', status: 'resolved', priority: 'high', user: 'Mike Johnson', time: '6 hours ago' }
  ]

  const deviceHealth = [
    { name: 'DESK-001', cpu: 45, ram: 67, disk: 23, status: 'healthy', location: 'Office A' },
    { name: 'DESK-002', cpu: 89, ram: 92, disk: 78, status: 'warning', location: 'Office B' },
    { name: 'DESK-003', cpu: 23, ram: 34, disk: 45, status: 'healthy', location: 'Office C' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Monitor className="h-8 w-8" />
            <span>SoftLineOps</span>
          </div>
          
          <div className="navbar-nav">
            <button className="nav-item hover:scale-110 transition-transform">
              <Bell className="h-5 w-5" />
            </button>
            <button className="nav-item hover:scale-110 transition-transform">
              <Settings className="h-5 w-5" />
            </button>
            <button 
              onClick={onLogout}
              className="nav-item hover:scale-110 transition-transform flex items-center"
            >
              <LogOut className="h-5 w-5 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 👋</h1>
          <p className="text-gray-600">Here's what's happening with your systems today.</p>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'issues', label: 'Issues', icon: AlertTriangle },
              { id: 'devices', label: 'Devices', icon: Monitor },
              { id: 'reports', label: 'Reports', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 fade-in">
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Devices</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalDevices}</p>
                    <p className="text-xs text-green-600 mt-1">↗ +2 this week</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Monitor className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Active Issues</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeIssues}</p>
                    <p className="text-xs text-red-600 mt-1">↗ +1 today</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-xl">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Resolved Today</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.resolvedToday}</p>
                    <p className="text-xs text-green-600 mt-1">↗ +3 from yesterday</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Healthy Devices</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.healthyDevices}</p>
                    <p className="text-xs text-green-600 mt-1">87.5% uptime</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Recent Issues */}
            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Issues</h3>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Search className="h-4 w-4 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Filter className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {recentIssues.map((issue, index) => (
                  <div key={issue.id} className={`px-6 py-4 hover:bg-gray-50 transition-colors slide-in-${index % 2 === 0 ? 'left' : 'right'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 mb-1">{issue.title}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Reported by {issue.user}</span>
                          <span>•</span>
                          <span>{issue.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                          issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {issue.priority}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          issue.status === 'open' ? 'bg-red-100 text-red-800' :
                          issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {issue.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Issues Tab */}
        {activeTab === 'issues' && (
          <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Issue Management</h2>
                <p className="text-gray-600 mt-1">Track and resolve system issues efficiently</p>
              </div>
              <button className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                New Issue
              </button>
            </div>
            
            <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
              <div className="text-center">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Issue Management System</h3>
                <p className="text-gray-600">Advanced issue tracking and resolution tools would be implemented here.</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Devices Tab */}
        {activeTab === 'devices' && (
          <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Device Health Monitor</h2>
                <p className="text-gray-600 mt-1">Real-time monitoring of all connected devices</p>
              </div>
              <button className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </button>
            </div>

            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-semibold text-gray-900">Device Status</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {deviceHealth.map((device, index) => (
                  <div key={index} className={`px-6 py-4 hover:bg-gray-50 transition-colors slide-in-${index % 2 === 0 ? 'left' : 'right'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <p className="text-sm font-semibold text-gray-900 mr-3">{device.name}</p>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{device.location}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">CPU</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${device.cpu > 80 ? 'bg-red-500' : device.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${device.cpu}%` }}
                              ></div>
                            </div>
                            <p className="text-xs font-medium mt-1">{device.cpu}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">RAM</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${device.ram > 80 ? 'bg-red-500' : device.ram > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${device.ram}%` }}
                              ></div>
                            </div>
                            <p className="text-xs font-medium mt-1">{device.ram}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Disk</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${device.disk > 80 ? 'bg-red-500' : device.disk > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${device.disk}%` }}
                              ></div>
                            </div>
                            <p className="text-xs font-medium mt-1">{device.disk}%</p>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ml-4 ${
                        device.status === 'healthy' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {device.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6 fade-in">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
              <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
            </div>
            <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">Advanced reporting and analytics tools would be implemented here.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
