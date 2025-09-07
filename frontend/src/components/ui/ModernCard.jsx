import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Modern card component with glassmorphism and hover effects
 */
const ModernCard = ({ 
  children, 
  className, 
  variant = 'default',
  hover = true,
  gradient = false,
  ...props 
}) => {
  const variants = {
    default: 'glass-card',
    elevated: 'glass-card shadow-xl',
    bordered: 'glass-card border-2 border-white/30',
    gradient: 'bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border border-white/20',
    solid: 'bg-white/10 backdrop-blur-md border border-white/20'
  }

  return (
    <div
      className={cn(
        variants[variant],
        'rounded-xl p-6 transition-all duration-300',
        hover && 'hover:scale-105 hover:shadow-2xl hover:bg-white/20',
        gradient && 'bg-gradient-to-br from-focus-500/20 to-indigo-500/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Stats card component with icon and value
 */
export const StatsCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend, 
  color = 'focus',
  className 
}) => {
  const colorClasses = {
    focus: 'from-focus-500 to-focus-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    error: 'from-error-500 to-error-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600'
  }

  return (
    <ModernCard className={cn('text-center group', className)}>
      <div className={cn(
        'w-16 h-16 bg-gradient-to-r rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300',
        colorClasses[color]
      )}>
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
      <p className="text-white/80 font-medium mb-1">{title}</p>
      {subtitle && (
        <p className="text-white/60 text-sm">{subtitle}</p>
      )}
      {trend && (
        <div className={cn(
          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2',
          trend > 0 ? 'bg-success-500/20 text-success-400' : 'bg-error-500/20 text-error-400'
        )}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </div>
      )}
    </ModernCard>
  )
}

/**
 * Task card component
 */
export const TaskCard = ({ 
  task, 
  onComplete, 
  onEdit, 
  onDelete, 
  className 
}) => {
  const priorityColors = {
    low: 'border-l-green-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-red-500'
  }

  return (
    <ModernCard className={cn('border-l-4', priorityColors[task.priority], className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onComplete(task.id)}
            className={cn(
              'w-5 h-5 rounded border-2 transition-all duration-200 hover:scale-110',
              task.completed 
                ? 'bg-success-500 border-success-500' 
                : 'border-white/40 hover:border-success-500'
            )}
          >
            {task.completed && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <div>
            <h3 className={cn(
              'font-semibold text-white',
              task.completed && 'line-through opacity-60'
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-white/70 text-sm mt-1">{task.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            task.priority === 'high' && 'bg-red-500/20 text-red-400',
            task.priority === 'medium' && 'bg-yellow-500/20 text-yellow-400',
            task.priority === 'low' && 'bg-green-500/20 text-green-400'
          )}>
            {task.priority}
          </span>
          
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit(task.id)}
              className="p-1 hover:bg-white/10 rounded transition-colors duration-200"
            >
              <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 hover:bg-red-500/20 rounded transition-colors duration-200"
            >
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </ModernCard>
  )
}

/**
 * Pomodoro session card
 */
export const PomodoroCard = ({ 
  session, 
  onStart, 
  onPause, 
  onResume, 
  onComplete, 
  className 
}) => {
  const sessionTypeColors = {
    work: 'from-red-500 to-red-600',
    short_break: 'from-green-500 to-green-600',
    long_break: 'from-blue-500 to-blue-600'
  }

  const statusColors = {
    pending: 'text-gray-400',
    active: 'text-green-400',
    paused: 'text-yellow-400',
    completed: 'text-blue-400',
    cancelled: 'text-red-400'
  }

  return (
    <ModernCard className={cn('group', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={cn(
            'w-12 h-12 bg-gradient-to-r rounded-xl flex items-center justify-center',
            sessionTypeColors[session.sessionType]
          )}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold capitalize">
              {session.sessionType.replace('_', ' ')} Session
            </h3>
            <p className={cn('text-sm font-medium', statusColors[session.status])}>
              {session.status}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold text-white">
            {session.duration}:00
          </p>
          <p className="text-white/60 text-sm">Duration</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-white/70">
          <span>Progress</span>
          <span>{Math.round(session.progress || 0)}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-focus-500 to-focus-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${session.progress || 0}%` }}
          />
        </div>
      </div>
      
      <div className="flex space-x-2 mt-4">
        {session.status === 'pending' && (
          <button
            onClick={() => onStart(session.id)}
            className="flex-1 bg-gradient-to-r from-focus-500 to-focus-600 text-white px-4 py-2 rounded-lg font-medium hover:from-focus-600 hover:to-focus-700 transition-all duration-200"
          >
            Start
          </button>
        )}
        {session.status === 'active' && (
          <button
            onClick={() => onPause(session.id)}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200"
          >
            Pause
          </button>
        )}
        {session.status === 'paused' && (
          <button
            onClick={() => onResume(session.id)}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200"
          >
            Resume
          </button>
        )}
        {session.status === 'active' && (
          <button
            onClick={() => onComplete(session.id)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
          >
            Complete
          </button>
        )}
      </div>
    </ModernCard>
  )
}

/**
 * Achievement card component
 */
export const AchievementCard = ({ 
  achievement, 
  unlocked = false, 
  className 
}) => {
  return (
    <ModernCard className={cn(
      'text-center group relative overflow-hidden',
      unlocked ? 'ring-2 ring-yellow-400' : 'opacity-60',
      className
    )}>
      {unlocked && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
      
      <div className={cn(
        'w-16 h-16 bg-gradient-to-r rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300',
        unlocked ? 'from-yellow-500 to-yellow-600' : 'from-gray-500 to-gray-600'
      )}>
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      </div>
      
      <h3 className="text-white font-semibold mb-2">{achievement.title}</h3>
      <p className="text-white/70 text-sm mb-3">{achievement.description}</p>
      
      <div className="flex items-center justify-center space-x-2">
        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-yellow-400 font-medium">+{achievement.xp} XP</span>
      </div>
    </ModernCard>
  )
}

export default ModernCard
