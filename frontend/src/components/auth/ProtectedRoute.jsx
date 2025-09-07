import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'

/**
 * ProtectedRoute component that requires authentication
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-focus-50 to-focus-100 dark:from-gray-900 dark:to-gray-800">
        <div className="glass-card p-8 flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-focus-500" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Render protected content if authenticated
  return children
}

/**
 * PublicRoute component that redirects authenticated users
 * Used for login/register pages
 */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-focus-50 to-focus-100 dark:from-gray-900 dark:to-gray-800">
        <div className="glass-card p-8 flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-focus-500" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={from} replace />
  }

  // Render public content if not authenticated
  return children
}

export default ProtectedRoute
