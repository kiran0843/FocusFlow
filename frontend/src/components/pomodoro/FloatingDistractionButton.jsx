import React, { useState, useEffect, useRef } from 'react'
import { AlertTriangle, X, Clock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

/**
 * FloatingDistractionButton - Quick distraction logging during Pomodoro sessions
 */
const FloatingDistractionButton = ({ 
  isActive = false, 
  onLogDistraction = () => {},
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLogging, setIsLogging] = useState(false)
  const buttonRef = useRef(null)
  const timeoutRef = useRef(null)

  // Show button when Pomodoro is active
  useEffect(() => {
    if (isActive) {
      // Delay showing the button to avoid immediate distraction
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true)
      }, 5000) // Show after 5 seconds
    } else {
      setIsVisible(false)
      setIsExpanded(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isActive])

  // Quick distraction types with icons and colors
  const distractionTypes = [
    {
      type: 'phone',
      label: 'Phone',
      icon: '📱',
      color: 'from-red-500 to-red-600',
      bgColor: 'from-red-500/20 to-red-600/20',
      preset: 60
    },
    {
      type: 'social_media',
      label: 'Social',
      icon: '📲',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-500/20 to-blue-600/20',
      preset: 120
    },
    {
      type: 'thoughts',
      label: 'Thoughts',
      icon: '🧠',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-500/20 to-purple-600/20',
      preset: 30
    },
    {
      type: 'email',
      label: 'Email',
      icon: '📧',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-500/20 to-orange-600/20',
      preset: 90
    },
    {
      type: 'noise',
      label: 'Noise',
      icon: '🔊',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'from-yellow-500/20 to-yellow-600/20',
      preset: 45
    },
    {
      type: 'people',
      label: 'People',
      icon: '👥',
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-500/20 to-green-600/20',
      preset: 180
    }
  ]

  // Duration presets
  const durationPresets = [
    { label: '30s', value: 30 },
    { label: '1m', value: 60 },
    { label: '2m', value: 120 },
    { label: '5m', value: 300 }
  ]

  const handleQuickLog = async (type, duration) => {
    setIsLogging(true)
    
    try {
      await onLogDistraction({
        type,
        duration,
        severity: 3,
        impact: 3,
        context: 'other',
        source: 'external'
      })
      
      toast.success('Distraction logged!', {
        duration: 2000,
        icon: '⚠️'
      })
      
      // Collapse after logging
      setIsExpanded(false)
      
      // Hide button temporarily to avoid immediate re-distraction
      setIsVisible(false)
      setTimeout(() => {
        if (isActive) {
          setIsVisible(true)
        }
      }, 10000) // Hide for 10 seconds
      
    } catch (error) {
      toast.error('Failed to log distraction')
    } finally {
      setIsLogging(false)
    }
  }

  const handleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  if (!isVisible) return null

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Main floating button */}
      <div className="relative">
        <Button
          ref={buttonRef}
          onClick={handleExpand}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
            "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
            "hover:scale-110 active:scale-95",
            "border-2 border-white/20 backdrop-blur-sm",
            isExpanded && "rotate-45"
          )}
          disabled={isLogging}
        >
          <AlertTriangle className="w-6 h-6 text-white" />
        </Button>

        {/* Expanded distraction options */}
        {isExpanded && (
          <div className="absolute bottom-16 right-0 mb-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-xl min-w-80">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">Quick Log Distraction</h3>
                <Button
                  onClick={() => setIsExpanded(false)}
                  size="sm"
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/10 w-6 h-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Distraction types */}
              <div className="space-y-3">
                <div className="text-white/80 text-xs font-medium mb-2">What distracted you?</div>
                <div className="grid grid-cols-2 gap-2">
                  {distractionTypes.map(({ type, label, icon, color, bgColor, preset }) => (
                    <Button
                      key={type}
                      onClick={() => handleQuickLog(type, preset)}
                      disabled={isLogging}
                      className={cn(
                        "h-12 text-xs font-medium transition-all duration-200",
                        "hover:scale-105 active:scale-95",
                        `bg-gradient-to-r ${bgColor} border border-white/20 text-white`,
                        "hover:shadow-md"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{icon}</span>
                        <span>{label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom duration section */}
              <div className="mt-4 pt-3 border-t border-white/20">
                <div className="text-white/80 text-xs font-medium mb-2">Custom Duration</div>
                <div className="flex space-x-2">
                  {durationPresets.map(({ label, value }) => (
                    <Button
                      key={value}
                      onClick={() => handleQuickLog('other', value)}
                      disabled={isLogging}
                      size="sm"
                      variant="outline"
                      className="text-white border-white/30 hover:bg-white/10 text-xs"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quick tip */}
              <div className="mt-3 pt-2 border-t border-white/20">
                <div className="flex items-center text-white/60 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  <span>Timer keeps running - log and get back to focus!</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pulse animation when expanded */}
      {isExpanded && (
        <div className="absolute inset-0 rounded-full bg-orange-500/30 animate-ping pointer-events-none" />
      )}
    </div>
  )
}

export default FloatingDistractionButton

