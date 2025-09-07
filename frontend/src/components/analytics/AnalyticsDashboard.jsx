import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import CelebrationAnimation from '@/components/tasks/CelebrationAnimation';
import { GlassCard } from '@/components/ui/card';
import { Trophy, Zap, Target, Calendar, PieChart as PieIcon, TrendingUp } from 'lucide-react';

// Gradient colors for charts
const gradients = [
  '#6EE7B7', '#3B82F6', '#F472B6', '#F59E42', '#A78BFA', '#F87171', '#34D399', '#FBBF24', '#60A5FA', '#F43F5E'
];

const AnalyticsDashboard = ({ data, loading, onExport }) => {
  const [view, setView] = useState('weekly');
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (data?.streaks?.taskStreak >= 7 || data?.streaks?.pomodoroStreak >= 7) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [data]);

  // Helper for gradient fills
  const getGradient = (id, color) => (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
      <stop offset="95%" stopColor={color} stopOpacity={0.2}/>
    </linearGradient>
  );

  // Cards for key metrics
  const overviewCards = [
    {
      icon: <Trophy className="h-6 w-6 text-white" />, label: 'Level', value: data?.user?.level || 1, color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Zap className="h-6 w-6 text-white" />, label: 'Total XP', value: data?.user?.xp || 0, color: 'from-success-500 to-success-600'
    },
    {
      icon: <Target className="h-6 w-6 text-white" />, label: 'XP to Next Level', value: data?.user?.xpForNextLevel || 100, color: 'from-warning-500 to-warning-600'
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-white" />, label: 'Level Progress', value: `${Math.round(data?.user?.levelProgress || 0)}%`, color: 'from-focus-500 to-focus-600'
    },
    {
      icon: <Calendar className="h-6 w-6 text-white" />, label: 'Task Streak', value: data?.streaks?.taskStreak || 0, color: 'from-pink-500 to-pink-600'
    },
    {
      icon: <Calendar className="h-6 w-6 text-white" />, label: 'Pomodoro Streak', value: data?.streaks?.pomodoroStreak || 0, color: 'from-blue-500 to-blue-600'
    },
  ];

  // Export handler
  const handleExport = () => {
    if (onExport) onExport();
  };

  return (
    <div className="space-y-8">
      {/* Celebration Animation */}
      {showCelebration && <CelebrationAnimation message="Streak Unlocked!" />}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {overviewCards.map((card, idx) => (
          <GlassCard key={card.label} className={`p-4 text-center bg-gradient-to-r ${card.color}`}>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg mx-auto mb-2">
              {card.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{card.value}</h3>
            <p className="text-white/70 text-xs">{card.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex justify-end gap-2">
        <Button variant={view === 'weekly' ? 'gradient' : 'glass'} onClick={() => setView('weekly')}>Weekly</Button>
        <Button variant={view === 'monthly' ? 'gradient' : 'glass'} onClick={() => setView('monthly')}>Monthly</Button>
        <Button variant="glass" onClick={handleExport}>Export Data</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Completion Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><TrendingUp className="mr-2" />Task Completion</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.tasksByDate || []}>
              <defs>
                {gradients.map((color, i) => (
                  <React.Fragment key={`barGradient${i}`}>{getGradient(`barGradient${i}`, color)}</React.Fragment>
                ))}
              </defs>
              <XAxis dataKey="_id" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Legend />
              <Bar dataKey="completedTasks" fill="url(#barGradient0)" radius={[8,8,0,0]} isAnimationActive />
              <Bar dataKey="totalTasks" fill="url(#barGradient1)" radius={[8,8,0,0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Distraction Patterns Pie Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><PieIcon className="mr-2" />Distraction Patterns</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.distractionsByType || []}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="url(#pieGradient)"
                label
                isAnimationActive
              >
                {data?.distractionsByType?.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={gradients[idx % gradients.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Over Time Line Chart */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><TrendingUp className="mr-2" />Progress Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data?.progressOverTime || []}>
              <defs>
                {gradients.map((color, i) => (
                  <React.Fragment key={`lineGradient${i}`}>{getGradient(`lineGradient${i}`, color)}</React.Fragment>
                ))}
              </defs>
              <XAxis dataKey="_id" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completedTasks" stroke="url(#lineGradient0)" strokeWidth={3} dot={{ r: 4 }} isAnimationActive />
              <Line type="monotone" dataKey="totalTasks" stroke="url(#lineGradient1)" strokeWidth={3} dot={{ r: 4 }} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Pomodoro Heatmap Calendar */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><Calendar className="mr-2" />Pomodoro Sessions Heatmap</h3>
          {/* Placeholder for heatmap calendar - use a custom or third-party heatmap calendar component */}
          <div className="w-full h-56 flex items-center justify-center text-white/70 bg-gradient-to-br from-focus-500 to-focus-600 rounded-lg">
            Heatmap Calendar Coming Soon
          </div>
        </GlassCard>
      </div>

      {/* Level Progression Indicator */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><Trophy className="mr-2" />Level Progression</h3>
        <div className="w-full h-6 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
            style={{ width: `${data?.user?.levelProgress || 0}%`, transition: 'width 1s' }}
          />
        </div>
        <div className="text-right text-white/70 mt-2">{Math.round(data?.user?.levelProgress || 0)}%</div>
      </GlassCard>
    </div>
  );
};

export default AnalyticsDashboard;
