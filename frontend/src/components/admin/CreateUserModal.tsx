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
  const nameTrimmed = formData.name.trim();
  const nameLen = nameTrimmed.length;
  const isNameFormatValid = /^[a-zA-Z\s\-']+$/.test(nameTrimmed);
  const isNameValid = nameLen >= 2 && nameLen <= 60 && isNameFormatValid;

  const passLen = formData.password.length;
  const isLengthValid = passLen >= 8 && passLen <= 16;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(formData.password);
  const isPassValid = isLengthValid && hasUpper && hasSpecial;

  const addressTrimmed = formData.address.trim();
  const addressLen = addressTrimmed.length;
  const isAddressFormatValid = addressLen === 0 || /^[a-zA-Z0-9\s,.\-#/']+$/.test(addressTrimmed);
  const isAddressValid = (addressLen === 0 || (addressLen >= 5 && addressLen <= 200)) && isAddressFormatValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const newFieldErrors: Record<string, string> = {};

    if (nameLen < 2 || nameLen > 60) {
      newFieldErrors.name = 'Full name must be between 2 and 60 characters long.';
    } else if (!isNameFormatValid) {
      newFieldErrors.name = 'Full name can only contain letters, spaces, hyphens, and apostrophes.';
    }
    if (!formData.email.trim()) {
      newFieldErrors.email = 'Email address is required.';
    }
    if (!isPassValid) {
      const missing: string[] = [];
      if (!isLengthValid) missing.push('8–16 characters');
      if (!hasUpper) missing.push('at least 1 uppercase letter');
      if (!hasSpecial) missing.push('at least 1 special character');
      newFieldErrors.password = `Password requires: ${missing.join(', ')}.`;
    }
    if (addressLen > 0 && (addressLen < 5 || addressLen > 200)) {
      newFieldErrors.address = 'Address must be between 5 and 200 characters long.';
    } else if (!isAddressFormatValid) {
      newFieldErrors.address = 'Address contains invalid characters.';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setError('Please resolve all validation errors before proceeding.');
      return;
    }

    setLoading(true);

    try {
      await adminApi.createUser({
        name: nameTrimmed,
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        address: addressTrimmed || undefined,
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
              <span
                className={`text-xs ${
                  formData.name.length === 0
                    ? 'text-gray-400'
                    : isNameValid
                    ? 'text-green-600 font-medium'
                    : 'text-amber-600 font-medium'
                }`}
              >
                {nameLen}/60 chars {isNameValid ? '✓' : '(min 2)'}
              </span>
            </div>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (fieldErrors.name) {
                  setFieldErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.name;
                    return copy;
                  });
                }
              }}
              placeholder="e.g. Anshika Priya"
              className={`block w-full px-3 py-2 border rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 ${
                formData.name.length > 0 && !isNameValid
                  ? 'border-amber-400 bg-amber-50/20'
                  : 'border-gray-300'
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Must be between 2 and 60 characters long. Letters, spaces, hyphens, and apostrophes allowed.
            </p>
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (fieldErrors.email) {
                  setFieldErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.email;
                    return copy;
                  });
                }
              }}
              placeholder="user@example.com"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Initial Password
              </label>
              <span
                className={`text-xs ${
                  formData.password.length === 0
                    ? 'text-gray-400'
                    : isPassValid
                    ? 'text-green-600 font-medium'
                    : 'text-amber-600 font-medium'
                }`}
              >
                {passLen} chars
              </span>
            </div>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (fieldErrors.password) {
                  setFieldErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.password;
                    return copy;
                  });
                }
              }}
              placeholder="••••••••"
              className={`block w-full px-3 py-2 border rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 ${
                formData.password.length > 0 && !isPassValid
                  ? 'border-amber-400 bg-amber-50/20'
                  : 'border-gray-300'
              }`}
            />

            {/* Real-time password criteria list */}
            <div className="mt-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-150 space-y-1">
              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                Password Requirements:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                <span
                  className={`flex items-center gap-1.5 ${
                    isLengthValid ? 'text-green-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                      isLengthValid ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    ✓
                  </span>
                  8–16 characters ({passLen})
                </span>

                <span
                  className={`flex items-center gap-1.5 ${
                    hasUpper ? 'text-green-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                      hasUpper ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    ✓
                  </span>
                  At least 1 uppercase letter
                </span>

                <span
                  className={`flex items-center gap-1.5 sm:col-span-2 ${
                    hasSpecial ? 'text-green-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                      hasSpecial ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    ✓
                  </span>
                  At least 1 special character (!@#$%^&*...)
                </span>
              </div>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Address (Optional)
              </label>
              <span
                className={`text-xs ${
                  addressLen > 200 || (addressLen > 0 && addressLen < 5) ? 'text-red-600 font-medium' : 'text-gray-400'
                }`}
              >
                {addressLen}/200 max {addressLen > 0 && addressLen < 5 ? '(min 5)' : ''}
              </span>
            </div>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                if (fieldErrors.address) {
                  setFieldErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.address;
                    return copy;
                  });
                }
              }}
              placeholder="Enter physical address"
              className={`block w-full px-3 py-2 border rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 ${
                addressLen > 200 || (addressLen > 0 && addressLen < 5) ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
              }`}
            />
            {fieldErrors.address && (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.address}</p>
            )}
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
              disabled={loading || !isAddressValid}
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
