import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

const shortcuts = [
  { key: 'n', action: 'Add Task' },
  { key: 'p', action: 'Start Pomodoro' },
  { key: 'e', action: 'Export Data' },
  { key: 's', action: 'Open Settings' },
  { key: 'u', action: 'Open Profile' },
];

const KeyboardShortcuts = ({ onShortcut }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case 'n':
            onShortcut('addTask');
            toast.info('Shortcut: Add Task');
            break;
          case 'p':
            onShortcut('startPomodoro');
            toast.info('Shortcut: Start Pomodoro');
            break;
          case 'e':
            onShortcut('exportData');
            toast.info('Shortcut: Export Data');
            break;
          case 's':
            onShortcut('openSettings');
            toast.info('Shortcut: Open Settings');
            break;
          case 'u':
            onShortcut('openProfile');
            toast.info('Shortcut: Open Profile');
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onShortcut]);

  return null;
};

export default KeyboardShortcuts;
