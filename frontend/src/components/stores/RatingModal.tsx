import React, { useState, useEffect } from 'react';
import { Store } from '../../types';
import { ratingApi } from '../../services/api';
import { StarRating } from './StarRating';
import { Alert } from '../common/Alert';
import { X, Check } from 'lucide-react';

interface RatingModalProps {
  store: Store | null;
  initialRating?: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedRating: number) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  store,
  initialRating,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(initialRating || 5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRating) {
      setRating(initialRating);
    } else {
      setRating(5);
    }
    setError(null);
  }, [store, initialRating, isOpen]);

  if (!isOpen || !store) return null;

  const isUpdate = initialRating !== null && initialRating !== undefined;

  const ratingDescriptions: Record<number, string> = {
    1: '1 - Poor Experience',
    2: '2 - Fair',
    3: '3 - Good Quality',
    4: '4 - Very Good',
    5: '5 - Excellent Experience',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await ratingApi.submitRating({
        storeId: store.id,
        rating,
      });
      onSuccess(rating);
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to submit rating. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {isUpdate ? 'Modify Your Rating' : 'Rate This Store'}
            </h3>
            <p className="text-sm font-medium text-green-700 mt-0.5">{store.name}</p>
            <p className="text-xs text-gray-500 truncate max-w-xs">{store.address}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Select Your Rating (1 to 5)
            </p>
            <StarRating value={rating} onChange={setRating} interactive size="lg" />
            <p className="mt-3 text-sm font-medium text-gray-800">
              {ratingDescriptions[rating] || ''}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex justify-center items-center py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50"
            >
              <Check className="w-4 h-4 mr-1.5" />
              {loading ? 'Saving...' : isUpdate ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
