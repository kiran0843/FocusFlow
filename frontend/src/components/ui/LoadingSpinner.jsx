import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * LoadingSpinner component with customizable size and styling
 */
const LoadingSpinner = ({ 
  size = 'default', 
  className,
  text = 'Loading...',
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <Loader2 className={cn('animate-spin text-focus-500', sizeClasses[size])} />
      {showText && (
        <span className="text-sm text-gray-600 dark:text-gray-300">{text}</span>
      )}
    </div>
  )
}

/**
 * Full screen loading spinner
 */
export const FullScreenLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-focus-50 to-focus-100 dark:from-gray-900 dark:to-gray-800">
      <div className="glass-card p-8 flex flex-col items-center space-y-4">
        <LoadingSpinner size="xl" text={text} />
      </div>
    </div>
  )
}

/**
 * Glassmorphism loading spinner
 */
export const GlassLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="glass-card p-6 flex flex-col items-center space-y-4">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

export default LoadingSpinner
