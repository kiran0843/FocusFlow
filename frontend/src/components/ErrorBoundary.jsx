import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Error boundary component for handling React errors gracefully
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
  }

  handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-focus-50 to-focus-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="glass-card p-8 text-center space-y-6">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>

              {/* Error Message */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  We encountered an unexpected error. Don't worry, our team has been notified.
                </p>
              </div>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="text-left bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <h3 className="text-red-400 font-semibold mb-2 flex items-center">
                    <Bug className="h-4 w-4 mr-2" />
                    Error Details (Development)
                  </h3>
                  <pre className="text-red-300 text-sm overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={this.handleRetry}
                  variant="gradient"
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="glass"
                  className="w-full sm:w-auto"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                If this problem persists, please contact our support team.
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Error fallback component for specific error types
 */
export const ErrorFallback = ({ 
  error, 
  resetError, 
  type = 'general',
  className 
}) => {
  const errorTypes = {
    general: {
      icon: AlertTriangle,
      title: 'Something went wrong',
      message: 'We encountered an unexpected error. Please try again.',
      color: 'from-red-500 to-red-600'
    },
    network: {
      icon: AlertTriangle,
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      color: 'from-yellow-500 to-yellow-600'
    },
    notFound: {
      icon: AlertTriangle,
      title: 'Not Found',
      message: 'The requested resource could not be found.',
      color: 'from-blue-500 to-blue-600'
    },
    unauthorized: {
      icon: AlertTriangle,
      title: 'Access Denied',
      message: 'You do not have permission to access this resource.',
      color: 'from-purple-500 to-purple-600'
    }
  }

  const errorConfig = errorTypes[type] || errorTypes.general
  const Icon = errorConfig.icon

  return (
    <div className={cn(
      "glass-card p-8 text-center space-y-6",
      className
    )}>
      {/* Error Icon */}
      <div className={cn(
        "w-16 h-16 bg-gradient-to-r rounded-full flex items-center justify-center mx-auto",
        errorConfig.color
      )}>
        <Icon className="h-8 w-8 text-white" />
      </div>

      {/* Error Message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">
          {errorConfig.title}
        </h2>
        <p className="text-white/70">
          {errorConfig.message}
        </p>
      </div>

      {/* Retry Button */}
      {resetError && (
        <Button
          onClick={resetError}
          variant="gradient"
          className="mx-auto"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}

/**
 * Network error component
 */
export const NetworkError = ({ onRetry, className }) => {
  return (
    <ErrorFallback
      type="network"
      resetError={onRetry}
      className={className}
    />
  )
}

/**
 * Not found error component
 */
export const NotFoundError = ({ onRetry, className }) => {
  return (
    <ErrorFallback
      type="notFound"
      resetError={onRetry}
      className={className}
    />
  )
}

/**
 * Unauthorized error component
 */
export const UnauthorizedError = ({ onRetry, className }) => {
  return (
    <ErrorFallback
      type="unauthorized"
      resetError={onRetry}
      className={className}
    />
  )
}

/**
 * Hook for error handling in functional components
 */
export const useErrorHandler = () => {
  const handleError = (error, errorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    
    // You can add additional error handling logic here
    // such as sending to error reporting service
  }

  const handleAsyncError = (error) => {
    console.error('Async error caught:', error)
    // Handle async errors
  }

  return {
    handleError,
    handleAsyncError
  }
}

export default ErrorBoundary
