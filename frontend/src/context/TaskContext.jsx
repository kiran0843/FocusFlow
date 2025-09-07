import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useApi } from '@/hooks/useApi';
import axios from 'axios';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { makeRequest } = useApi();
  const debounceTimeoutRef = useRef(null);

  // Internal fetch function
  const _fetchTasks = async (date = null) => {
    setLoading(true);
    try {
      let res;
      if (date) {
        const dateStr = date.toISOString().slice(0, 10);
        res = await makeRequest(() => axios.get(`/tasks?date=${dateStr}`));
      } else {
        res = await makeRequest(() => axios.get('/tasks'));
      }
      // Fix: The response structure is { success: true, data: { tasks } }
      setTasks(res.data?.data?.tasks || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  // Debounced fetch function to prevent excessive API calls
  const fetchTasks = useCallback((date = null) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      _fetchTasks(date);
    }, 300); // 300ms debounce
  }, [makeRequest]);

  // Add a new task
  const addTask = async (task) => {
    // Ensure taskDate is present and valid
    const payload = { ...task };
    if (!payload.taskDate) {
      payload.taskDate = new Date().toISOString();
    } else if (payload.taskDate instanceof Date) {
      payload.taskDate = payload.taskDate.toISOString();
    }
    console.log('Adding task payload:', payload); // Debug log
    
    try {
      const result = await makeRequest(() => axios.post('/tasks', payload));
      if (result.success) {
        // Refresh tasks immediately after successful creation (no debounce)
        await _fetchTasks(payload.taskDate ? new Date(payload.taskDate) : null);
        console.log('Task added successfully, refreshing tasks...');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  // Edit a task
  const editTask = async (id, updates) => {
    try {
      const result = await makeRequest(() => axios.put(`/tasks/${id}`, updates));
      if (result.success) {
        await _fetchTasks(updates.taskDate ? new Date(updates.taskDate) : null);
      }
    } catch (error) {
      console.error('Error editing task:', error);
      throw error;
    }
  };

  // Delete a task
  const deleteTask = async (id, date = null) => {
    try {
      const result = await makeRequest(() => axios.delete(`/tasks/${id}`));
      if (result.success) {
        await _fetchTasks(date);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTasks();
    
    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array to run only once on mount

  return (
    <TaskContext.Provider value={{ tasks, loading, fetchTasks, addTask, editTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};
