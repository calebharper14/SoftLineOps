import { useState } from 'react'
import { Monitor, Shield, Users, Sparkles, Zap } from 'lucide-react'

interface LoginProps {
  onLogin: () => void
}

const Login = ({ onLogin }: LoginProps) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-lg fade-in">
        {/* Header */}
        <div className="text-center mb-8 bounce-in">
          <div className="flex justify-center items-center mb-6">
            <div className="relative">
              <Monitor className="h-12 w-12 text-blue-600 mr-3" />
              <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">SoftLineOps</h1>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Smarter Systems, Smoother Operations</p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 slide-in-left">
            <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-700">IT Support</p>
            <p className="text-xs text-gray-500 mt-1">24/7 Assistance</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 slide-in-right">
            <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Device Health</p>
            <p className="text-xs text-gray-500 mt-1">Real-time Monitoring</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              className="transition-all duration-300"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="transition-all duration-300"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full relative overflow-hidden group"
          >
            <span className="flex items-center justify-center">
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                  Sign In
                </>
              )}
            </span>
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="flex items-center justify-center mb-2">
            <Sparkles className="h-4 w-4 text-yellow-500 mr-2" />
            <p className="text-sm font-semibold text-gray-700">Demo Access</p>
          </div>
          <p className="text-xs text-gray-600 text-center">
            Use any username and password to explore the platform
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            © 2024 SoftLineOps. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
