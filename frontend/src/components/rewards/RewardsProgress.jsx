import React from 'react'
import { 
  Trophy, 
  Target, 
  Calendar, 
  Zap, 
  TrendingUp,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react'
import { useAppData } from '@/context/AppDataContext'
import { cn } from '@/lib/utils'

/**
 * Component to display user's progress towards rewards and goals
 */
const RewardsProgress = ({ className = '' }) => {
  const { rewards } = useAppData()
  
  if (!rewards) {
    return (
      <div className={cn("glass-card p-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const {
    currentStreak,
    nextStreakMilestone,
    streakProgress,
    completedTasks,
    completedSessions,
    currentGoal,
    weeklyProgress,
    lastStreakReward,
    lastWeeklyReward
  } = rewards

  return (
    <div className={cn("glass-card p-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Trophy className="h-6 w-6 text-yellow-400" />
        <h3 className="text-xl font-semibold text-white">Rewards & Goals</h3>
      </div>

      {/* Streak Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            <span className="text-white font-medium">Daily Streak</span>
          </div>
          <span className="text-blue-400 font-semibold">{currentStreak} days</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/70">
            <span>Next milestone: {nextStreakMilestone} days</span>
            <span>{Math.round(streakProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${streakProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Weekly Goal Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-400" />
            <span className="text-white font-medium">Weekly Goal</span>
          </div>
          <span className="text-green-400 font-semibold">{currentGoal}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/70">
            <span>Tasks: {completedTasks} | Sessions: {completedSessions}</span>
            <span>{Math.round(weeklyProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Rewards */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-purple-400" />
          <span className="text-white font-medium">Recent Rewards</span>
        </div>
        
        <div className="space-y-2">
          {lastStreakReward > 0 && (
            <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-purple-400" />
                <span className="text-white text-sm">Streak Milestone</span>
              </div>
              <span className="text-purple-400 font-semibold">+{lastStreakReward} XP</span>
            </div>
          )}
          
          {lastWeeklyReward > 0 && (
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-400" />
                <span className="text-white text-sm">Weekly Goal</span>
              </div>
              <span className="text-green-400 font-semibold">+{lastWeeklyReward} XP</span>
            </div>
          )}
          
          {lastStreakReward === 0 && lastWeeklyReward === 0 && (
            <div className="text-center py-4">
              <Clock className="h-8 w-8 text-white/30 mx-auto mb-2" />
              <p className="text-white/60 text-sm">Complete tasks and sessions to earn rewards!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{currentStreak}</div>
          <div className="text-xs text-white/60">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{completedTasks + completedSessions}</div>
          <div className="text-xs text-white/60">This Week</div>
        </div>
      </div>
    </div>
  )
}

export default RewardsProgress

