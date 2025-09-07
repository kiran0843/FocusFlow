import React from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { format } from 'date-fns'

/**
 * Confirmation dialog for task deletion
 */
const DeleteConfirmDialog = ({ task, onConfirm, onCancel }) => {
  if (!task) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-white/20">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Task
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This action cannot be undone
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Are you sure you want to delete this task?
            </p>
            
            {/* Task Preview */}
            <div className="bg-white/10 dark:bg-gray-800/50 rounded-lg p-4 border border-white/20">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {task.title}
              </h4>
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Date: {format(new Date(task.taskDate), 'MMM d, yyyy')}</span>
                {task.priority && (
                  <span className="capitalize">Priority: {task.priority}</span>
                )}
                {task.completed && (
                  <span className="text-green-500">Completed</span>
                )}
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-red-700 dark:text-red-300 font-medium">
                  Warning
                </p>
                <p className="text-red-600 dark:text-red-400">
                  Deleting this task will permanently remove it from your taskboard. 
                  Any progress or time tracking data will be lost.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmDialog

