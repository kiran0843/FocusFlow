import React from 'react'
import { CheckCircle2, Target, TrendingUp } from 'lucide-react'

/**
 * Progress indicator component showing task completion status
 */
const ProgressIndicator = ({ completed, total, percentage, maxTasks = 3 }) => {
  // Calculate progress bar width
  const progressWidth = total > 0 ? (completed / total) * 100 : 0

  // Get progress color based on completion percentage
  const getProgressColor = (percentage) => {
    if (percentage === 100) return 'from-green-500 to-emerald-600'
    if (percentage >= 66) return 'from-blue-500 to-blue-600'
    if (percentage >= 33) return 'from-yellow-500 to-orange-500'
    return 'from-gray-400 to-gray-500'
  }

  // Get progress text color
  const getTextColor = (percentage) => {
    if (percentage === 100) return 'text-green-600 dark:text-green-400'
    if (percentage >= 66) return 'text-blue-600 dark:text-blue-400'
    if (percentage >= 33) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  // Get motivational message
  const getMotivationalMessage = (percentage, completed, total) => {
    if (total === 0) return "Ready to start your day? Add your first task!"
    if (percentage === 100) return "🎉 Perfect! All tasks completed!"
    if (percentage >= 66) return "Great progress! Almost there!"
    if (percentage >= 33) return "Good start! Keep going!"
    return "Let's get started! You've got this!"
  }

  return (
    <div className="space-y-4">
      {/* Progress Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Completion Count */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Completed</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {completed}/{total}
              </p>
            </div>
          </div>

          {/* Total Tasks */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Tasks</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {total}/{maxTasks}
              </p>
            </div>
          </div>

          {/* Completion Percentage */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Progress</p>
              <p className={`text-xl font-bold ${getTextColor(percentage)}`}>
                {percentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {getMotivationalMessage(percentage, completed, total)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">Progress</span>
          <span className={`font-semibold ${getTextColor(percentage)}`}>
            {completed} of {total} tasks completed
          </span>
        </div>
        
        <div className="relative">
          {/* Background Bar */}
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            {/* Progress Fill */}
            <div
              className={`
                h-full bg-gradient-to-r ${getProgressColor(percentage)} 
                transition-all duration-500 ease-out
                relative overflow-hidden
              `}
              style={{ width: `${progressWidth}%` }}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-between mt-2">
            {Array.from({ length: maxTasks }, (_, index) => (
              <div
                key={index}
                className={`
                  w-3 h-3 rounded-full border-2 transition-all duration-300
                  ${index < total
                    ? index < completed
                      ? 'bg-green-500 border-green-500'
                      : 'bg-white dark:bg-gray-800 border-gray-400'
                    : 'bg-transparent border-gray-300 dark:border-gray-600'
                  }
                `}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      {total > 0 && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
          {/* Remaining Tasks */}
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">
              {total - completed}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Remaining
            </p>
          </div>

          {/* Available Slots */}
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">
              {maxTasks - total}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Available
            </p>
          </div>
        </div>
      )}

      {/* Completion Streak (if all tasks completed) */}
      {percentage === 100 && total > 0 && (
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-green-700 dark:text-green-300">
                Day Complete! 🎉
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                You've completed all your tasks for today. Great job!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Encouragement for empty state */}
      {total === 0 && (
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-blue-700 dark:text-blue-300">
                Ready to be productive?
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Add up to 3 tasks to start your focused day!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgressIndicator

