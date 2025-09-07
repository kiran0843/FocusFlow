import React, { useState, useEffect } from 'react'
import PomodoroTimer from '@/components/pomodoro/PomodoroTimer'
import DistractionPatterns from '@/components/pomodoro/DistractionPatterns'
import { XPProgressBar } from '@/components/pomodoro/CelebrationAnimation'
import { Card } from '@/components/ui/card'
import { BarChart3, Clock, Target, Zap, CheckCircle, Coffee, Timer } from 'lucide-react'
import { usePomodoro } from '@/context/PomodoroContext'
import { useAppData } from '@/context/AppDataContext'

/**
 * PomodoroPage - Main page for Pomodoro timer functionality
 */
const PomodoroPage = () => {
  const { distractions, stats, getSessionHistory, history } = usePomodoro()
  const { user, analytics } = useAppData()
  const [recentSessions, setRecentSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  
  // Calculate today's progress
  const todaysProgress = {
    sessionsCompleted: stats?.completedSessions || 0,
    xpEarned: user?.xp || 0,
    focusTime: Math.round((stats?.totalDuration || 0) / 60), // Convert to minutes
    distractions: distractions?.length || 0
  }

  // Load recent sessions
  const loadRecentSessions = async () => {
    setLoadingSessions(true)
    try {
      const sessions = await getSessionHistory(null, null, 5) // Get last 5 sessions
      setRecentSessions(sessions || [])
    } catch (error) {
      console.error('Failed to load recent sessions:', error)
    } finally {
      setLoadingSessions(false)
    }
  }

  useEffect(() => {
    loadRecentSessions()
  }, [getSessionHistory])

  // Refresh sessions when stats change (new session completed)
  useEffect(() => {
    if (stats?.completedSessions > 0) {
      loadRecentSessions()
    }
  }, [stats?.completedSessions])

  // Format session time
  const formatSessionTime = (date) => {
    const now = new Date()
    const sessionDate = new Date(date)
    const diffInHours = (now - sessionDate) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60)
      return `${minutes}m ago`
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours)
      return `${hours}h ago`
    } else {
      return sessionDate.toLocaleDateString()
    }
  }

  // Get session type icon and color
  const getSessionTypeInfo = (sessionType) => {
    switch (sessionType) {
      case 'work':
        return { icon: Timer, color: 'text-blue-400', bgColor: 'bg-blue-500/20' }
      case 'short_break':
        return { icon: Coffee, color: 'text-green-400', bgColor: 'bg-green-500/20' }
      case 'long_break':
        return { icon: Coffee, color: 'text-purple-400', bgColor: 'bg-purple-500/20' }
      default:
        return { icon: Timer, color: 'text-gray-400', bgColor: 'bg-gray-500/20' }
    }
  }
  
  return (
      <div className="min-h-screen bg-gradient-to-br from-focus-50 to-focus-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Pomodoro Timer
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Focus on your work with timed sessions and earn XP rewards
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Timer */}
            <div className="lg:col-span-2">
              <PomodoroTimer />
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              {/* Today's Stats */}
              <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Today's Progress
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Sessions Completed</span>
                    <span className="text-white font-semibold">{todaysProgress.sessionsCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">XP Earned</span>
                    <span className="text-white font-semibold">{todaysProgress.xpEarned}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Focus Time</span>
                    <span className="text-white font-semibold">{todaysProgress.focusTime}m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Distractions</span>
                    <span className="text-white font-semibold">{todaysProgress.distractions}</span>
                  </div>
                </div>
              </Card>

              {/* XP Progress */}
              <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Level Progress
                </h3>
                <XPProgressBar 
                  currentXP={user?.xp || 0} 
                  level={user?.level || 1}
                />
              </Card>

              {/* Quick Tips */}
              <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Focus Tips
                </h3>
                <div className="space-y-3 text-sm text-white/70">
                  <div className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 mt-0.5 text-blue-400" />
                    <span>Work in 25-minute focused sessions</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Zap className="w-4 h-4 mt-0.5 text-yellow-400" />
                    <span>Earn 25 XP for each completed session</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Target className="w-4 h-4 mt-0.5 text-green-400" />
                    <span>Take breaks to maintain productivity</span>
                  </div>
                </div>
              </Card>

              {/* Session History */}
              <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Recent Sessions
                </h3>
                <div className="space-y-3">
                  {loadingSessions ? (
                    <div className="text-center text-white/50 py-4">
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-white/20 rounded w-3/4 mx-auto"></div>
                        <div className="h-4 bg-white/20 rounded w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  ) : recentSessions.length === 0 ? (
                    <div className="text-center text-white/50 py-4">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-white/30" />
                      <p>No sessions completed yet</p>
                      <p className="text-sm text-white/40 mt-1">Start your first session!</p>
                    </div>
                  ) : (
                    recentSessions.map((session, index) => {
                      const typeInfo = getSessionTypeInfo(session.sessionType)
                      const Icon = typeInfo.icon
                      const actualDuration = session.endTime && session.startTime 
                        ? Math.round((new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60))
                        : session.duration
                      
                      return (
                        <div
                          key={session._id || index}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 ${typeInfo.bgColor} rounded-lg flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 ${typeInfo.color}`} />
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium capitalize">
                                {session.sessionType.replace('_', ' ')} Session
                              </div>
                              <div className="text-white/60 text-xs">
                                {actualDuration} min • {formatSessionTime(session.startTime)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {session.completed && (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                            {session.xpEarned > 0 && (
                              <div className="flex items-center space-x-1 text-yellow-400">
                                <Zap className="w-3 h-3" />
                                <span className="text-xs font-medium">+{session.xpEarned}</span>
                              </div>
                            )}
                            {session.rating && (
                              <div className="flex items-center space-x-1 text-yellow-400">
                                <span className="text-xs">★</span>
                                <span className="text-xs">{session.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </Card>

              {/* Distraction Patterns */}
              <DistractionPatterns
                distractions={distractions}
                className="mt-6"
              />
            </div>
          </div>
        </div>
      </div>
  )
}

export default PomodoroPage
