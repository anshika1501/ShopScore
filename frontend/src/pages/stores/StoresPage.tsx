import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Pagination } from '../../types';
import { storeApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StarRating } from '../../components/stores/StarRating';
import { RatingModal } from '../../components/stores/RatingModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { Search, Store as StoreIcon, MapPin, Mail, Edit3, PlusCircle, ArrowUpDown } from 'lucide-react';

export const StoresPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stores, setStores] = useState<Store[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rating modal state
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 350);

    return () => clearTimeout(handler);
  }, [search]);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await storeApi.getStores({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch.trim() || undefined,
        sortBy,
        sortOrder,
      });

      setStores(res.data.stores);
      setPagination(res.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load stores. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleOpenRating = (store: Store) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedStore(store);
    setIsModalOpen(true);
  };

  const handleRatingSuccess = (_newRating: number) => {
    setToastMessage(`Your rating for "${selectedStore?.name}" has been recorded!`);
    fetchStores();
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'name-asc') {
      setSortBy('name');
      setSortOrder('asc');
    } else if (val === 'name-desc') {
      setSortBy('name');
      setSortOrder('desc');
    } else if (val === 'address') {
      setSortBy('address');
      setSortOrder('asc');
    } else {
      setSortBy('createdAt');
      setSortOrder('desc');
    }
  };

  return (
    <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Explore Stores</h1>
          <p className="text-sm text-gray-600 mt-1">
            Discover community stores, check authentic customer ratings, and share your experience.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or address..."
              className="block w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 shadow-sm"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <select
              onChange={handleSortChange}
              value={`${sortBy}-${sortOrder}`}
              className="block w-full sm:w-auto pl-9 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 shadow-sm appearance-none"
            >
              <option value="createdAt-desc">Newest Stores</option>
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="address-asc">Address</option>
            </select>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="mb-6">
          <Alert type="success" message={toastMessage} onClose={() => setToastMessage(null)} />
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {/* Stores Grid */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner message="Loading registered stores..." />
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
          <div className="p-3 bg-gray-50 text-gray-400 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center">
            <StoreIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No stores found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {debouncedSearch
              ? `No registered stores match "${debouncedSearch}". Try a different name or address keyword.`
              : 'There are currently no stores registered on the platform.'}
          </p>
          {debouncedSearch && (
            <button
              onClick={() => setSearch('')}
              className="mt-4 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {stores.map((store) => {
            const overallScore = store.overallRating ?? store.averageRating;
            const hasOverallRating = overallScore != null;
            const hasMyRating = store.myRating !== null && store.myRating !== undefined;

            return (
              <div
                key={store.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  {/* Store Name & Overall Score Header */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight line-clamp-1">
                      {store.name}
                    </h2>
                  </div>

                  {/* Rating Badge */}
                  <div className="flex items-center space-x-2 mb-4">
                    {hasOverallRating ? (
                      <div className="flex items-center space-x-2 bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-200">
                        <StarRating value={overallScore} size="sm" />
                        <span className="text-sm font-bold text-yellow-900">{overallScore}</span>
                        <span className="text-xs text-gray-500 font-medium">
                          ({store.totalRatings} {store.totalRatings === 1 ? 'rating' : 'ratings'})
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600">
                        Not rated yet
                      </span>
                    )}
                  </div>

                  {/* Store Contact & Address Details */}
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs leading-relaxed line-clamp-2">{store.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs truncate">{store.email}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: User submitted rating status & action button */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase text-gray-400 tracking-wider">
                      Your Rating
                    </span>
                    {hasMyRating ? (
                      <div className="flex items-center space-x-1 mt-0.5">
                        <span className="text-sm font-bold text-green-700">
                          ★ {store.myRating} / 5
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 mt-0.5">Not rated</span>
                    )}
                  </div>

                  {/* Rating Action: Only USER or logged-out can interact */}
                  {user?.role === 'ADMIN' || user?.role === 'STORE_OWNER' ? (
                    <span className="text-xs text-gray-400 italic">Browsing view</span>
                  ) : (
                    <button
                      onClick={() => handleOpenRating(store)}
                      className={`inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition ${
                        hasMyRating
                          ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {hasMyRating ? (
                        <>
                          <Edit3 className="w-3.5 h-3.5 mr-1 text-green-600" />
                          Modify
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5 mr-1" />
                          Rate Store
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-semibold">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-semibold">{pagination.total}</span> stores
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page <= 1}
              className="px-3.5 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-sm font-semibold text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(prev.totalPages, prev.page + 1),
                }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="px-3.5 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Rating Submission / Modification Modal */}
      <RatingModal
        store={selectedStore}
        initialRating={selectedStore?.myRating}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRatingSuccess}
      />
    </div>
  );
};
