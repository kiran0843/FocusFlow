import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'

/**
 * Pomodoro Context for managing timer state and API integration
 */
const PomodoroContext = createContext()

// Action types
const POMODORO_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_ACTIVE_SESSION: 'SET_ACTIVE_SESSION',
  START_NEW_SESSION: 'START_NEW_SESSION',
  CLEAR_ACTIVE_SESSION: 'CLEAR_ACTIVE_SESSION',
  UPDATE_TIMER: 'UPDATE_TIMER',
  SET_SESSION_TYPE: 'SET_SESSION_TYPE',
  ADD_DISTRACTION: 'ADD_DISTRACTION',
  SET_SETTINGS: 'SET_SETTINGS',
  SET_STATS: 'SET_STATS',
  SET_HISTORY: 'SET_HISTORY'
}

// Initial state
const initialState = {
  loading: false,
  error: null,
  activeSession: null,
  sessionType: 'work',
  timeLeft: 25 * 60,
  isRunning: false,
  isPaused: false,
  distractions: [],
  settings: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    soundEnabled: true,
    notificationsEnabled: true
  },
  stats: {
    totalSessions: 0,
    completedSessions: 0,
    totalXP: 0,
    completionRate: 0,
    averageRating: 0
  },
  history: [],
  sessionCount: 0
}

// Reducer
const pomodoroReducer = (state, action) => {
  switch (action.type) {
    case POMODORO_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case POMODORO_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false }
    
    case POMODORO_ACTIONS.SET_ACTIVE_SESSION:
      return { 
        ...state, 
        activeSession: action.payload,
        sessionType: action.payload?.sessionType || 'work',
        timeLeft: action.payload ? (action.payload.duration * 60) : (state.settings.workDuration * 60),
        isRunning: false, // Don't auto-start when loading existing session
        isPaused: false,
        distractions: action.payload?.distractions || []
      }
    
    case POMODORO_ACTIONS.START_NEW_SESSION:
      return { 
        ...state, 
        activeSession: action.payload,
        sessionType: action.payload?.sessionType || 'work',
        timeLeft: action.payload ? (action.payload.duration * 60) : (state.settings.workDuration * 60),
        isRunning: true, // Auto-start when starting new session
        isPaused: false,
        distractions: action.payload?.distractions || []
      }
    
    case POMODORO_ACTIONS.CLEAR_ACTIVE_SESSION:
      return { 
        ...state, 
        activeSession: null,
        isRunning: false,
        isPaused: false,
        distractions: []
      }
    
    case POMODORO_ACTIONS.UPDATE_TIMER:
      return { 
        ...state, 
        timeLeft: action.payload.timeLeft,
        isRunning: action.payload.isRunning,
        isPaused: action.payload.isPaused
      }
    
    case POMODORO_ACTIONS.SET_SESSION_TYPE:
      return { 
        ...state, 
        sessionType: action.payload,
        timeLeft: getDurationForSessionType(action.payload, state.settings) * 60,
        isRunning: false,
        isPaused: false
      }
    
    case POMODORO_ACTIONS.ADD_DISTRACTION:
      return { 
        ...state, 
        distractions: [...state.distractions, action.payload]
      }
    
    case POMODORO_ACTIONS.SET_SETTINGS:
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload }
      }
    
    case POMODORO_ACTIONS.SET_STATS:
      return { 
        ...state, 
        stats: action.payload
      }
    
    case POMODORO_ACTIONS.SET_HISTORY:
      return { 
        ...state, 
        history: action.payload
      }
    
    default:
      return state
  }
}

// Helper function to get duration for session type
const getDurationForSessionType = (sessionType, settings) => {
  switch (sessionType) {
    case 'work':
      return settings.workDuration
    case 'short_break':
      return settings.shortBreakDuration
    case 'long_break':
      return settings.longBreakDuration
    default:
      return settings.workDuration
  }
}

/**
 * Pomodoro Provider Component
 */
