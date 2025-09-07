import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import axios from 'axios'

// Initial state
const initialState = {
  user: null,
  token: null, // Don't load token from localStorage on startup
  loading: false, // Start with loading false
  error: null
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      localStorage.setItem('focusflow-token', action.payload.token)
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      }
    
    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      }
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      localStorage.removeItem('focusflow-token')
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      }
    
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('focusflow-token')
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      }
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

axios.defaults.baseURL = API_BASE_URL

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Set up axios interceptor for token
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [state.token])

  // Check for existing token on app start
  useEffect(() => {
    const checkExistingToken = async () => {
      const storedToken = localStorage.getItem('focusflow-token')
      
      if (storedToken) {
        // Set loading state
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_START })
        
        // Set token in state first
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user: null, token: storedToken } })
        
        // Then validate it
        try {
          const response = await axios.get('/auth/me')
          
          // If successful, user is authenticated
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
            payload: response.data.data.user
          })
        } catch (error) {
          console.error('Token validation failed:', error)
          
          // Check if it's a network error (server not available)
          if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
            // If server is not available, clear token and show login
            localStorage.removeItem('focusflow-token')
            dispatch({
              type: AUTH_ACTIONS.LOAD_USER_FAILURE,
              payload: 'Server not available. Please login again.'
            })
          } else {
            // If token is invalid or expired, clear it and logout
            localStorage.removeItem('focusflow-token')
            dispatch({
              type: AUTH_ACTIONS.LOAD_USER_FAILURE,
              payload: 'Session expired. Please login again.'
            })
          }
        }
      } else {
        // No token, user is not authenticated
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_SUCCESS, payload: null })
      }
    }
    
    checkExistingToken()
  }, []) // Only run once on mount

  // Validate token and load user function
  const validateAndLoadUser = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_START })
      
      // First, validate the token by making a request to the server
      const response = await axios.get('/auth/me')
      
      // If successful, user is authenticated
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
        payload: response.data.data.user
      })
    } catch (error) {
      console.error('Token validation failed:', error)
      
      // Check if it's a network error (server not available)
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        // If server is not available, clear token and show login
        localStorage.removeItem('focusflow-token')
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: 'Server not available. Please login again.'
        })
      } else {
        // If token is invalid or expired, clear it and logout
        localStorage.removeItem('focusflow-token')
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: 'Session expired. Please login again.'
        })
      }
    }
  }

  // Load user function (for manual calls)
  const loadUser = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_START })
      
      const response = await axios.get('/auth/me')
      
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
        payload: response.data.data.user
      })
    } catch (error) {
      console.error('Load user error:', error)
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_FAILURE,
        payload: error.response?.data?.message || 'Failed to load user'
      })
    }
  }

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      
      const response = await axios.post('/auth/login', {
        email,
        password
      })
      
      const { user, token } = response.data.data
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      })
      
      toast.success(`Welcome back, ${user.name}!`)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message
      })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Register function
  const register = async (name, email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START })
      
      const response = await axios.post('/auth/register', {
        name,
        email,
        password
      })
      
      const { user, token } = response.data.data
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user, token }
      })
      
      toast.success(`Welcome to FocusFlow, ${user.name}!`)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: message
      })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Logout function with complete cleanup
  const logout = () => {
    // Clear all authentication data
    localStorage.removeItem('focusflow-token')
    delete axios.defaults.headers.common['Authorization']
    
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
    toast.success('Logged out successfully')
  }

  // Update user function
  const updateUser = async (userData) => {
    try {
      const response = await axios.put('/auth/profile', userData)
      const updatedUser = response.data.data.user
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: updatedUser
      })
      
      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.post('/auth/change-password', {
        currentPassword,
        newPassword
      })
      
      toast.success('Password changed successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  // Force logout function (for when server is unavailable)
  const forceLogout = () => {
    localStorage.removeItem('focusflow-token')
    delete axios.defaults.headers.common['Authorization']
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    changePassword,
    clearError,
    loadUser,
    forceLogout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
