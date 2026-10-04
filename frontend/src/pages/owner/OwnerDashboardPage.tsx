import React, { useState, useEffect, useCallback } from 'react';
import { ownerApi } from '../../services/api';
import { Store, RatingReview, Pagination } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { StarRating } from '../../components/stores/StarRating';
import { Store as StoreIcon, Star, User, MapPin, Mail, Calendar, MessageSquare, ChevronRight } from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const [ratings, setRatings] = useState<RatingReview[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = async () => {
    setLoadingStores(true);
    setError(null);
    try {
      const res = await ownerApi.getStores();
      setStores(res.data.stores);
      if (res.data.stores.length > 0) {
        setSelectedStore(res.data.stores[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load your assigned stores.');
    } finally {
      setLoadingStores(false);
    }
  };

  const fetchRatings = useCallback(async (storeId: string) => {
    setLoadingRatings(true);
    try {
      const res = await ownerApi.getStoreRatings(storeId, {
        page: pagination.page,
        limit: pagination.limit,
      });
      setRatings(res.data.ratings);
      setPagination(res.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reviews for this store.');
    } finally {
      setLoadingRatings(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchRatings(selectedStore.id);
    }
  }, [selectedStore, pagination.page, fetchRatings]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Store Owner Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor store ratings, customer feedback, and overall satisfaction for your registered stores.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {loadingStores ? (
        <div className="py-16">
          <LoadingSpinner message="Loading your assigned stores..." />
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center">
            <StoreIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No stores assigned</h3>
          <p className="text-sm text-gray-500 mt-1">
            You currently do not have any stores associated with your store owner account. Please contact the platform administrator to configure store ownership.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: List of Owned Stores */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Your Stores ({stores.length})
            </h2>

            <div className="space-y-3">
              {stores.map((store) => {
                const isSelected = selectedStore?.id === store.id;

                return (
                  <button
                    key={store.id}
                    onClick={() => {
                      setSelectedStore(store);
                      setPagination((p) => ({ ...p, page: 1 }));
                    }}
                    className={`w-full text-left p-5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-blue-50/60 border-blue-400 shadow-sm ring-1 ring-blue-300'
                        : 'bg-white border-gray-200 hover:border-gray-300 shadow-xs'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug truncate max-w-[200px]">
                        {store.name}
                      </h3>
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>

                    <p className="text-xs text-gray-500 mt-1 truncate">{store.address}</p>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      {(store.overallRating ?? store.averageRating) != null ? (
                        <div className="flex items-center space-x-1.5">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                          <span className="text-sm font-bold text-gray-900">{store.overallRating ?? store.averageRating}</span>
                          <span className="text-xs text-gray-400">({store.totalRatings} reviews)</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">No ratings yet</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Customer Reviews for Selected Store */}
          <div className="lg:col-span-2">
            {selectedStore && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Store Header Details */}
                <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                      Store Details
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedStore.name}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{selectedStore.address}</p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-3 sm:text-right">
                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                      <Star className="w-5 h-5 fill-yellow-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">Average Score</p>
                      <p className="text-lg font-extrabold text-gray-900">
                        {(selectedStore.overallRating ?? selectedStore.averageRating) != null
                          ? `${selectedStore.overallRating ?? selectedStore.averageRating} / 5`
                          : 'Not Rated'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center">
                      <MessageSquare className="w-4 h-4 text-blue-600 mr-2" />
                      Customer Submissions ({pagination.total})
                    </h3>
                  </div>

                  {loadingRatings ? (
                    <div className="py-12">
                      <LoadingSpinner message="Loading customer reviews..." />
                    </div>
                  ) : ratings.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-xl border-gray-200">
                      <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-700">No ratings submitted yet</p>
                      <p className="text-xs text-gray-400 mt-1">
                        When customers rate this store, their details and scores will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ratings.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="p-1.5 bg-gray-100 text-gray-600 rounded-full">
                                <User className="w-4 h-4" />
                              </div>
                              <span className="font-semibold text-sm text-gray-900">{rev.user.name}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <StarRating value={rev.rating} size="sm" />
                              <span className="text-sm font-bold text-yellow-900 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
                                {rev.rating} / 5
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1.5">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <span>{rev.user.email}</span>
                            </div>
                            {rev.user.address && (
                              <div className="flex items-center space-x-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                <span className="truncate max-w-xs">{rev.user.address}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1.5 ml-auto">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Pagination */}
                      {pagination.totalPages > 1 && (
                        <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Page {pagination.page} of {pagination.totalPages}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                              disabled={pagination.page <= 1}
                              className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-40"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() =>
                                setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))
                              }
                              disabled={pagination.page >= pagination.totalPages}
                              className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-40"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
