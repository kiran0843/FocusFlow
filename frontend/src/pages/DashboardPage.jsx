import React, { useCallback } from 'react';
import KeyboardShortcuts from '@/components/ui/KeyboardShortcuts';
import PageTransition from '@/components/ui/PageTransition';
import { toast } from 'react-hot-toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { LogOut, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import RewardsProgress from '@/components/rewards/RewardsProgress';

/**
 * DashboardPage component - Main dashboard after login
 */
const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { analytics, user: appUser, loading, fetchAllData } = useAppData();
  
  // Logout handler
  const handleLogout = useCallback(() => {
    logout();
    toast.success('Logged out successfully');
  }, [logout]);
  
  // Export analytics data
  const handleExport = useCallback(() => {
    if (!analytics) {
      toast.error('No analytics data to export');
      return;
    }
    // Example: Download as JSON
    const dataStr = JSON.stringify(analytics, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics data exported!');
  }, [analytics]);

  const handleShortcut = useCallback((action) => {
    switch (action) {
      case 'exportData':
        handleExport();
        break;
      case 'openSettings':
        window.location.href = '/settings';
        break;
      case 'openProfile':
        window.location.href = '/profile';
        break;
      default:
        break;
    }
  }, [handleExport]);

  return (
    <ErrorBoundary>
      <KeyboardShortcuts onShortcut={handleShortcut} />
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
          {/* Header */}
          <header className="glass-header p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-focus-500 to-focus-600 rounded-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">FocusFlow</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white hover:bg-black/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.name}! 👋
              </h2>
              <p className="text-gray-300">
                Ready to boost your productivity today?
              </p>
            </div>

            {/* Rewards Progress */}
            <div className="mb-8">
              <RewardsProgress />
            </div>

            {/* Analytics Dashboard */}
            <AnalyticsDashboard 
              data={{
                user: appUser,
                analytics,
                streaks: analytics?.streaks
              }} 
              loading={loading} 
              onExport={handleExport}
            />
          </main>
        </div>
      </PageTransition>
    </ErrorBoundary>
  );
}

export default React.memo(DashboardPage);
