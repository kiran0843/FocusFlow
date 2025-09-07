import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useApi } from '@/hooks/useApi';
import axios from 'axios';

const AppDataContext = createContext();

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider = ({ children }) => {
  const [appData, setAppData] = useState({
    tasks: [],
    analytics: null,
    streaks: null,
    user: null,
    loading: false,
    lastUpdated: null
  });
  
  const { user, token } = useAuth();
  const { makeRequest } = useApi();

  // Fetch all app data
  const fetchAllData = useCallback(async () => {
    if (!user || !token) return;
    
    setAppData(prev => ({ ...prev, loading: true }));
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const headers = { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      };

      // Get today's date for task filtering
      const today = new Date().toISOString().slice(0, 10);

      // Fetch all data in parallel
      const [
        tasksRes,
        dashboardRes,
        streaksRes,
        userRes,
        pomodoroStatsRes,
        rewardsRes
      ] = await Promise.all([
        fetch(`${API_URL}/tasks?date=${today}`, { headers }),
        fetch(`${API_URL}/analytics/dashboard`, { headers }),
        fetch(`${API_URL}/analytics/streaks`, { headers }),
        fetch(`${API_URL}/auth/me`, { headers }),
        fetch(`${API_URL}/pomodoro/stats`, { headers }),
        fetch(`${API_URL}/rewards/progress`, { headers })
      ]);

      const [tasks, dashboard, streaks, userData, pomodoroStats, rewards] = await Promise.all([
        tasksRes.json(),
        dashboardRes.json(),
        streaksRes.json(),
        userRes.json(),
        pomodoroStatsRes.json(),
        rewardsRes.json()
      ]);

      setAppData(prev => ({
        ...prev,
        tasks: tasks.data?.tasks || [],
        analytics: {
          ...dashboard.data,
          pomodoroStats: pomodoroStats.data
        },
        streaks: streaks.data?.streaks || null,
        user: userData.data?.user || null,
        rewards: rewards.data || null,
        loading: false,
        lastUpdated: new Date()
      }));

    } catch (error) {
      console.error('Error fetching app data:', error);
      setAppData(prev => ({ ...prev, loading: false }));
    }
  }, [user, token]);

  // Fetch tasks for specific date
  const fetchTasksForDate = useCallback(async (date) => {
    if (!user || !token) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const headers = { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      };
      
      const dateStr = date.toISOString().slice(0, 10);
      const res = await fetch(`${API_URL}/tasks?date=${dateStr}`, { headers });
      const data = await res.json();
      
      setAppData(prev => ({
        ...prev,
        tasks: data.data?.tasks || []
      }));
      
    } catch (error) {
      console.error('Error fetching tasks for date:', error);
    }
  }, [user, token]);

  // Add task and refresh data
  const addTask = useCallback(async (task) => {
    if (!user || !token) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const headers = { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      };
      
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(task)
      });
      
      if (res.ok) {
        // Refresh all data after adding task
        await fetchAllData();
        return { success: true };
      }
      
    } catch (error) {
      console.error('Error adding task:', error);
      return { success: false, error };
    }
  }, [user, token, fetchAllData]);

  // Update task and refresh data
  const updateTask = useCallback(async (taskId, updates) => {
    if (!user || !token) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const headers = { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      };
      
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      });
      
      if (res.ok) {
        // Refresh all data after updating task
        await fetchAllData();
        return { success: true };
      }
      
    } catch (error) {
      console.error('Error updating task:', error);
      return { success: false, error };
    }
  }, [user, token, fetchAllData]);

  // Delete task and refresh data
  const deleteTask = useCallback(async (taskId) => {
    if (!user || !token) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const headers = { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      };
      
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers
      });
      
      if (res.ok) {
        // Refresh all data after deleting task
        await fetchAllData();
        return { success: true };
      }
      
    } catch (error) {
      console.error('Error deleting task:', error);
      return { success: false, error };
    }
  }, [user, token, fetchAllData]);

  // Complete task and refresh data (with XP reward)
  const completeTask = useCallback(async (taskId) => {
    if (!user || !token) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const headers = { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      };
      
      const res = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers
      });
      
      if (res.ok) {
        // Refresh all data after completing task (to update XP)
        await fetchAllData();
        return { success: true };
      }
      
    } catch (error) {
      console.error('Error completing task:', error);
      return { success: false, error };
    }
  }, [user, token, fetchAllData]);

  // Process daily rewards
  const processDailyRewards = useCallback(async () => {
    if (!user || !token) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const headers = { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      };
      
      const res = await fetch(`${API_URL}/rewards/process-daily`, {
        method: 'POST',
        headers
      });
      
      if (res.ok) {
        // Refresh all data after processing rewards
        await fetchAllData();
        return { success: true };
      }
      
    } catch (error) {
      console.error('Error processing daily rewards:', error);
      return { success: false, error };
    }
  }, [user, token, fetchAllData]);

  // Fetch initial data when user changes
  useEffect(() => {
    if (user && token) {
      fetchAllData();
    }
  }, [user, token, fetchAllData]);

  const value = {
    ...appData,
    fetchAllData,
    fetchTasksForDate,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    processDailyRewards
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};


