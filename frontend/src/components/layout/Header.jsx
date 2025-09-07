import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Zap,
  Trophy,
  Target,
  Clock,
  BarChart3,
  Home,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAppData } from '@/context/AppDataContext'
import { useNotifications } from '@/context/NotificationContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

/**
 * Modern Header component with enhanced functionality and real-time data
 */
const Header = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const appData = useAppData()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  
  // Safely destructure with fallback values
  const { tasks = [], analytics = null, user: appUser = null } = appData || {}
  
  // Use default values for Pomodoro data since not all pages have PomodoroProvider
  const stats = { completedSessions: 0 }
  const distractions = []
  
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Calculate real-time stats
  const todaysTasks = (tasks || []).filter(task => {
    const today = new Date().toISOString().split('T')[0]
    return task.date === today
  })
  
  const completedTasks = todaysTasks.filter(task => task.completed).length
  const totalTasks = todaysTasks.length

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  // Search functionality
  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const results = []
    
    // Search tasks
    todaysTasks.forEach(task => {
      if (task.title.toLowerCase().includes(query.toLowerCase()) ||
          task.description?.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          type: 'task',
          title: task.title,
          description: task.description || 'No description',
          href: '/tasks',
          icon: Target,
          completed: task.completed
        })
      }
    })

    // Search navigation items
    const navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Overview and stats' },
      { name: 'Tasks', href: '/tasks', icon: Target, description: 'Manage your tasks' },
      { name: 'Pomodoro', href: '/pomodoro', icon: Clock, description: 'Focus sessions' },
      { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Progress insights' },
      { name: 'Achievements', href: '/achievements', icon: Trophy, description: 'Your accomplishments' },
      { name: 'Settings', href: '/settings', icon: Settings, description: 'App preferences' }
    ]

    navItems.forEach(item => {
      if (item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          type: 'navigation',
          title: item.name,
          description: item.description,
          href: item.href,
          icon: item.icon
        })
      }
    })

    setSearchResults(results)
    setShowSearchResults(true)
  }, [todaysTasks])

  // Handle search result click
  const handleSearchResultClick = (href) => {
    navigate(href)
    setShowSearchResults(false)
    setSearchQuery('')
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-menu')) {
        setShowUserMenu(false)
        setShowNotifications(false)
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    toast.success('Logged out successfully')
  }

  const handleNavigation = (href) => {
    navigate(href)
    setShowUserMenu(false)
  }

  return (
    <header className="glass-header p-4 sticky top-0 z-30 backdrop-blur-md">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 hover:bg-black/20 rounded-lg transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>

          {/* Enhanced Search Bar */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                type="text"
                placeholder="Search tasks, sessions, pages..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="form-input pl-10 pr-4 py-2 w-80"
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass rounded-lg shadow-lg z-50 dropdown-menu">
                  <div className="p-2">
                    {searchResults.map((result, index) => {
                      const Icon = result.icon
                      return (
                        <button
                          key={index}
                          onClick={() => handleSearchResultClick(result.href)}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-black/20 rounded-lg transition-colors duration-200 text-left"
                        >
                          <Icon className="h-5 w-5 text-white/70" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{result.title}</p>
                            <p className="text-white/60 text-sm truncate">{result.description}</p>
                            {result.completed !== undefined && (
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                result.completed 
                                  ? "bg-green-500/20 text-green-400" 
                                  : "bg-yellow-500/20 text-yellow-400"
                              )}>
                                {result.completed ? 'Completed' : 'Pending'}
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Enhanced Quick Stats */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg hover:from-yellow-500/30 hover:to-yellow-600/30 transition-all duration-200 cursor-pointer group">
              <Zap className="h-4 w-4 text-yellow-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm text-white font-semibold">{appUser?.xp || 0} XP</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg hover:from-purple-500/30 hover:to-purple-600/30 transition-all duration-200 cursor-pointer group">
              <Trophy className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm text-white font-semibold">Level {appUser?.level || 1}</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg hover:from-green-500/30 hover:to-green-600/30 transition-all duration-200 cursor-pointer group">
              <Target className="h-4 w-4 text-green-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm text-white font-semibold">{completedTasks}/{totalTasks} Tasks</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-200 cursor-pointer group">
              <Clock className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm text-white font-semibold">{stats?.completedSessions || 0} Sessions</span>
            </div>
          </div>


          {/* Enhanced Notifications */}
          <div className="relative dropdown-menu">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-black/20 rounded-lg transition-colors duration-200 relative group"
            >
              <Bell className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-200" />
              {/* Notification Badge - Only show if there are unread notifications */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Enhanced Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-96 glass rounded-lg shadow-lg z-50 dropdown-menu">
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">Notifications</h3>
                    <span className="text-white/60 text-sm">{unreadCount} unread</span>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => {
                      const Icon = notification.icon
                      return (
                        <div 
                          key={notification.id} 
                          className={cn(
                            "p-4 hover:bg-black/10 transition-colors duration-200 border-b border-white/5 last:border-b-0 cursor-pointer",
                            !notification.read && "bg-blue-500/10"
                          )}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={cn("p-2 rounded-lg", notification.color.replace('text-', 'bg-').replace('-400', '-500/20'))}>
                              <Icon className={cn("h-4 w-4", notification.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm leading-relaxed">{notification.message}</p>
                              <p className="text-white/60 text-xs mt-1">
                                {new Date(notification.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 text-white/30 mx-auto mb-3" />
                      <p className="text-white/60 text-sm">No notifications yet</p>
                      <p className="text-white/40 text-xs mt-1">You'll see app activity notifications here</p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-white/5">
                    <button
                      onClick={() => navigate('/notifications')}
                      className="text-focus-400 text-sm hover:text-focus-300 transition-colors duration-200 font-medium"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced User Menu */}
          <div className="relative dropdown-menu">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 hover:bg-black/20 rounded-lg transition-colors duration-200 group"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-focus-500 to-focus-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-semibold text-sm">
                  {appUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-white font-medium text-sm">{appUser?.name || 'User'}</p>
                <p className="text-white/60 text-xs">Level {appUser?.level || 1}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-white/60 group-hover:text-white transition-colors duration-200" />
            </button>

            {/* Enhanced User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 glass rounded-lg shadow-lg z-50 dropdown-menu">
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-focus-500 to-focus-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {appUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{appUser?.name || 'User'}</p>
                      <p className="text-white/60 text-sm truncate">{appUser?.email || 'user@example.com'}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-focus-400 to-focus-600 rounded-full transition-all duration-500"
                            style={{ width: `${appUser?.levelProgress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/60">{appUser?.xp || 0} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <button 
                    onClick={() => handleNavigation('/profile')}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-white/70 hover:bg-black/20 hover:text-white transition-colors duration-200 group"
                  >
                    <User className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Profile</span>
                  </button>
                  <button 
                    onClick={() => handleNavigation('/settings')}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-white/70 hover:bg-black/20 hover:text-white transition-colors duration-200 group"
                  >
                    <Settings className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Settings</span>
                  </button>
                  <button 
                    onClick={() => handleNavigation('/achievements')}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-white/70 hover:bg-black/20 hover:text-white transition-colors duration-200 group"
                  >
                    <Trophy className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Achievements</span>
                  </button>
                  <hr className="my-2 border-white/5" />
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors duration-200 group"
                  >
                    <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Search */}
      <div className="md:hidden mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
          <input
            type="text"
            placeholder="Search tasks, sessions, pages..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="form-input w-full pl-10 pr-4 py-2"
          />
          
          {/* Mobile Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 glass rounded-lg shadow-lg z-50 dropdown-menu">
              <div className="p-2">
                {searchResults.map((result, index) => {
                  const Icon = result.icon
                  return (
                    <button
                      key={index}
                      onClick={() => handleSearchResultClick(result.href)}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-black/20 rounded-lg transition-colors duration-200 text-left"
                    >
                      <Icon className="h-5 w-5 text-white/70" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{result.title}</p>
                        <p className="text-white/60 text-sm truncate">{result.description}</p>
                        {result.completed !== undefined && (
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            result.completed 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-yellow-500/20 text-yellow-400"
                          )}>
                            {result.completed ? 'Completed' : 'Pending'}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
