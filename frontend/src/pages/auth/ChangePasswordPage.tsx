import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/common/Alert';
import { KeyRound, Lock, Check, X } from 'lucide-react';

export const ChangePasswordPage: React.FC = () => {
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validation
  const newPassLength = newPassword.length;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);
  const isNewPassValid = newPassLength >= 8 && newPassLength <= 16 && hasUppercase && hasSpecial;
  const passwordsMatch = newPassword === confirmPassword && newPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isNewPassValid) {
      setError('New password does not satisfy complexity requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);

    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess('Your password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 bg-green-50 text-green-700 rounded-lg">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Change Password</h1>
            <p className="text-sm text-gray-500">Update your account login password</p>
          </div>
        </div>

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {success && (
          <div className="mb-4">
            <Alert type="success" message={success} onClose={() => setSuccess(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>

            <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
              <span className={`flex items-center gap-1 ${newPassLength >= 8 && newPassLength <= 16 ? 'text-green-600' : 'text-gray-400'}`}>
                {newPassLength >= 8 && newPassLength <= 16 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                8–16 characters ({newPassLength})
              </span>
              <span className={`flex items-center gap-1 ${hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
                {hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                1 Uppercase letter
              </span>
              <span className={`flex items-center gap-1 col-span-2 ${hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                {hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                1 Special character (!@#$%^&*)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>
            {newPassword && confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isNewPassValid || !passwordsMatch}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
