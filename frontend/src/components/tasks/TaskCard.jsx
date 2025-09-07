import React, { useState } from 'react'
import { 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Trash2, 
  Clock, 
  Flag, 
  Tag,
  GripVertical,
  Star
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

/**
 * Individual task card component with completion animations
 */
const TaskCard = ({ 
  task, 
  index, 
  onComplete, 
  onUncomplete, 
  onEdit, 
  onDelete, 
  onReorder,
  showCelebration = false,
  dragProps = {}
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  // Priority colors
  const priorityColors = {
    low: 'text-green-500 bg-green-100 dark:bg-green-900/30',
    medium: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
    high: 'text-red-500 bg-red-100 dark:bg-red-900/30'
  }

  // Handle completion with animation
  const handleCompletion = async () => {
    if (task.completed) {
      onUncomplete(task._id)
    } else {
      setIsCompleting(true)
      await onComplete(task._id)
      setTimeout(() => setIsCompleting(false), 1000)
    }
  }

  // Format completion time
  const formatCompletionTime = (timeInMinutes) => {
    if (!timeInMinutes) return null
    const hours = Math.floor(timeInMinutes / 60)
    const minutes = timeInMinutes % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div
      className={`
        glass-card p-6 transition-all duration-300 cursor-pointer
        ${task.completed 
          ? 'opacity-75 scale-95' 
          : 'hover:scale-105 hover:shadow-xl'
        }
        ${showCelebration ? 'animate-bounce' : ''}
        ${isCompleting ? 'animate-pulse' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${index * 100}ms`,
        ...dragProps.style
      }}
      {...dragProps}
    >
      {/* Drag Handle */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Task {index + 1}
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className={`
          flex items-center gap-1 transition-opacity duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Edit task"
          >
            <Edit3 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
            title="Delete task"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Task Content */}
      <div className="mb-4">
        {/* Title */}
        <h3 className={`
          text-lg font-semibold mb-2 transition-all duration-300
          ${task.completed 
            ? 'line-through text-gray-500 dark:text-gray-400' 
            : 'text-gray-900 dark:text-white'
          }
        `}>
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className={`
            text-sm mb-3 transition-all duration-300
            ${task.completed 
              ? 'line-through text-gray-400 dark:text-gray-500' 
              : 'text-gray-600 dark:text-gray-300'
            }
          `}>
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
              >
                <Tag className="h-3 w-3 inline mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Task Metadata */}
      <div className="space-y-2 mb-4">
        {/* Priority */}
        {task.priority && (
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-gray-500" />
            <span className={`
              px-2 py-1 text-xs font-medium rounded-full
              ${priorityColors[task.priority]}
            `}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
        )}

        {/* Category */}
        {task.category && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {task.category}
            </span>
          </div>
        )}

        {/* Estimated Time */}
        {task.estimatedTime && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Est: {formatCompletionTime(task.estimatedTime)}
            </span>
          </div>
        )}

        {/* Actual Time (if completed) */}
        {task.completed && task.actualTime && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              Completed in: {formatCompletionTime(task.actualTime)}
            </span>
          </div>
        )}

        {/* Completion Time */}
        {task.completed && task.completedAt && (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400">
              Completed {formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })}
            </span>
          </div>
        )}
      </div>

      {/* Completion Button */}
      <button
        onClick={handleCompletion}
        disabled={isCompleting}
        className={`
          w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300
          flex items-center justify-center gap-2
          ${task.completed
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }
          ${isCompleting ? 'animate-pulse' : ''}
        `}
      >
        {task.completed ? (
          <>
            <CheckCircle2 className="h-5 w-5" />
            Completed
          </>
        ) : (
          <>
            <Circle className="h-5 w-5" />
            Mark Complete
          </>
        )}
      </button>

      {/* Celebration Effect */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="animate-ping">
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>
      )}

      {/* Completion Animation Overlay */}
      {isCompleting && (
        <div className="absolute inset-0 bg-green-500/20 rounded-xl flex items-center justify-center">
          <div className="animate-spin">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskCard
