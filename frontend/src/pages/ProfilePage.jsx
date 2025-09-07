import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/card';
import { UploadCloud, User } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);
    const file = e.target.avatar.files[0];
    if (!file) return setError('No file selected');
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setAvatar(data.avatarUrl);
        setPreview(null);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('Upload error');
    }
    setUploading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <GlassCard className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-focus-500 to-focus-600 flex items-center justify-center mb-2 overflow-hidden">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-white" />
            )}
          </div>
          <form onSubmit={handleUpload} encType="multipart/form-data">
            <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} className="mb-2" />
            <Button type="submit" variant="gradient" disabled={uploading}>
              <UploadCloud className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Avatar'}
            </Button>
          </form>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
        <div className="text-left">
          <div className="mb-2"><strong>Name:</strong> {user?.name}</div>
          <div className="mb-2"><strong>Email:</strong> {user?.email}</div>
          <div className="mb-2"><strong>Level:</strong> {user?.level}</div>
          <div className="mb-2"><strong>XP:</strong> {user?.xp}</div>
          <div className="mb-2"><strong>Task Streak:</strong> {user?.taskStreak}</div>
          <div className="mb-2"><strong>Pomodoro Streak:</strong> {user?.pomodoroStreak}</div>
        </div>
      </GlassCard>
    </div>
  );
};

export default ProfilePage;
