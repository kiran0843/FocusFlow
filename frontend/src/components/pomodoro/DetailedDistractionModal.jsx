import React, { useState } from 'react'
import { X, Clock, AlertTriangle, Star, MapPin, Smartphone, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * DetailedDistractionModal - Comprehensive distraction logging modal
 */
const DetailedDistractionModal = ({ 
  show = false, 
  onClose = () => {}, 
  onLogDistraction = () => {},
  isLogging = false 
}) => {
  const [formData, setFormData] = useState({
    type: '',
    duration: 60,
    description: '',
    severity: 3,
    impact: 3,
    context: 'other',
    source: 'external',
    tags: []
  })

  const distractionTypes = [
    { type: 'phone', label: 'Phone', icon: '📱', color: 'text-red-400' },
    { type: 'social_media', label: 'Social Media', icon: '📲', color: 'text-blue-400' },
    { type: 'thoughts', label: 'Wandering Thoughts', icon: '🧠', color: 'text-purple-400' },
    { type: 'email', label: 'Email', icon: '📧', color: 'text-orange-400' },
    { type: 'noise', label: 'Noise', icon: '🔊', color: 'text-yellow-400' },
    { type: 'people', label: 'People', icon: '👥', color: 'text-green-400' },
    { type: 'other', label: 'Other', icon: '❓', color: 'text-gray-400' }
  ]

  const durationPresets = [
    { label: '30 seconds', value: 30 },
    { label: '1 minute', value: 60 },
    { label: '2 minutes', value: 120 },
    { label: '5 minutes', value: 300 },
    { label: '10 minutes', value: 600 }
  ]

  const contexts = [
    { value: 'home', label: 'Home', icon: '🏠' },
    { value: 'office', label: 'Office', icon: '🏢' },
    { value: 'cafe', label: 'Cafe', icon: '☕' },
    { value: 'library', label: 'Library', icon: '📚' },
    { value: 'other', label: 'Other', icon: '📍' }
  ]

  const sources = [
    { value: 'mobile', label: 'Mobile', icon: '📱' },
    { value: 'desktop', label: 'Desktop', icon: '💻' },
    { value: 'tablet', label: 'Tablet', icon: '📱' },
    { value: 'external', label: 'External', icon: '🌐' },
    { value: 'internal', label: 'Internal', icon: '🧠' }
  ]

  const commonTags = ['urgent', 'work', 'personal', 'habit', 'environmental', 'digital']

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.type) {
      return
    }

    try {
      await onLogDistraction(formData)
      onClose()
      // Reset form
      setFormData({
        type: '',
        duration: 60,
        description: '',
        severity: 3,
        impact: 3,
        context: 'other',
        source: 'external',
        tags: []
      })
    } catch (error) {
      console.error('Failed to log distraction:', error)
    }
  }

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-bold text-white">Log Distraction</h2>
          </div>
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Distraction Type */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              What distracted you? *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {distractionTypes.map(({ type, label, icon, color }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-200 text-left",
                    "hover:scale-105 active:scale-95",
                    formData.type === type
                      ? "bg-white/20 border-white/40 text-white"
                      : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              How long were you distracted?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {durationPresets.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, duration: value }))}
                  className={cn(
                    "p-2 rounded-lg border transition-all duration-200 text-center",
                    "hover:scale-105 active:scale-95",
                    formData.duration === value
                      ? "bg-white/20 border-white/40 text-white"
                      : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                  )}
                >
                  <Clock className="w-4 h-4 mx-auto mb-1" />
                  <div className="text-xs font-medium">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What happened? How did you get distracted?"
              className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 resize-none text-sm"
              rows={3}
              maxLength={500}
            />
            <div className="text-right text-white/50 text-xs mt-1">
              {formData.description.length}/500
            </div>
          </div>

          {/* Severity and Impact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Severity (1-5)
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, severity: level }))}
                    className={cn(
                      "w-8 h-8 rounded-full border transition-all duration-200",
                      "hover:scale-110 active:scale-95",
                      formData.severity >= level
                        ? "bg-yellow-400 border-yellow-400 text-black"
                        : "bg-white/10 border-white/30 text-white/50 hover:bg-white/20"
                    )}
                  >
                    <Star className="w-4 h-4 mx-auto" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Impact (1-5)
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, impact: level }))}
                    className={cn(
                      "w-8 h-8 rounded-full border transition-all duration-200",
                      "hover:scale-110 active:scale-95",
                      formData.impact >= level
                        ? "bg-red-400 border-red-400 text-white"
                        : "bg-white/10 border-white/30 text-white/50 hover:bg-white/20"
                    )}
                  >
                    <AlertTriangle className="w-4 h-4 mx-auto" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Context */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Where are you?
            </label>
            <div className="flex flex-wrap gap-2">
              {contexts.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, context: value }))}
                  className={cn(
                    "px-3 py-2 rounded-lg border transition-all duration-200",
                    "hover:scale-105 active:scale-95",
                    formData.context === value
                      ? "bg-white/20 border-white/40 text-white"
                      : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                  )}
                >
                  <span className="mr-1">{icon}</span>
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Source */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              What caused it?
            </label>
            <div className="flex flex-wrap gap-2">
              {sources.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, source: value }))}
                  className={cn(
                    "px-3 py-2 rounded-lg border transition-all duration-200",
                    "hover:scale-105 active:scale-95",
                    formData.source === value
                      ? "bg-white/20 border-white/40 text-white"
                      : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                  )}
                >
                  <span className="mr-1">{icon}</span>
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Tags (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {commonTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={cn(
                    "px-3 py-1 rounded-full border transition-all duration-200 text-sm",
                    "hover:scale-105 active:scale-95",
                    formData.tags.includes(tag)
                      ? "bg-blue-500/20 border-blue-400 text-blue-300"
                      : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-white/20">
            <Button
              type="submit"
              disabled={!formData.type || isLogging}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
            >
              {isLogging ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Logging...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Log Distraction</span>
                </div>
              )}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DetailedDistractionModal

