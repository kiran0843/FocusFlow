import React, { useState } from 'react'
import { Phone, MessageSquare, Brain, MoreHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

/**
 * DistractionTracker - Component for logging distractions during Pomodoro sessions
 */
const DistractionTracker = ({ 
  sessionId, 
  onAddDistraction, 
  distractions = [], 
  isActive = false,
  className = '',
  timeLeft = 0,
  onPauseTimer = null,
  onResumeTimer = null,
  sessionDuration = 25 * 60 // Default 25 minutes in seconds
}) => {
  const [showTracker, setShowTracker] = useState(false)
  const [customNote, setCustomNote] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [customDuration, setCustomDuration] = useState(30)

  // Calculate real-time focus progress
  const calculateFocusProgress = () => {
    if (!isActive || sessionDuration === 0) return 0
    
    // Calculate how much time has passed
    const timePassed = sessionDuration - timeLeft
    const timePassedPercentage = (timePassed / sessionDuration) * 100
    
    // Calculate distraction penalty (each distraction reduces focus by 5%)
    const distractionPenalty = distractions.length * 5
    
    // Calculate focus score: time progress minus distraction penalty
    const focusScore = Math.max(0, timePassedPercentage - distractionPenalty)
    
    return Math.min(100, Math.round(focusScore))
  }

  const focusProgress = calculateFocusProgress()
  const estimatedTimeLost = distractions.length * 2 // 2 minutes per distraction

  const distractionTypes = [
    {
      type: 'phone',
      label: 'Phone',
      icon: Phone,
      color: 'from-red-500 to-red-600',
      description: 'Phone notifications or calls'
    },
    {
      type: 'social_media',
      label: 'Social Media',
      icon: MessageSquare,
      color: 'from-blue-500 to-blue-600',
      description: 'Social media browsing'
    },
    {
      type: 'thoughts',
      label: 'Wandering Thoughts',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      description: 'Mental distractions'
    },
    {
      type: 'other',
      label: 'Other',
      icon: MoreHorizontal,
      color: 'from-gray-500 to-gray-600',
      description: 'Other distractions'
    }
  ]

  const handleDistraction = async (type, note = '', duration = 30) => {
    if (!sessionId || !isActive) {
      toast.error('No active session to log distraction')
      return
    }

    try {
      // Pause timer when logging distraction
      if (onPauseTimer) {
        onPauseTimer()
      }
      
      await onAddDistraction(sessionId, type, note, duration)
      
      // Show distraction impact message
      const impactMessages = {
        phone: 'Phone distraction logged. Consider putting it in another room!',
        social_media: 'Social media break logged. Stay focused!',
        thoughts: 'Wandering thoughts noted. Try a quick breathing exercise.',
        other: 'Distraction logged. Get back to your task!'
      }
      
      toast.success(impactMessages[type] || 'Distraction logged successfully')
      
      setShowTracker(false)
      setCustomNote('')
      setSelectedType('')
      setCustomDuration(30)
      
      // Resume timer after a very short delay
      setTimeout(() => {
        if (onResumeTimer) {
          onResumeTimer()
        }
      }, 500)
      
    } catch (error) {
      toast.error('Failed to log distraction')
      // Resume timer even if logging failed
      if (onResumeTimer) {
        onResumeTimer()
      }
    }
  }

  const handleQuickDistraction = async (type) => {
    if (!sessionId || !isActive) {
      toast.error('No active session to log distraction')
      return
    }

    try {
      // Pause timer when logging distraction
      if (onPauseTimer) {
        onPauseTimer()
      }
      
      await onAddDistraction(sessionId, type, '', 30)
      
      // Show quick success message
      toast.success('Distraction logged!')
      
      // Resume timer immediately for quick distractions
      setTimeout(() => {
        if (onResumeTimer) {
          onResumeTimer()
        }
      }, 200)
      
    } catch (error) {
      toast.error('Failed to log distraction')
      // Resume timer even if logging failed
      if (onResumeTimer) {
        onResumeTimer()
      }
    }
  }

  const handleCustomDistraction = () => {
    if (!selectedType) {
      toast.error('Please select a distraction type')
      return
    }
    handleDistraction(selectedType, customNote, customDuration)
  }

  if (!isActive) return null

  return (
    <div className={cn("relative", className)}>
      {/* Quick Distraction Buttons */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        <span className="text-white/70 text-sm mr-2">Quick log:</span>
        {distractionTypes.map(({ type, label, icon: Icon, color }) => (
          <Button
            key={type}
            onClick={() => handleQuickDistraction(type)}
            size="sm"
            variant="outline"
            className={cn(
              "border-white/30 text-white hover:bg-white/10 transition-all duration-200",
              "hover:scale-105"
            )}
            title={`Log ${label.toLowerCase()} distraction`}
          >
            <Icon className="w-4 h-4 mr-1" />
            {label}
          </Button>
        ))}
        
        <Button
          onClick={() => setShowTracker(!showTracker)}
          size="sm"
          variant="outline"
          className="border-white/30 text-white hover:bg-white/10"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Detailed Distraction Tracker Modal */}
      {showTracker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-white font-semibold text-lg">Log Distraction</h4>
              <Button
                onClick={() => setShowTracker(false)}
                size="sm"
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Distraction Type Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {distractionTypes.map(({ type, label, icon: Icon, color, description }) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "p-4 rounded-xl border transition-all duration-200",
                    "text-left hover:scale-105 group",
                    selectedType === type
                      ? `bg-gradient-to-r ${color} text-white border-transparent shadow-lg`
                      : "bg-white/5 border-white/30 text-white hover:bg-white/10 hover:border-white/40"
                  )}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold text-sm">{label}</span>
                  </div>
                  <p className="text-xs opacity-75 leading-relaxed">{description}</p>
                </button>
              ))}
            </div>

            {/* Custom Duration */}
            <div className="mb-6">
              <label className="block text-white/80 text-sm font-medium mb-3">
                Duration (seconds)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="3600"
                  className="flex-1 p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 text-base font-medium"
                  placeholder="30"
                />
                <span className="text-white/60 text-sm font-medium">seconds</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {[30, 60, 120, 300, 600].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCustomDuration(preset)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200",
                      customDuration === preset
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    )}
                  >
                    {preset < 60 ? `${preset}s` : `${preset / 60}m`}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Note */}
            <div className="mb-6">
              <label className="block text-white/80 text-sm font-medium mb-3">
                Additional notes (optional)
              </label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="What distracted you?"
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 resize-none text-sm font-medium"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                onClick={handleCustomDistraction}
                disabled={!selectedType}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Log Distraction
              </Button>
              <Button
                onClick={() => setShowTracker(false)}
                variant="outline"
                className="px-6 py-3 border-white/30 text-white hover:bg-white/10 rounded-xl font-semibold transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Session Impact Indicator - Always show when session is active */}
      {isActive && (
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm font-medium">Session Impact</span>
            <span className="text-white/60 text-xs">
              {distractions.length} distraction{distractions.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Real-time Focus Progress */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-300 ease-out",
                  focusProgress >= 80 && "bg-gradient-to-r from-green-400 to-green-500",
                  focusProgress >= 60 && focusProgress < 80 && "bg-gradient-to-r from-yellow-400 to-yellow-500",
                  focusProgress >= 40 && focusProgress < 60 && "bg-gradient-to-r from-orange-400 to-orange-500",
                  focusProgress < 40 && "bg-gradient-to-r from-red-400 to-red-500"
                )}
                style={{ 
                  width: `${focusProgress}%` 
                }}
              />
            </div>
            <span className="text-white/70 text-xs">
              {focusProgress}% Focus
            </span>
          </div>
          
          {/* Time Impact */}
          <div className="text-center">
            <span className="text-white/60 text-xs">
              Estimated time lost: {estimatedTimeLost} minutes
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * DistractionStats - Shows distraction statistics
 */
export const DistractionStats = ({ distractions = [] }) => {
  if (distractions.length === 0) return null

  const distractionCounts = distractions.reduce((acc, distraction) => {
    acc[distraction.type] = (acc[distraction.type] || 0) + 1
    return acc
  }, {})

  const distractionTypes = {
    phone: { label: 'Phone', color: 'text-red-400' },
    social_media: { label: 'Social Media', color: 'text-blue-400' },
    thoughts: { label: 'Thoughts', color: 'text-purple-400' },
    other: { label: 'Other', color: 'text-gray-400' }
  }

  return (
    <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
      <h5 className="text-white/80 text-sm font-medium mb-2">Distraction Breakdown</h5>
      <div className="space-y-1">
        {Object.entries(distractionCounts).map(([type, count]) => (
          <div key={type} className="flex justify-between items-center text-sm">
            <span className={cn("font-medium", distractionTypes[type]?.color || 'text-white/70')}>
              {distractionTypes[type]?.label || type}
            </span>
            <span className="text-white/60">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DistractionTracker

