import React, { useCallback } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { usePomodoro } from '@/context/PomodoroContext';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { toast } from 'react-hot-toast';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * AnalyticsPage - Comprehensive analytics and insights
 */
const AnalyticsPage = () => {
  const { analytics, user: appUser, loading, fetchAllData } = useAppData();
  const { stats, distractions } = usePomodoro();

  // Refresh analytics data
  const handleRefresh = useCallback(async () => {
    try {
      await fetchAllData();
      toast.success('Analytics data refreshed!');
    } catch (error) {
      toast.error('Failed to refresh analytics data');
    }
  }, [fetchAllData]);

  // Export analytics data
  const handleExport = useCallback(() => {
    if (!analytics) {
      toast.error('No analytics data to export');
      return;
    }

    // Prepare comprehensive analytics data
    const exportData = {
      user: appUser,
      analytics,
      pomodoroStats: stats,
      distractions: distractions,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    // Download as JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics data exported successfully!');
  }, [analytics, appUser, stats, distractions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-focus-50 to-focus-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-focus-500 mx-auto mb-4"></div>
          <p className="text-white/70">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-focus-50 to-focus-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="glass border-b border-white/20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📊 Analytics</h1>
            <p className="text-white/70">
              Track your productivity patterns and insights
            </p>
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
              Export Data
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <AnalyticsDashboard 
          data={{
            user: appUser,
            analytics,
            streaks: analytics?.streaks,
            pomodoroStats: stats,
            distractions: distractions
          }} 
          loading={loading} 
          onExport={handleExport}
        />
      </main>
    </div>
  );
};

export default AnalyticsPage;
