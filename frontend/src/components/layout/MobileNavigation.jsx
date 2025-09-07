import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Target, 
  Timer, 
  BarChart3, 
  Trophy, 
  Settings,
  X,
  Zap
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

/**
 * Mobile navigation component with bottom tab bar
 */
const MobileNavigation = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { user } = useAuth()

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: Target
    },
    {
      name: 'Pomodoro',
      href: '/pomodoro',
      icon: Timer
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3
    },
    {
      name: 'Achievements',
      href: '/achievements',
      icon: Trophy
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ]

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="glass border-t border-white/20 backdrop-blur-md">
          <div className="flex items-center justify-around py-2">
            {navigationItems.slice(0, 4).map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200",
                    isActive 
                      ? "text-focus-400 bg-focus-500/20" 
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <div className="absolute left-0 top-0 h-full w-80 glass border-r border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-focus-500 to-focus-600 rounded-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">FocusFlow</h1>
                  <p className="text-xs text-white/60">Level {user?.level || 1}</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-focus-500 to-focus-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{user?.name || 'User'}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-focus-400 to-focus-600 rounded-full transition-all duration-500"
                        style={{ width: `${user?.levelProgress || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/60">{user?.xp || 0} XP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-white/20 text-white shadow-lg" 
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <div className="w-1 h-6 bg-gradient-to-b from-focus-400 to-focus-600 rounded-full ml-auto" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Quick Stats */}
            <div className="p-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{user?.level || 1}</div>
                  <div className="text-xs text-white/60">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{user?.xp || 0}</div>
                  <div className="text-xs text-white/60">XP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MobileNavigation
