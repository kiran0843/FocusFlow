import React from 'react';
import TaskBoard from '@/components/tasks/TaskBoard';
import { GlassCard } from '@/components/ui/card';

const TasksPage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-focus-50 to-focus-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <GlassCard className="mb-8 p-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Tasks Page</h1>
        <p className="text-gray-300">Manage your daily tasks below. Add, edit, complete, and track your progress!</p>
      </GlassCard>
      <TaskBoard />
    </div>
  );
};

export default TasksPage;
