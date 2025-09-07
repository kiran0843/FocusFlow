import React, { useCallback, useState, useEffect } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { usePomodoro } from '@/context/PomodoroContext';
import { toast } from 'react-hot-toast';
import { 
  Trophy, 
  Zap, 
  Target, 
  Clock, 
  Star, 
  Award, 
  Calendar,
  CheckCircle,
  Lock,
  RefreshCw,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * AchievementsPage - Achievement system and progress tracking
 */
const AchievementsPage = () => {
  const { analytics, user: appUser, loading, fetchAllData } = useAppData();
  const { stats, distractions } = usePomodoro();
  const [showCelebration, setShowCelebration] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);

  // Achievement definitions
  const achievements = [
    // Task Achievements
    {
      id: 'first_task',
      title: 'Getting Started',
      description: 'Complete your first task',
      icon: Target,
      category: 'tasks',
      requirement: 1,
      xpReward: 10,
      unlocked: (user, stats) => stats?.completedTasks >= 1,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'task_master',
      title: 'Task Master',
      description: 'Complete 10 tasks',
      icon: Target,
      category: 'tasks',
      requirement: 10,
      xpReward: 50,
      unlocked: (user, stats) => stats?.completedTasks >= 10,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'task_legend',
      title: 'Task Legend',
      description: 'Complete 50 tasks',
      icon: Target,
      category: 'tasks',
      requirement: 50,
      xpReward: 200,
      unlocked: (user, stats) => stats?.completedTasks >= 50,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'daily_warrior',
      title: 'Daily Warrior',
      description: 'Complete all 3 daily tasks for 7 days straight',
      icon: Calendar,
      category: 'streaks',
      requirement: 7,
      xpReward: 100,
      unlocked: (user, stats) => analytics?.streaks?.taskStreak >= 7,
      color: 'from-orange-500 to-orange-600'
    },

    // Pomodoro Achievements
    {
      id: 'first_pomodoro',
      title: 'Focus Beginner',
      description: 'Complete your first Pomodoro session',
      icon: Clock,
      category: 'pomodoro',
      requirement: 1,
      xpReward: 25,
      unlocked: (user, stats) => stats?.completedSessions >= 1,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'focus_master',
      title: 'Focus Master',
      description: 'Complete 25 Pomodoro sessions',
      icon: Clock,
      category: 'pomodoro',
      requirement: 25,
      xpReward: 150,
      unlocked: (user, stats) => stats?.completedSessions >= 25,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'focus_legend',
      title: 'Focus Legend',
      description: 'Complete 100 Pomodoro sessions',
      icon: Clock,
      category: 'pomodoro',
      requirement: 100,
      xpReward: 500,
      unlocked: (user, stats) => stats?.completedSessions >= 25,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'pomodoro_streak',
      title: 'Pomodoro Streak',
      description: 'Complete Pomodoro sessions for 5 days straight',
      icon: Calendar,
      category: 'streaks',
      requirement: 5,
      xpReward: 75,
      unlocked: (user, stats) => analytics?.streaks?.pomodoroStreak >= 5,
      color: 'from-pink-500 to-pink-600'
    },

    // Level Achievements
    {
      id: 'level_5',
      title: 'Rising Star',
      description: 'Reach level 5',
      icon: Star,
      category: 'levels',
      requirement: 5,
      xpReward: 100,
      unlocked: (user, stats) => user?.level >= 5,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'level_10',
      title: 'Productivity Pro',
      description: 'Reach level 10',
      icon: Star,
      category: 'levels',
      requirement: 10,
      xpReward: 250,
      unlocked: (user, stats) => user?.level >= 10,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'level_20',
      title: 'Focus Flow Master',
      description: 'Reach level 20',
      icon: Star,
      category: 'levels',
      requirement: 20,
      xpReward: 500,
      unlocked: (user, stats) => user?.level >= 20,
      color: 'from-purple-500 to-purple-600'
    },

    // Distraction Achievements
    {
      id: 'focused_mind',
      title: 'Focused Mind',
      description: 'Complete a Pomodoro session without distractions',
      icon: Award,
      category: 'focus',
      requirement: 1,
      xpReward: 50,
      unlocked: (user, stats) => stats?.sessionsWithoutDistractions >= 1,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 'distraction_free',
      title: 'Distraction Free',
      description: 'Complete 5 Pomodoro sessions without distractions',
      icon: Award,
      category: 'focus',
      requirement: 5,
      xpReward: 150,
      unlocked: (user, stats) => stats?.sessionsWithoutDistractions >= 5,
      color: 'from-teal-500 to-teal-600'
    }
  ];

  // Check for new achievements
  useEffect(() => {
    if (!appUser || !stats) return;

    const newUnlockedAchievements = achievements.filter(achievement => {
      const isUnlocked = achievement.unlocked(appUser, stats);
      const wasUnlocked = localStorage.getItem(`achievement_${achievement.id}`) === 'true';
      
      if (isUnlocked && !wasUnlocked) {
        localStorage.setItem(`achievement_${achievement.id}`, 'true');
        return true;
      }
      return false;
    });

    if (newUnlockedAchievements.length > 0) {
      setNewAchievement(newUnlockedAchievements[0]);
      setShowCelebration(true);
      toast.success(`🎉 Achievement Unlocked: ${newUnlockedAchievements[0].title}!`);
      
      setTimeout(() => {
        setShowCelebration(false);
        setNewAchievement(null);
      }, 3000);
    }
  }, [appUser, stats, analytics]);

  // Refresh data
  const handleRefresh = useCallback(async () => {
    try {
      await fetchAllData();
      toast.success('Achievement data refreshed!');
    } catch (error) {
      toast.error('Failed to refresh achievement data');
    }
  }, [fetchAllData]);

  // Export achievements
  const handleExport = useCallback(() => {
    const unlockedAchievements = achievements.filter(achievement => 
      achievement.unlocked(appUser, stats)
    );

    const exportData = {
      user: appUser,
      unlockedAchievements: unlockedAchievements.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        xpReward: a.xpReward,
        unlockedAt: new Date().toISOString()
      })),
      totalAchievements: achievements.length,
      unlockedCount: unlockedAchievements.length,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-achievements-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Achievement data exported successfully!');
  }, [appUser, stats, achievements]);

  // Group achievements by category
  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {});

  const categoryLabels = {
    tasks: 'Task Achievements',
    pomodoro: 'Pomodoro Achievements',
    levels: 'Level Achievements',
    streaks: 'Streak Achievements',
    focus: 'Focus Achievements'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-focus-50 to-focus-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-focus-500 mx-auto mb-4"></div>
          <p className="text-white/70">Loading achievements...</p>
        </div>
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked(appUser, stats)).length;
  const totalCount = achievements.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-focus-50 to-focus-100 dark:from-gray-900 dark:to-gray-800">
      {/* Celebration Animation */}
      {showCelebration && newAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center max-w-md mx-4">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-2">Achievement Unlocked!</h3>
            <div className={cn(
              "p-4 rounded-lg mb-4 bg-gradient-to-r",
              newAchievement.color
            )}>
              <newAchievement.icon className="w-12 h-12 text-white mx-auto mb-2" />
              <h4 className="text-xl font-bold text-white">{newAchievement.title}</h4>
              <p className="text-white/80">{newAchievement.description}</p>
              <div className="mt-2 text-white font-semibold">
                +{newAchievement.xpReward} XP
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass border-b border-white/20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🏆 Achievements</h1>
            <p className="text-white/70">
              Unlock achievements and track your progress
            </p>
            <div className="mt-2 text-sm text-white/60">
              {unlockedCount} of {totalCount} achievements unlocked
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              variant="gradient"
              className="bg-gradient-to-r from-focus-500 to-focus-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="max-w-7xl mx-auto p-6">
        <Card className="p-6 mb-8 bg-white/10 backdrop-blur-md border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Achievement Progress</h2>
            <div className="text-white/70">
              {unlockedCount}/{totalCount}
            </div>
          </div>
          <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-focus-500 to-focus-600 transition-all duration-1000"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </Card>

        {/* Achievement Categories */}
        {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
          <div key={category} className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              {categoryLabels[category]}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAchievements.map((achievement) => {
                const isUnlocked = achievement.unlocked(appUser, stats);
                const Icon = achievement.icon;
                
                return (
                  <Card
                    key={achievement.id}
                    className={cn(
                      "p-6 transition-all duration-300 hover:scale-105",
                      isUnlocked 
                        ? "bg-gradient-to-r border-transparent shadow-lg" 
                        : "bg-white/5 border-white/20 opacity-60",
                      isUnlocked ? achievement.color : ""
                    )}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={cn(
                        "p-3 rounded-lg",
                        isUnlocked ? "bg-white/20" : "bg-white/10"
                      )}>
                        {isUnlocked ? (
                          <Icon className="w-6 h-6 text-white" />
                        ) : (
                          <Lock className="w-6 h-6 text-white/50" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={cn(
                            "font-bold",
                            isUnlocked ? "text-white" : "text-white/50"
                          )}>
                            {achievement.title}
                          </h4>
                          {isUnlocked && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                        <p className={cn(
                          "text-sm mb-3",
                          isUnlocked ? "text-white/80" : "text-white/40"
                        )}>
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className={cn(
                            "text-xs font-semibold",
                            isUnlocked ? "text-white" : "text-white/40"
                          )}>
                            +{achievement.xpReward} XP
                          </div>
                          {!isUnlocked && (
                            <div className="text-xs text-white/40">
                              {achievement.requirement} required
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsPage;
