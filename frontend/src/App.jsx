import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { PomodoroProvider } from '@/context/PomodoroContext'
import { TaskProvider } from '@/context/TaskContext'
import { AppDataProvider } from '@/context/AppDataContext'
import { NotificationProvider } from '@/context/NotificationContext'
import ProtectedRoute, { PublicRoute } from '@/components/auth/ProtectedRoute'
import ErrorBoundary from '@/components/ErrorBoundary'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import LandingPage from '@/pages/LandingPage';
import DashboardPage from '@/pages/DashboardPage';
import PomodoroPage from '@/pages/PomodoroPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import AchievementsPage from '@/pages/AchievementsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import TasksPage from '@/pages/TasksPage';

/**
 * Main App component with routing and providers
 */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/" 
                  element={<LandingPage />} 
                />
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  } 
                />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <AppDataProvider>
                        <Layout>
                          <DashboardPage />
                        </Layout>
                      </AppDataProvider>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tasks" 
                  element={
                    <ProtectedRoute>
                      <AppDataProvider>
                        <Layout>
                          <TasksPage />
                        </Layout>
                      </AppDataProvider>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/pomodoro" 
                  element={
                    <ProtectedRoute>
                      <AppDataProvider>
                        <PomodoroProvider>
                          <Layout>
                            <PomodoroPage />
                          </Layout>
                        </PomodoroProvider>
                      </AppDataProvider>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <ProtectedRoute>
                      <AppDataProvider>
                        <PomodoroProvider>
                          <Layout>
                            <AnalyticsPage />
                          </Layout>
                        </PomodoroProvider>
                      </AppDataProvider>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/achievements" 
                  element={
                    <ProtectedRoute>
                      <AppDataProvider>
                        <PomodoroProvider>
                          <Layout>
                            <AchievementsPage />
                          </Layout>
                        </PomodoroProvider>
                      </AppDataProvider>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SettingsPage />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ProfilePage />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* 404 Page */}
                <Route path="*" element={<NotFoundPage />} />
                </Routes>
              
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: '#fff',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                  loading: {
                    iconTheme: {
                      primary: '#3b82f6',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
            </Router>
          </NotificationProvider>
        </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
