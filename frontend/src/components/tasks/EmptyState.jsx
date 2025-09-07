import React from 'react'
import { Plus, Target, Calendar, Sparkles, ArrowRight } from 'lucide-react'
import { format, isToday, isYesterday, isTomorrow } from 'date-fns'

/**
 * Empty state component when no tasks are present
 */
const EmptyState = ({ selectedDate, onAddTask, canAddTask }) => {
  // Defensive: ensure selectedDate is a valid Date
  const safeDate = selectedDate instanceof Date && !isNaN(selectedDate) ? selectedDate : new Date();

  // Get date-specific messaging
  const getDateMessage = () => {
    if (isToday(safeDate)) return "today"
    if (isYesterday(safeDate)) return "yesterday"
    if (isTomorrow(safeDate)) return "tomorrow"
    return format(safeDate, 'EEEE')
  }

  const getMotivationalMessage = () => {
    const messages = [
      "The secret of getting ahead is getting started.",
      "The best way to predict the future is to create it.",
      "Don't watch the clock; do what it does. Keep going.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getSuggestions = () => {
    return [
      "Start with your most important task.",
      "Break down large tasks into smaller steps.",
      "Use the Pomodoro Technique for focused work.",
      "Celebrate small wins!",
    ];
  };

  return (
    <div className="glass-card p-12 text-center">
      {/* Main Illustration */}
      <div className="mb-8">
        <div className="relative mx-auto w-32 h-32 mb-6">
          {/* Background Circle */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full"></div>
          {/* Target Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
              <Target className="h-12 w-12 text-white" />
            </div>
          </div>
          {/* Floating Elements */}
          <div className="absolute -top-2 -right-2 animate-bounce">
            <div className="p-2 bg-yellow-400 rounded-full shadow-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-2 -left-2 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <div className="p-2 bg-green-400 rounded-full shadow-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
        {/* Main Message */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          No tasks for {getDateMessage()}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          {getMotivationalMessage()}
        </p>
      </div>

      {/* Action Button */}
      {canAddTask && (
        <div className="mb-8">
          <button
            onClick={onAddTask}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <span>Add Your First Task</span>
              <ArrowRight className="h-5 w-5" />
            </div>
          </button>
        </div>
      )}

      {/* Suggestions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Tips:
        </h3>
        <div className="space-y-2 max-w-sm mx-auto">
          {getSuggestions().map((suggestion, index) => (
            <div
              key={index}
              className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Help */}
      <div className="mt-8 pt-6 border-t border-white/20">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Need help getting started? Check out our{' '}
          <button className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline">
            productivity guide
          </button>
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
