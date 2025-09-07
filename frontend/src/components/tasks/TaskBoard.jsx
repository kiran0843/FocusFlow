import React, { useState, useEffect } from 'react';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import ProgressIndicator from './ProgressIndicator';
import CelebrationAnimation from './CelebrationAnimation';
import EmptyState from './EmptyState';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppData } from '@/context/AppDataContext';

const MAX_TASKS_PER_DAY = 3;

const TaskBoard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTask, setDeleteTask] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const { tasks, loading, addTask, updateTask, deleteTask: removeTask, fetchTasksForDate } = useAppData();

  // Filter tasks for selected date
  const dateStr = selectedDate.toISOString().slice(0, 10);
  const todaysTasks = tasks.filter(t => {
    if (!t.taskDate) return false;
    const dateObj = new Date(t.taskDate);
    const taskDateStr = dateObj.toISOString().slice(0, 10);
    return taskDateStr === dateStr;
  });
  const canAddTask = todaysTasks.length < MAX_TASKS_PER_DAY;

  // Fetch tasks when component mounts or date changes
  useEffect(() => {
    fetchTasksForDate(selectedDate);
  }, [selectedDate, fetchTasksForDate]);

  // Show celebration animation on full completion
  useEffect(() => {
    if (todaysTasks.length === MAX_TASKS_PER_DAY && todaysTasks.every(t => t.completed)) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2500);
    }
  }, [todaysTasks]);

  // Add/Edit task
  const handleSaveTask = async (task) => {
    try {
      if (editTask) {
        const result = await updateTask(editTask._id, task);
        if (result.success) {
          toast.success('Task updated!');
        } else {
          toast.error('Failed to update task');
        }
      } else {
        const result = await addTask({ ...task, taskDate: selectedDate });
        if (result.success) {
          toast.success('Task added!');
        } else {
          toast.error('Failed to add task');
        }
      }
      setShowModal(false);
      setEditTask(null);
    } catch (err) {
      toast.error('Failed to save task');
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    try {
      const result = await removeTask(deleteTask._id);
      if (result.success) {
        toast.success('Task deleted!');
        setShowDelete(false);
        setDeleteTask(null);
      } else {
        toast.error('Failed to delete task');
      }
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  // Mark task complete
  const handleCompleteTask = async (task) => {
    try {
      const result = await updateTask(task._id, { completed: !task.completed });
      if (result.success) {
        toast.success(task.completed ? 'Task marked incomplete' : 'Task completed!');
      } else {
        toast.error('Failed to update task');
      }
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  // Progress
  const completedCount = todaysTasks.filter(t => t.completed).length;
  const progress = todaysTasks.length ? Math.round((completedCount / todaysTasks.length) * 100) : 0;

  // Date picker
  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  // Drag and drop (optional, not implemented here)

  return (
    <div className="space-y-8">
      {showCelebration && <CelebrationAnimation message="All tasks completed!" />}
      <GlassCard className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-white" />
          <input
            type="date"
            value={selectedDate.toISOString().slice(0, 10)}
            onChange={handleDateChange}
            className="bg-transparent text-white border border-white/20 rounded px-2 py-1 focus:outline-none"
          />
        </div>
        <Button
          variant="gradient"
          onClick={() => setShowModal(true)}
          disabled={!canAddTask}
        >
          + Add Task
        </Button>
      </GlassCard>
      <ProgressIndicator percentage={progress} completed={completedCount} total={todaysTasks.length} maxTasks={MAX_TASKS_PER_DAY} />
      {loading ? (
        <EmptyState message="Loading tasks..." />
      ) : todaysTasks.length === 0 ? (
        <EmptyState
          selectedDate={selectedDate}
          onAddTask={() => setShowModal(true)}
          canAddTask={canAddTask}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {todaysTasks.map((task, index) => (
            <TaskCard
              key={task._id}
              task={task}
              index={index}
              onEdit={() => { setEditTask(task); setShowModal(true); }}
              onDelete={() => { setDeleteTask(task); setShowDelete(true); }}
              onComplete={() => handleCompleteTask(task)}
            />
          ))}
        </div>
      )}
      {showModal && (
        <TaskModal
          open={showModal}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSave={handleSaveTask}
          task={editTask}
          selectedDate={selectedDate}
          maxTasks={MAX_TASKS_PER_DAY}
          currentCount={todaysTasks.length}
        />
      )}
      {showDelete && (
        <DeleteConfirmDialog
          open={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDeleteTask}
          task={deleteTask}
        />
      )}
    </div>
  );
};

export default TaskBoard;
