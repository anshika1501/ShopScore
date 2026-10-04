import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { User, Store, Pagination } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { CreateUserModal } from '../../components/admin/CreateUserModal';
import { CreateStoreModal } from '../../components/admin/CreateStoreModal';
import { UserDetailsModal } from '../../components/admin/UserDetailsModal';
import {
  Users,
  Store as StoreIcon,
  Star,
  Plus,
  Search,
  Filter,
  Eye,
  ArrowUpDown,
  Building2,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'stores'>('overview');

  useEffect(() => {
    if (location.pathname.includes('/users')) {
      setActiveTab('users');
    } else if (location.pathname.includes('/stores')) {
      setActiveTab('stores');
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  // Stats
  const [stats, setStats] = useState<{ totalUsers: number; totalStores: number; totalRatings: number } | null>(null);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [userPagination, setUserPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('');
  const [userSortBy, setUserSortBy] = useState('createdAt');
  const [userSortOrder, setUserSortOrder] = useState('desc');

  // Stores state
  const [stores, setStores] = useState<Store[]>([]);
  const [storePagination, setStorePagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('createdAt');
  const [storeSortOrder, setStoreSortOrder] = useState('desc');

  // Available store owners for store creation
  const [storeOwners, setStoreOwners] = useState<User[]>([]);

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Global loading and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await adminApi.getDashboard();
      setStats(res.data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      const res = await adminApi.getUsers({
        page: userPagination.page,
        limit: userPagination.limit,
        search: userSearch.trim() || undefined,
        role: userRoleFilter || undefined,
        sortBy: userSortBy,
        sortOrder: userSortOrder,
      });
      setUsers(res.data.users);
      setUserPagination(res.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users list.');
    }
  }, [userPagination.page, userPagination.limit, userSearch, userRoleFilter, userSortBy, userSortOrder]);

  const fetchStores = useCallback(async () => {
    try {
      const res = await adminApi.getStores({
        page: storePagination.page,
        limit: storePagination.limit,
        search: storeSearch.trim() || undefined,
        sortBy: storeSortBy,
        sortOrder: storeSortOrder,
      });
      setStores(res.data.stores);
      setStorePagination(res.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load stores list.');
    }
  }, [storePagination.page, storePagination.limit, storeSearch, storeSortBy, storeSortOrder]);

  const fetchStoreOwners = async () => {
    try {
      const res = await adminApi.getUsers({ role: 'STORE_OWNER', limit: 100 });
      setStoreOwners(res.data.users);
    } catch (err) {
      console.error('Failed to load store owners list', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchStores(), fetchStoreOwners()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, fetchUsers]);

  useEffect(() => {
    if (activeTab === 'stores') fetchStores();
  }, [activeTab, fetchStores]);

  const handleOpenUserDetails = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailsModalOpen(true);
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Platform overview, user accounts, and registered stores</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsUserModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add User
          </button>
          <button
            onClick={() => setIsStoreModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            <Building2 className="w-4 h-4 mr-1.5 text-purple-600" />
            Add Store
          </button>
        </div>
      </div>

      {successToast && (
        <div className="mb-6">
          <Alert type="success" message={successToast} onClose={() => setSuccessToast(null)} />
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'users'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Management ({userPagination.total})
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'stores'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Store Management ({storePagination.total})
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="py-16">
          <LoadingSpinner message="Loading administration data..." />
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Users</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats?.totalUsers || 0}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <StoreIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registered Stores</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats?.totalStores || 0}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                    <Star className="w-8 h-8 fill-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Ratings Submitted</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats?.totalRatings || 0}</p>
                  </div>
                </div>
              </div>

              {/* Quick Summary Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Recent Users</h3>
                    <button onClick={() => setActiveTab('users')} className="text-xs font-semibold text-purple-600 hover:text-purple-700">
                      View all &rarr;
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {users.slice(0, 5).map((u) => (
                      <div key={u.id} className="py-3 flex justify-between items-center text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : u.role === 'STORE_OWNER' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Recent Stores</h3>
                    <button onClick={() => setActiveTab('stores')} className="text-xs font-semibold text-purple-600 hover:text-purple-700">
                      View all &rarr;
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {stores.slice(0, 5).map((s) => (
                      <div key={s.id} className="py-3 flex justify-between items-center text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.address}</p>
                        </div>
                        <span className="text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                          {s.overallRating ? `★ ${s.overallRating}` : 'Not rated'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Filter & Search Bar */}
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    placeholder="Search by name, email, or address..."
                    className="block w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <select
                      value={userRoleFilter}
                      onChange={(e) => {
                        setUserRoleFilter(e.target.value);
                        setUserPagination((prev) => ({ ...prev, page: 1 }));
                      }}
                      className="block w-full sm:w-auto pl-9 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">All Roles</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="STORE_OWNER">STORE_OWNER</option>
                      <option value="USER">USER</option>
                    </select>
                  </div>

                  <div className="relative w-full sm:w-auto">
                    <ArrowUpDown className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <select
                      value={`${userSortBy}-${userSortOrder}`}
                      onChange={(e) => {
                        const [col, order] = e.target.value.split('-');
                        setUserSortBy(col);
                        setUserSortOrder(order);
                      }}
                      className="block w-full sm:w-auto pl-9 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="email-asc">Email (A-Z)</option>
                      <option value="role-asc">Role</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Address</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          No users found matching current filters.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                          <td className="px-6 py-4 text-gray-600">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                : u.role === 'STORE_OWNER'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : 'bg-green-100 text-green-800 border-green-200'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{u.address || '—'}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleOpenUserDetails(u.id)}
                              className="inline-flex items-center text-xs font-semibold text-purple-600 hover:text-purple-800 p-1.5 hover:bg-purple-50 rounded-lg transition"
                              title="View User Details"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* User Pagination */}
              {userPagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Showing {(userPagination.page - 1) * userPagination.limit + 1} to{' '}
                    {Math.min(userPagination.page * userPagination.limit, userPagination.total)} of{' '}
                    {userPagination.total} users
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUserPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                      disabled={userPagination.page <= 1}
                      className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-xs px-2 py-1 font-semibold text-gray-600">
                      {userPagination.page} / {userPagination.totalPages}
                    </span>
                    <button
                      onClick={() => setUserPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                      disabled={userPagination.page >= userPagination.totalPages}
                      className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STORE MANAGEMENT */}
          {activeTab === 'stores' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Store Filter Bar */}
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={storeSearch}
                    onChange={(e) => {
                      setStoreSearch(e.target.value);
                      setStorePagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    placeholder="Search by store name or address..."
                    className="block w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="relative w-full sm:w-auto">
                  <ArrowUpDown className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <select
                    value={`${storeSortBy}-${storeSortOrder}`}
                    onChange={(e) => {
                      const [col, order] = e.target.value.split('-');
                      setStoreSortBy(col);
                      setStoreSortOrder(order);
                    }}
                    className="block w-full sm:w-auto pl-9 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="address-asc">Address</option>
                  </select>
                </div>
              </div>

              {/* Stores Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Store Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Address</th>
                      <th className="px-6 py-3">Owner</th>
                      <th className="px-6 py-3">Overall Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stores.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          No stores registered or matching search.
                        </td>
                      </tr>
                    ) : (
                      stores.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">{s.name}</td>
                          <td className="px-6 py-4 text-gray-600">{s.email}</td>
                          <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{s.address}</td>
                          <td className="px-6 py-4 text-gray-700">
                            {s.owner ? (
                              <span className="font-medium text-blue-700">{s.owner.name}</span>
                            ) : (
                              <span className="text-gray-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {s.overallRating !== null ? (
                              <span className="inline-flex items-center text-xs font-bold text-yellow-800 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500 mr-1" />
                                {s.overallRating} ({s.totalRatings})
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium">Not rated</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Store Pagination */}
              {storePagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Showing {(storePagination.page - 1) * storePagination.limit + 1} to{' '}
                    {Math.min(storePagination.page * storePagination.limit, storePagination.total)} of{' '}
                    {storePagination.total} stores
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStorePagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                      disabled={storePagination.page <= 1}
                      className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-xs px-2 py-1 font-semibold text-gray-600">
                      {storePagination.page} / {storePagination.totalPages}
                    </span>
                    <button
                      onClick={() => setStorePagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                      disabled={storePagination.page >= storePagination.totalPages}
                      className="px-3 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Admin Modals */}
      <CreateUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSuccess={() => {
          fetchStats();
          fetchUsers();
          fetchStoreOwners();
          triggerToast('New user account created successfully.');
        }}
      />

      <CreateStoreModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        storeOwners={storeOwners}
        onSuccess={() => {
          fetchStats();
          fetchStores();
          triggerToast('New store successfully created and assigned.');
        }}
      />

      <UserDetailsModal
        userId={selectedUserId}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
};