export const PomodoroProvider = ({ children }) => {
  const [state, dispatch] = useReducer(pomodoroReducer, initialState)
  const { user, token } = useAuth()

  // API base URL
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API Call Error:', error)
      throw error
    }
  }

  // Start a new Pomodoro session
  const startSession = useCallback(async (sessionType = 'work', duration = null) => {
    try {
      dispatch({ type: POMODORO_ACTIONS.SET_LOADING, payload: true })

      const sessionData = {
        sessionType,
        duration: duration || getDurationForSessionType(sessionType, state.settings)
      }

      const response = await apiCall('/pomodoro/start', {
        method: 'POST',
        body: JSON.stringify(sessionData)
      })

      const session = {
        ...response.data.session,
        id: response.data.session.id // Ensure id is available
      }
      dispatch({ type: POMODORO_ACTIONS.START_NEW_SESSION, payload: session })
      toast.success(`${sessionData.sessionType === 'work' ? 'Work session' : 'Break'} started!`)
      
      return session
    } catch (error) {
      dispatch({ type: POMODORO_ACTIONS.SET_ERROR, payload: error.message })
      toast.error('Failed to start session')
      throw error
    }
  }, [apiCall, state.settings])

  // Complete a Pomodoro session
  const completeSession = useCallback(async (sessionId, notes = null, rating = null) => {
    try {
      dispatch({ type: POMODORO_ACTIONS.SET_LOADING, payload: true })

      const completionData = {
        sessionId,
        notes,
        rating
      }

      const response = await apiCall('/pomodoro/complete', {
        method: 'POST',
        body: JSON.stringify(completionData)
      })

      dispatch({ type: POMODORO_ACTIONS.CLEAR_ACTIVE_SESSION })
      
      // Show XP gained celebration
      if (response.data.xpResult.xpGained > 0) {
        toast.success(`Session complete! +${response.data.xpResult.xpGained} XP earned!`)
        
        if (response.data.xpResult.leveledUp) {
          toast.success(`🎉 Level Up! You're now level ${response.data.xpResult.newLevel}!`)
        }
      }

      return response.data
    } catch (error) {
      dispatch({ type: POMODORO_ACTIONS.SET_ERROR, payload: error.message })
      toast.error('Failed to complete session')
      throw error
    }
  }, [apiCall])

  // Cancel a Pomodoro session
  const cancelSession = useCallback(async (sessionId) => {
    try {
      dispatch({ type: POMODORO_ACTIONS.SET_LOADING, payload: true })

      await apiCall('/pomodoro/cancel', {
        method: 'DELETE',
        body: JSON.stringify({ sessionId })
      })

      dispatch({ type: POMODORO_ACTIONS.CLEAR_ACTIVE_SESSION })
      toast.info('Session cancelled')
    } catch (error) {
      dispatch({ type: POMODORO_ACTIONS.SET_ERROR, payload: error.message })
      toast.error('Failed to cancel session')
      throw error
    }
  }, [apiCall])

  // Add distraction to active session (legacy method)
  const addDistraction = useCallback(async (sessionId, type, note = '') => {
    try {
      const distractionData = {
        sessionId,
        type,
        note
      }

      const response = await apiCall('/pomodoro/distraction', {
        method: 'POST',
        body: JSON.stringify(distractionData)
      })

      dispatch({ type: POMODORO_ACTIONS.ADD_DISTRACTION, payload: response.data.distraction })
      toast.info('Distraction logged')
      
      return response.data
    } catch (error) {
      dispatch({ type: POMODORO_ACTIONS.SET_ERROR, payload: error.message })
      toast.error('Failed to log distraction')
      throw error
    }
  }, [apiCall])

  // Log distraction using new distraction API
  const logDistraction = useCallback(async (distractionData) => {
    try {
      if (!state.activeSession) {
        throw new Error('No active Pomodoro session')
      }

      const fullDistractionData = {
        pomodoroSessionId: state.activeSession.id,
        type: distractionData.type,
        description: distractionData.description || '',
        duration: distractionData.duration || 30, // Use provided duration or default to 30 seconds
        severity: 3, // Default medium severity
        impact: 3, // Default medium impact
        context: 'other',
        source: 'external'
      }

      const response = await apiCall('/distractions', {
        method: 'POST',
        body: JSON.stringify(fullDistractionData)
      })

      // Optimistically update the local state instead of refetching
      const newDistraction = {
        _id: response.data.distraction._id,
        type: distractionData.type,
        description: distractionData.description || '',
        duration: distractionData.duration || 30,
        timestamp: new Date(),
        severity: 3,
        impact: 3
      }

      // Update the active session with the new distraction
      dispatch({ 
        type: POMODORO_ACTIONS.SET_ACTIVE_SESSION, 
        payload: {
          ...state.activeSession,
          distractions: [...(state.activeSession.distractions || []), newDistraction]
        }
      })
      
      toast.success('Distraction logged successfully')
      return response.data
    } catch (error) {
      dispatch({ type: POMODORO_ACTIONS.SET_ERROR, payload: error.message })
      toast.error('Failed to log distraction')
      throw error
    }
  }, [apiCall, state.activeSession])

  // Get active session
  const getActiveSession = useCallback(async () => {
    try {
      const response = await apiCall('/pomodoro/active')
      
      if (response.data.session) {
        const session = {
          ...response.data.session,
          id: response.data.session.id // Ensure id is available
        }
        dispatch({ type: POMODORO_ACTIONS.SET_ACTIVE_SESSION, payload: session })
        return session
      } else {
        dispatch({ type: POMODORO_ACTIONS.CLEAR_ACTIVE_SESSION })
        return null
      }
    } catch (error) {
      dispatch({ type: POMODORO_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }, [apiCall])

  // Get session history
  const getSessionHistory = useCallback(async (startDate = null, endDate = null, limit = 30) => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (limit) params.append('limit', limit)

      const response = await apiCall(`/pomodoro/history?${params}`)
      dispatch({ type: POMODORO_ACTIONS.SET_HISTORY, payload: response.data.sessions })
      
      return response.data.sessions
    } catch (error) {
      dispatch({ type: POMODORO_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }, [apiCall])

  // Get session statistics
  const getSessionStats = useCallback(async (startDate = null, endDate = null) => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await apiCall(`/pomodoro/stats?${params}`)
      dispatch({ type: POMODORO_ACTIONS.SET_STATS, payload: response.data.stats })
      
      return response.data
    } catch (error) {
      dispatch({ type: POMODORO_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }, [apiCall])

  // Update timer state
  const updateTimer = useCallback((timeLeft, isRunning, isPaused) => {
    dispatch({ 
      type: POMODORO_ACTIONS.UPDATE_TIMER, 
      payload: { timeLeft, isRunning, isPaused } 
    })
  }, [])

  // Set session type
  const setSessionType = useCallback((sessionType) => {
    dispatch({ type: POMODORO_ACTIONS.SET_SESSION_TYPE, payload: sessionType })
  }, [])

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    dispatch({ type: POMODORO_ACTIONS.SET_SETTINGS, payload: newSettings })
  }, [])

  // Load active session on mount
  useEffect(() => {
    if (user && token) {
      getActiveSession()
      getSessionStats()
    }
  }, [user, token])

  // Context value
  const value = useMemo(() => ({
    // State
    ...state,
    // Actions
    startSession,
    completeSession,
    cancelSession,
    addDistraction,
    logDistraction,
    getActiveSession,
    getSessionHistory,
    getSessionStats,
    updateTimer,
    setSessionType,
    updateSettings
  }), [state, startSession, completeSession, cancelSession, addDistraction, logDistraction, getActiveSession, getSessionHistory, getSessionStats, updateTimer, setSessionType, updateSettings])

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  )
}

/**
 * Hook to use Pomodoro context
 */
export const usePomodoro = () => {
  const context = useContext(PomodoroContext)
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider')
  }
  return context
}

export default PomodoroContext
