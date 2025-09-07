import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Play, Pause, Volume2, VolumeX, Timer, Coffee, AlertTriangle, Target, Clock, Tag, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { usePomodoro } from '@/context/PomodoroContext'
import { useAppData } from '@/context/AppDataContext';
import DistractionTracker from './DistractionTracker'
import FloatingDistractionButton from './FloatingDistractionButton'
import DetailedDistractionModal from './DetailedDistractionModal'
import CelebrationAnimation, { XPProgressBar, SessionCompleteModal } from './CelebrationAnimation'
import { audioNotification } from '@/utils/audioNotification'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

/**
 * PomodoroTimer - Main timer component with circular progress
 */
const PomodoroTimer = () => {
  // Context hooks
  const { user } = useAuth()
  const {
    activeSession,
    sessionType,
    timeLeft,
    isRunning,
    isPaused,
    distractions,
    settings,
    stats,
    loading,
    error,
    startSession,
    completeSession,
    cancelSession,
    addDistraction,
    logDistraction,
    updateTimer,
    setSessionType,
    updateSettings
  } = usePomodoro()
  const { tasks, updateTask, fetchAllData } = useAppData();
  
  // Local state
  const [isCompleting, setIsCompleting] = useState(false)
  const [xpGained, setXpGained] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [showDetailedDistractionModal, setShowDetailedDistractionModal] = useState(false)
  const [sessionRating, setSessionRating] = useState(0)
  const [sessionNotes, setSessionNotes] = useState('')
  
  // Refs
  const intervalRef = useRef(null)
  const timeLeftRef = useRef(timeLeft)

  // Timer configurations (memoized to avoid interval resets)
  const timerConfigs = useMemo(() => ({
    work: {
      duration: settings.workDuration * 60,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-500/20 to-blue-600/20',
      label: 'Work Session',
      xpReward: 25,
      icon: Timer
    },
    short_break: {
      duration: settings.shortBreakDuration * 60,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-500/20 to-green-600/20',
      label: 'Short Break',
      xpReward: 5,
      icon: Coffee
    },
    long_break: {
      duration: settings.longBreakDuration * 60,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-500/20 to-purple-600/20',
      label: 'Long Break',
      xpReward: 10,
      icon: Coffee
    }
  }), [settings.workDuration, settings.shortBreakDuration, settings.longBreakDuration])

  const currentConfig = timerConfigs[sessionType]
  const progress = activeSession ? ((currentConfig.duration - timeLeft) / currentConfig.duration) * 100 : 0
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  // Handle session completion
  const handleSessionComplete = useCallback(async () => {
    if (!activeSession) return
    
    setIsCompleting(true)
    updateTimer(0, false, false)
    
    // Play completion sound
    if (settings.soundEnabled) {
      audioNotification.playSessionComplete()
    }
    
    // Show notification
    if (settings.notificationsEnabled) {
      showNotification(
        `${currentConfig.label} Complete!`,
        sessionType === 'work' 
          ? 'Time for a break! You earned 25 XP.' 
          : 'Break time is over! Ready to get back to work?'
      )
    }
    
    // Show session completion modal
    setShowSessionModal(true)
  }, [activeSession, sessionType, settings, currentConfig, updateTimer])

  // Update ref when timeLeft changes
  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  // Timer tick
  useEffect(() => {
    if (isRunning && activeSession) {
      intervalRef.current = setInterval(() => {
        const newTimeLeft = timeLeftRef.current - 1;
        timeLeftRef.current = newTimeLeft;
        updateTimer(newTimeLeft, true, false);
        
        // Check if timer reached zero
        if (newTimeLeft <= 0) {
          handleSessionComplete();
        }
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, activeSession, updateTimer, handleSessionComplete])

  // Request notification permission
  useEffect(() => {
    if (settings.notificationsEnabled && 'Notification' in window) {
      Notification.requestPermission()
    }
  }, [settings.notificationsEnabled])

  // Show browser notification
  const showNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      })
    }
  }

  // Timer controls
  const startTimer = async (customDuration = null) => {
    try {
      if (!activeSession) {
        // Start a new session with custom duration if provided
        const duration = customDuration || currentConfig.duration / 60; // Convert to minutes
        await startSession(sessionType, duration)
      } else {
        updateTimer(timeLeft, true, false)
      }
      
      // Play start sound
      if (settings.soundEnabled) {
        audioNotification.playSessionStart()
      }
      
      toast.success(`${currentConfig.label} started!`)
    } catch (error) {
      toast.error('Failed to start session')
    }
  }

  const pauseTimer = () => {
    updateTimer(timeLeft, false, true)
    
    // Play pause sound
    if (settings.soundEnabled) {
      audioNotification.playPause()
    }
    
    toast.success('Timer paused')
  }


  const toggleTimer = () => {
    if (isRunning) {
      pauseTimer()
    } else {
      startTimer()
    }
  }

  // Handle session completion with rating and notes
  const handleSessionCompleteWithData = async () => {
    try {
      if (!activeSession) return
      
      const result = await completeSession(activeSession.id, sessionNotes, sessionRating)
      
      // Show XP celebration
      if (result.xpResult.xpGained > 0) {
        setXpGained(result.xpResult.xpGained)
        setShowCelebration(true)
        
        setTimeout(() => {
          setShowCelebration(false)
          setXpGained(0)
        }, 3000)
      }
      
      // Refresh app data to sync XP, analytics, and other data
      await fetchAllData()
      
      setShowSessionModal(false)
      setSessionRating(0)
      setSessionNotes('')
      setIsCompleting(false)
      
      // Auto-switch to next session type
      setTimeout(() => {
        if (sessionType === 'work') {
          const shouldTakeLongBreak = stats.completedSessions > 0 && stats.completedSessions % settings.longBreakInterval === 0
          setSessionType(shouldTakeLongBreak ? 'long_break' : 'short_break')
        } else {
          setSessionType('work')
        }
      }, 2000)
      
    } catch (error) {
      toast.error('Failed to complete session')
      setIsCompleting(false)
    }
  }

  // Handle distraction logging
  const handleLogDistraction = async (distractionData) => {
    try {
      await logDistraction(distractionData)
    } catch (error) {
      console.error('Failed to log distraction:', error)
      throw error
    }
  }

  // Format time display
  const formatTime = (minutes, seconds) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Get timer state styling
  const getTimerStateStyles = () => {
    if (isCompleting) {
      return {
        container: 'animate-pulse',
        circle: 'animate-spin',
        text: 'text-white animate-bounce'
      }
    }
    if (isRunning) {
      return {
        container: '',
        circle: '',
        text: 'text-white'
      }
    }
    if (isPaused) {
      return {
        container: 'opacity-75',
        circle: '',
        text: 'text-white/70'
      }
    }
    return {
      container: '',
      circle: '',
      text: 'text-white/90'
    }
  }

  const timerStyles = getTimerStateStyles()

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-pulse">
          <div className="w-80 h-80 bg-white/10 rounded-full mx-auto mb-8"></div>
          <div className="h-8 bg-white/10 rounded mb-4"></div>
          <div className="h-4 bg-white/10 rounded"></div>
        </div>
      </Card>
    )
  }

  // Show today's tasks in Pomodoro sidebar
  // AppDataContext already fetches today's tasks, so we can use them directly
  const todaysTasks = tasks || [];

  return (
    <div className="relative">
      {/* Celebration Animation */}
      <CelebrationAnimation
        show={showCelebration}
        xpGained={xpGained}
        leveledUp={false}
        newLevel={user?.level || 1}
        onComplete={() => setShowCelebration(false)}
      />

      {/* Session Complete Modal */}
      <SessionCompleteModal
        show={showSessionModal}
        sessionType={sessionType}
        xpEarned={currentConfig.xpReward}
        onRate={setSessionRating}
        onAddNotes={setSessionNotes}
        onClose={() => {
          setShowSessionModal(false)
          handleSessionCompleteWithData()
        }}
      />

      {/* Detailed Distraction Modal */}
      <DetailedDistractionModal
        show={showDetailedDistractionModal}
        onClose={() => setShowDetailedDistractionModal(false)}
        onLogDistraction={handleLogDistraction}
        isLogging={false}
      />

      {/* Floating Distraction Button */}
      <FloatingDistractionButton
        isActive={isRunning && activeSession}
        onLogDistraction={handleLogDistraction}
      />

      {/* Main Timer Card */}
      <Card className={cn(
        "relative overflow-hidden p-8 text-center",
        `bg-gradient-to-br ${currentConfig.bgColor}`,
        "border-white/20 backdrop-blur-md",
        timerStyles.container
      )}>
        {/* Session Info */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-2">
            <currentConfig.icon className="w-6 h-6 mr-2 text-white" />
            <h2 className="text-2xl font-bold text-white">
              {currentConfig.label}
            </h2>
          </div>
          <p className="text-white/70">
            {activeSession ? `Session in progress` : 'Ready to start - Click the green play button!'} • {stats.completedSessions} completed today
          </p>
        </div>

        {/* Circular Progress Timer */}
        <div className="relative w-80 h-80 mx-auto mb-8">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" className={cn(`text-transparent bg-gradient-to-r ${currentConfig.color}`)} />
                <stop offset="100%" stopColor="currentColor" className={cn(`text-transparent bg-gradient-to-r ${currentConfig.color}`)} />
              </linearGradient>
            </defs>
          </svg>

          {/* Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={cn(
              "text-6xl font-bold font-mono mb-2 transition-all duration-300",
              timerStyles.text
            )}>
              {formatTime(minutes, seconds)}
            </div>
            <div className="text-white/60 text-sm">
              {Math.round(progress)}% complete
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center mb-6">
          <Button
            onClick={toggleTimer}
            size="lg"
            className={cn(
              "w-20 h-20 rounded-full transition-all duration-300 shadow-lg",
              isRunning 
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/25" 
                : "bg-green-500 hover:bg-green-600 text-white shadow-green-500/25 hover:scale-105"
            )}
          >
            {isRunning ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-1" />
            )}
          </Button>
        </div>

        {/* Session Type Selector */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          {Object.entries(timerConfigs).map(([type, config]) => (
            <Button
              key={type}
              onClick={() => setSessionType(type)}
              variant={sessionType === type ? "default" : "outline"}
              size="sm"
              className={cn(
                "transition-all duration-300",
                sessionType === type 
                  ? `bg-gradient-to-r ${config.color} text-white` 
                  : "border-white/30 text-white hover:bg-white/10"
              )}
            >
              {config.label}
            </Button>
          ))}
        </div>

        {/* Quick Start with Task Time */}
        {todaysTasks.length > 0 && !activeSession && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h5 className="text-white/80 text-sm font-medium mb-3 text-center">Quick Start with Task</h5>
            <div className="grid grid-cols-1 gap-2">
              {todaysTasks
                .filter(task => !task.completed && task.estimatedTime)
                .slice(0, 3)
                .map(task => (
                  <button
                    key={task._id}
                    onClick={async () => {
                      try {
                        const taskMinutes = task.estimatedTime;
                        // Set session type to work and start with custom duration
                        setSessionType('work');
                        await startTimer(taskMinutes);
                        toast.success(`Started ${taskMinutes}-minute session for "${task.title}"`);
                      } catch (error) {
                        toast.error('Failed to start session');
                      }
                    }}
                    className="p-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 hover:scale-105 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">{task.title}</div>
                        <div className="text-white/60 text-xs">{task.estimatedTime} minutes</div>
                      </div>
                      <div className="flex items-center gap-1 text-white/60">
                        <Timer className="w-4 h-4" />
                        <span className="text-xs">Start</span>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Distraction Tracker */}
        {activeSession && (
          <DistractionTracker
            sessionId={activeSession.id}
            onAddDistraction={(sessionId, type, note, duration = 30) => logDistraction({ type, description: note, duration })}
            distractions={distractions}
            isActive={isRunning}
            timeLeft={timeLeft}
            sessionDuration={activeSession.duration * 60} // Convert minutes to seconds
            onPauseTimer={() => updateTimer(timeLeft, false, true)}
            onResumeTimer={() => updateTimer(timeLeft, true, false)}
            className="mb-6"
          />
        )}


        {/* Today's Progress Summary */}
        {todaysTasks.length > 0 && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h5 className="text-white/80 text-sm font-medium mb-3 text-center">Today's Progress</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Tasks Completed</span>
                <span className="text-white">
                  {todaysTasks.filter(t => t.completed).length} / {todaysTasks.length}
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                  style={{ 
                    width: `${(todaysTasks.filter(t => t.completed).length / todaysTasks.length) * 100}%` 
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Estimated Time: {todaysTasks.reduce((acc, task) => acc + (task.estimatedTime || 0), 0)}m</span>
                <span>Completed: {todaysTasks.filter(t => t.completed).reduce((acc, task) => acc + (task.estimatedTime || 0), 0)}m</span>
              </div>
            </div>
          </div>
        )}


        {/* Today's Tasks */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Today's Tasks
          </h4>
          {todaysTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-white/50" />
              </div>
              <p className="text-white/60 text-sm">No tasks for today</p>
              <p className="text-white/40 text-xs mt-1">Add tasks to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysTasks.map((task, index) => (
                <div
                  key={task._id}
                  className={cn(
                    "p-4 rounded-xl border transition-all duration-300 hover:scale-105",
                    "bg-white/10 backdrop-blur-md border-white/20",
                    task.completed && "opacity-60 scale-95"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          task.completed ? "bg-green-400" : "bg-white/30"
                        )} />
                        <h5 className={cn(
                          "font-medium text-sm",
                          task.completed ? "line-through text-white/60" : "text-white"
                        )}>
                          {task.title}
                        </h5>
                        {task.priority && (
                          <span className={cn(
                            "px-2 py-0.5 text-xs rounded-full",
                            task.priority === 'high' && "bg-red-500/20 text-red-300",
                            task.priority === 'medium' && "bg-yellow-500/20 text-yellow-300",
                            task.priority === 'low' && "bg-green-500/20 text-green-300"
                          )}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-white/70 text-xs mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        {task.estimatedTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{task.estimatedTime}m</span>
                          </div>
                        )}
                        {task.category && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            <span>{task.category}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.estimatedTime && (
                        <button
                          onClick={async () => {
                            try {
                              const taskMinutes = task.estimatedTime;
                              // Set session type to work and start with custom duration
                              setSessionType('work');
                              await startTimer(taskMinutes);
                              toast.success(`Started ${taskMinutes}-minute session for "${task.title}"`);
                            } catch (error) {
                              toast.error('Failed to start session');
                            }
                          }}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                          title={`Start ${task.estimatedTime}-minute session for this task`}
                        >
                          <Timer className="w-4 h-4 text-white" />
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          try {
                            // Use the updateTask function from AppDataContext
                            await updateTask(task._id, { completed: !task.completed });
                            toast.success(task.completed ? 'Task marked incomplete' : 'Task completed!');
                          } catch (error) {
                            console.error('Task update error:', error);
                            toast.error('Failed to update task');
                          }
                        }}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          task.completed 
                            ? "bg-green-500/20 hover:bg-green-500/30 text-green-300"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        )}
                        title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

    </div>
  )
}

export default PomodoroTimer
