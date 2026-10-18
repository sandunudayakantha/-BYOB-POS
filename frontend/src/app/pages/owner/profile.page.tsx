import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChangePasswordUseCase } from '@/app/domain/auth/use-change-password.use-case';
import { FormInput } from '@/components/FormFields';
import toast from 'react-hot-toast';
import { KeyIcon } from '@heroicons/react/24/outline';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { changePassword, isSubmitting } = useChangePasswordUseCase();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in current and new password fields.');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update password.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Account Profile & Security
        </h2>
        <p className="text-sm text-slate-500">
          Manage your account credentials and security settings.
        </p>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold text-xl flex items-center justify-center">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Role: {user?.role}
            </span>
          </div>
        </div>

        {user?.restaurant && (
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold">Associated Restaurant: </span>
            <span>{user.restaurant.name}</span>
          </div>
        )}
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <KeyIcon className="w-6 h-6 text-emerald-600" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Change Account Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <FormInput
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e: any) => setCurrentPassword(e.target.value)}
            required
          />

          <FormInput
            label="New Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChange={(e: any) => setNewPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
