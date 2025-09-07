import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Timer, Download } from 'lucide-react';

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [autoStart, setAutoStart] = useState(false);

  // Export settings as JSON
  const handleExportJSON = () => {
    const data = {
      notifications,
      workDuration,
      breakDuration,
      autoStart,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'focusflow-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export settings as CSV
  const handleExportCSV = () => {
    const csv = `notifications,workDuration,breakDuration,autoStart\n${notifications},${workDuration},${breakDuration},${autoStart}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'focusflow-settings.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <GlassCard className="p-8">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <div className="mb-6">
          <label className="flex items-center mb-4">
            <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} className="mr-2" />
            <Bell className="h-5 w-5 mr-2" /> Enable Notifications
          </label>
          <label className="flex items-center mb-4">
            <Timer className="h-5 w-5 mr-2" />
            Work Duration:
            <input type="number" min="15" max="60" value={workDuration} onChange={e => setWorkDuration(Number(e.target.value))} className="ml-2 w-16" /> min
          </label>
          <label className="flex items-center mb-4">
            <Timer className="h-5 w-5 mr-2" />
            Break Duration:
            <input type="number" min="3" max="30" value={breakDuration} onChange={e => setBreakDuration(Number(e.target.value))} className="ml-2 w-16" /> min
          </label>
          <label className="flex items-center mb-4">
            <input type="checkbox" checked={autoStart} onChange={e => setAutoStart(e.target.checked)} className="mr-2" />
            Auto-start next session
          </label>
        </div>
        <div className="flex gap-4">
          <Button variant="gradient" onClick={handleExportJSON}><Download className="h-4 w-4 mr-2" />Export JSON</Button>
          <Button variant="glass" onClick={handleExportCSV}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
        </div>
      </GlassCard>
    </div>
  );
};

export default SettingsPage;
