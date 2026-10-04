import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Alert } from '../common/Alert';
import { X, User, Store, Star, MapPin, Mail, Calendar } from 'lucide-react';

interface UserDetailsModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ userId, isOpen, onClose }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminApi.getUserDetails(userId);
        setUser(res.data.user);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch user details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [userId, isOpen]);

  if (!isOpen || !userId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-gray-100">
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">User Account Details</h2>
              <p className="text-xs text-gray-500">Platform user profile and associations</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {loading ? (
          <div className="py-12">
            <LoadingSpinner message="Loading account information..." />
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* User Profile Card */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : user.role === 'STORE_OWNER'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-green-100 text-green-800 border-green-200'
                }`}>
                  {user.role}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>{user.address || 'No physical address provided'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* If user is STORE_OWNER, show assigned stores and ratings */}
            {user.role === 'STORE_OWNER' && (
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <Store className="w-4 h-4 text-blue-600 mr-2" />
                  Associated Stores ({user.stores?.length || 0})
                </h4>

                {(!user.stores || user.stores.length === 0) ? (
                  <p className="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg border border-dashed text-center">
                    No stores are currently assigned to this store owner.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {user.stores.map((store: any) => (
                      <div
                        key={store.id}
                        className="p-3.5 bg-white border border-gray-200 rounded-lg shadow-xs flex justify-between items-center"
                      >
                        <div className="max-w-[70%]">
                          <p className="text-sm font-semibold text-gray-900 truncate">{store.name}</p>
                          <p className="text-xs text-gray-500 truncate">{store.address}</p>
                        </div>
                        <div className="text-right">
                          {store.averageRating !== null ? (
                            <div className="flex items-center text-xs font-bold text-yellow-800 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500 mr-1" />
                              <span>{store.averageRating}</span>
                              <span className="text-[10px] text-gray-500 ml-1">({store.totalRatings})</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium">Not rated</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
              >
                Close Details
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
