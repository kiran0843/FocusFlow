import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Save, Calendar, Flag, Tag, Clock, FileText } from 'lucide-react'
import { format } from 'date-fns'

/**
 * Modal for adding/editing tasks with comprehensive form validation
 */
const TaskModal = ({ task, selectedDate, onSave, onClose }) => {
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      estimatedTime: '',
      taskDate: format(selectedDate, 'yyyy-MM-dd')
    }
  })

  // Initialize form with task data if editing
  useEffect(() => {
    if (task) {
      reset({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        category: task.category || '',
        estimatedTime: task.estimatedTime || '',
        taskDate: format(new Date(task.taskDate), 'yyyy-MM-dd')
      })
      setTags(task.tags || [])
    }
  }, [task, reset])

  // Handle tag addition
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  // Handle tag removal
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const taskData = {
        ...data,
        tags,
        estimatedTime: data.estimatedTime ? parseInt(data.estimatedTime) : undefined
      }
      await onSave(taskData)
    } catch (error) {
      console.error('Error saving task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle key press for tag input
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {task ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {format(selectedDate, 'EEEE, MMM d, yyyy')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Title *
            </label>
            <input
              {...register('title', {
                required: 'Title is required',
                minLength: {
                  value: 1,
                  message: 'Title must be at least 1 character'
                },
                maxLength: {
                  value: 100,
                  message: 'Title cannot exceed 100 characters'
                }
              })}
              type="text"
              className={`
                w-full px-4 py-3 bg-white/20 border rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500
                transition-colors
                ${errors.title 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-white/30 focus:border-blue-500'
                }
                text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
              `}
              placeholder="Enter task title..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              {...register('description', {
                maxLength: {
                  value: 500,
                  message: 'Description cannot exceed 500 characters'
                }
              })}
              rows={3}
              className={`
                w-full px-4 py-3 bg-white/20 border rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500
                transition-colors resize-none
                ${errors.description 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-white/30 focus:border-blue-500'
                }
                text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
              `}
              placeholder="Enter task description (optional)..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Priority and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Flag className="h-4 w-4 inline mr-1" />
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="h-4 w-4 inline mr-1" />
                Category
              </label>
              <input
                {...register('category', {
                  maxLength: {
                    value: 50,
                    message: 'Category cannot exceed 50 characters'
                  }
                })}
                type="text"
                className={`
                  w-full px-4 py-3 bg-white/20 border rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition-colors
                  ${errors.category 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-white/30 focus:border-blue-500'
                  }
                  text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                `}
                placeholder="e.g., Work, Personal, Health"
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Estimated Time (minutes)
            </label>
            <input
              {...register('estimatedTime', {
                min: {
                  value: 1,
                  message: 'Estimated time must be at least 1 minute'
                },
                max: {
                  value: 480,
                  message: 'Estimated time cannot exceed 8 hours (480 minutes)'
                },
                pattern: {
                  value: /^\d+$/,
                  message: 'Please enter a valid number'
                }
              })}
              type="number"
              min="1"
              max="480"
              className={`
                w-full px-4 py-3 bg-white/20 border rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500
                transition-colors
                ${errors.estimatedTime 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-white/30 focus:border-blue-500'
                }
                text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
              `}
              placeholder="e.g., 30 (for 30 minutes)"
            />
            {errors.estimatedTime && (
              <p className="mt-1 text-sm text-red-500">{errors.estimatedTime.message}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag className="h-4 w-4 inline mr-1" />
              Tags ({tags.length}/5)
            </label>
            
            {/* Tag Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                maxLength={20}
                className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!newTag.trim() || tags.includes(newTag.trim()) || tags.length >= 5}
                className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
              >
                Add
              </button>
            </div>

            {/* Tag List */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Task Date (only show if creating new task) */}
          {!task && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Task Date
              </label>
              <input
                {...register('taskDate', {
                  required: 'Task date is required'
                })}
                type="date"
                min={format(new Date(), 'yyyy-MM-dd')}
                className={`
                  w-full px-4 py-3 bg-white/20 border rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition-colors
                  ${errors.taskDate 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-white/30 focus:border-blue-500'
                  }
                  text-gray-900 dark:text-white
                `}
              />
              {errors.taskDate && (
                <p className="mt-1 text-sm text-red-500">{errors.taskDate.message}</p>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {task ? 'Update Task' : 'Create Task'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal

