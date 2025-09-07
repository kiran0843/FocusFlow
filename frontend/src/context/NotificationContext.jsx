import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { 
  CheckCircle, 
  Zap, 
  TrendingUp, 
  Star, 
  Target, 
  Clock,
  AlertCircle,
  Trophy
} from 'lucide-react'

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0
}

// Action types
const NOTIFICATION_ACTIONS = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  CLEAR_ALL: 'CLEAR_ALL',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION'
}

// Reducer function
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      const newNotification = {
        ...action.payload,
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        read: false
      }
      return {
        ...state,
        notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
        unreadCount: state.unreadCount + 1
      }
    
    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }
    
    case NOTIFICATION_ACTIONS.CLEAR_ALL:
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      }
    
    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      const notificationToRemove = state.notifications.find(n => n.id === action.payload)
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: notificationToRemove && !notificationToRemove.read 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount
      }
    
    default:
      return state
  }
}

// Create context
const NotificationContext = createContext()

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState)

  // Add notification function
  const addNotification = useCallback((notification) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
      payload: notification
    })
    
    // Show toast notification
    if (notification.showToast !== false) {
      toast.success(notification.message, {
        duration: 4000,
        icon: notification.icon ? React.createElement(notification.icon, { className: "h-5 w-5" }) : undefined
      })
    }
  }, [])

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.MARK_AS_READ,
      payload: notificationId
    })
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ALL })
  }, [])

  // Remove notification
  const removeNotification = useCallback((notificationId) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION,
      payload: notificationId
    })
  }, [])

  // Predefined notification types
  const notifyTaskCompleted = useCallback((taskTitle) => {
    addNotification({
      type: 'task_completed',
      message: `Task completed: ${taskTitle}`,
      icon: CheckCircle,
      color: 'text-green-400',
      category: 'task'
    })
  }, [addNotification])

  const notifyPomodoroCompleted = useCallback((xpEarned = 25) => {
    addNotification({
      type: 'pomodoro_completed',
      message: `Pomodoro session completed! +${xpEarned} XP`,
      icon: Zap,
      color: 'text-yellow-400',
      category: 'pomodoro'
    })
  }, [addNotification])

  const notifyLevelUp = useCallback((newLevel) => {
    addNotification({
      type: 'level_up',
      message: `Level ${newLevel} reached! New features unlocked.`,
      icon: Star,
      color: 'text-purple-400',
      category: 'achievement'
    })
  }, [addNotification])

  const notifyStreak = useCallback((streakType, days) => {
    addNotification({
      type: 'streak',
      message: `You're on a ${days}-day ${streakType} streak! Keep it up!`,
      icon: TrendingUp,
      color: 'text-blue-400',
      category: 'streak'
    })
  }, [addNotification])

  const notifyAchievement = useCallback((achievementName) => {
    addNotification({
      type: 'achievement',
      message: `Achievement unlocked: ${achievementName}`,
      icon: Trophy,
      color: 'text-orange-400',
      category: 'achievement'
    })
  }, [addNotification])

  const notifyDistraction = useCallback((distractionType) => {
    addNotification({
      type: 'distraction',
      message: `Distraction logged: ${distractionType}`,
      icon: AlertCircle,
      color: 'text-red-400',
      category: 'distraction',
      showToast: false // Don't show toast for distractions
    })
  }, [addNotification])

  // Context value
  const value = {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    
    // Actions
    addNotification,
    markAsRead,
    clearAll,
    removeNotification,
    
    // Predefined notifications
    notifyTaskCompleted,
    notifyPomodoroCompleted,
    notifyLevelUp,
    notifyStreak,
    notifyAchievement,
    notifyDistraction
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export default NotificationContext
