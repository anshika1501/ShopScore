import React, { useState } from 'react';
import { adminApi } from '../../services/api';
import { Alert } from '../common/Alert';
import { Role } from '../../types';
import { X, UserPlus, Check } from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as Role,
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Validation
  const nameLen = formData.name.trim().length;
  const isNameValid = nameLen >= 20 && nameLen <= 60;
  const passLen = formData.password.length;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(formData.password);
  const isPassValid = passLen >= 8 && passLen <= 16 && hasUpper && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!isNameValid) {
      setError('Name must be between 20 and 60 characters.');
      return;
    }
    if (!isPassValid) {
      setError('Password must satisfy all complexity requirements.');
      return;
    }

    setLoading(true);

    try {
      await adminApi.createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        address: formData.address.trim() || undefined,
      });

      onSuccess();
      onClose();
      setFormData({ name: '', email: '', password: '', role: 'USER', address: '' });
    } catch (err: any) {
      const resp = err.response?.data;
      setError(resp?.message || 'Failed to create user account.');
      if (resp?.details) setFieldErrors(resp.details);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Create New Account</h2>
              <p className="text-xs text-gray-500">Provision a User, Store Owner, or Admin</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} details={fieldErrors} onClose={() => setError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Account Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="USER">Normal User (Customer)</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Full Name
              </label>
              <span className={`text-xs ${isNameValid ? 'text-green-600' : 'text-gray-400'}`}>
                {nameLen}/60 chars (min 20)
              </span>
            </div>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Jonathan Alexander Miller"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Initial Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              8–16 characters, $\ge 1$ uppercase letter, $\ge 1$ special character.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Address (Optional, max 400 chars)
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter physical address"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isNameValid || !isPassValid}
              className="flex-1 flex justify-center items-center py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50"
            >
              <Check className="w-4 h-4 mr-1.5" />
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
