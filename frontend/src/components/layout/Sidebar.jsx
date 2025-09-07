import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Target, 
  Timer, 
  BarChart3, 
  Trophy, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

/**
 * Sidebar navigation component with glassmorphism design
 */
const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation()
  const { user, logout } = useAuth()

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and stats'
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: Target,
      description: 'Manage your tasks'
    },
    {
      name: 'Pomodoro',
      href: '/pomodoro',
      icon: Timer,
      description: 'Focus sessions'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Progress insights'
    },
    {
      name: 'Achievements',
      href: '/achievements',
      icon: Trophy,
      description: 'Your accomplishments'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'App preferences'
    }
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full glass-sidebar transition-all duration-300 z-40",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-focus-500 to-focus-600 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FocusFlow</h1>
              <p className="text-xs text-white/60">Level {user?.level || 1}</p>
            </div>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-2 hover:bg-black/20 rounded-lg transition-colors duration-200"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-white" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-focus-500 to-focus-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user?.name || 'User'}</p>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
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
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-black/30 text-white shadow-lg" 
                  : "text-white/70 hover:bg-black/20 hover:text-white"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs opacity-60 truncate">{item.description}</p>
                  </div>
                  
                  {isActive && (
                    <div className="w-1 h-6 bg-gradient-to-b from-focus-400 to-focus-600 rounded-full" />
                  )}
                </>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center space-x-3 w-full px-3 py-2.5 text-white/70 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all duration-200 group"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && (
            <>
              <span className="font-medium">Logout</span>
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Logout
                </div>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
