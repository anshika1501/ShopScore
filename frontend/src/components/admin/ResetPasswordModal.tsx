import React, { useState } from 'react';
import { KeyRound, Check, Copy, AlertCircle, X } from 'lucide-react';
import { User } from '../../types';

interface ResetPasswordModalProps {
  isOpen: boolean;
  user: User | null;
  loading: boolean;
  onClose: () => void;
  onReset: (userId: string, customPassword?: string) => Promise<{ temporaryPassword: string }>;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  user,
  loading,
  onClose,
  onReset,
}) => {
  const [customPassword, setCustomPassword] = useState('');
  const [useCustomPassword, setUseCustomPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleCopy = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setCustomPassword('');
    setUseCustomPassword(false);
    setGeneratedPassword(null);
    setCopied(false);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (useCustomPassword) {
      if (customPassword.length < 8 || customPassword.length > 16) {
        setError('Password must be between 8 and 16 characters.');
        return;
      }
      if (!/[A-Z]/.test(customPassword)) {
        setError('Password must contain at least one uppercase letter.');
        return;
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(customPassword)) {
        setError('Password must contain at least one special character.');
        return;
      }
    }

    try {
      const res = await onReset(
        user.id,
        useCustomPassword ? customPassword : undefined
      );
      setGeneratedPassword(res.temporaryPassword);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset user password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Reset User Password</h3>
              <p className="text-xs text-gray-500">
                {user.name} ({user.email})
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {generatedPassword ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <p className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-1">
                New Temporary Password
              </p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <code className="text-base font-mono font-bold text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-green-300 select-all">
                  {generatedPassword}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-green-700 mt-2">
                Share this temporary password with <strong>{user.name}</strong> securely.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              This action will securely overwrite the password for this account. You can auto-generate a secure temporary password or specify one manually.
            </p>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="useCustomPassword"
                checked={useCustomPassword}
                onChange={(e) => setUseCustomPassword(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="useCustomPassword" className="text-xs font-medium text-gray-700 select-none">
                Specify a custom temporary password
              </label>
            </div>

            {useCustomPassword && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Custom Temporary Password
                </label>
                <input
                  type="text"
                  required
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder="e.g. Temp@2026Secure"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 font-mono"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  8–16 characters, 1 uppercase letter, 1 special character
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                disabled={loading}
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
