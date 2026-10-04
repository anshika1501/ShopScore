import React, { useState } from 'react';
import { adminApi } from '../../services/api';
import { Alert } from '../common/Alert';
import { User } from '../../types';
import { X, Store, Check } from 'lucide-react';

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  storeOwners: User[];
}

export const CreateStoreModal: React.FC<CreateStoreModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  storeOwners,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const nameLen = formData.name.trim().length;
  const isNameValid = nameLen >= 20 && nameLen <= 60;
  const isAddressValid = formData.address.trim().length > 0 && formData.address.trim().length <= 400;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!isNameValid) {
      setError('Store name must be between 20 and 60 characters long.');
      return;
    }

    if (!isAddressValid) {
      setError('Address is required and cannot exceed 400 characters.');
      return;
    }

    setLoading(true);

    try {
      await adminApi.createStore({
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        ownerId: formData.ownerId ? formData.ownerId : null,
      });

      onSuccess();
      onClose();
      setFormData({ name: '', email: '', address: '', ownerId: '' });
    } catch (err: any) {
      const resp = err.response?.data;
      setError(resp?.message || 'Failed to register new store.');
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
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Register New Store</h2>
              <p className="text-xs text-gray-500">Create store listing and assign an owner</p>
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
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Store Name
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
              placeholder="e.g. Downtown Prime Electronics Hub"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Store Contact Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@storename.com"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Assign Store Owner (Optional)
            </label>
            <select
              value={formData.ownerId}
              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">-- No Owner Assigned (Unassigned) --</option>
              {storeOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Only accounts with the STORE_OWNER role can be assigned.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Store Physical Address
            </label>
            <textarea
              rows={3}
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full physical street address"
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
              disabled={loading || !isNameValid || !isAddressValid}
              className="flex-1 flex justify-center items-center py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50"
            >
              <Check className="w-4 h-4 mr-1.5" />
              {loading ? 'Registering...' : 'Register Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
