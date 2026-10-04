import axios from 'axios';
import { ApiResponse, User, Store, RatingReview, Pagination } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials);
    return res.data;
  },

  register: async (payload: { name: string; email: string; password: string; address?: string }) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', payload);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data;
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const res = await api.post<ApiResponse<{ message: string }>>('/auth/change-password', payload);
    return res.data;
  },

  logout: async () => {
    const res = await api.post<ApiResponse<{ message: string }>>('/auth/logout');
    return res.data;
  },
};

export const storeApi = {
  getStores: async (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) => {
    const res = await api.get<ApiResponse<{ stores: Store[]; pagination: Pagination }>>('/stores', { params });
    return res.data;
  },

  getStoreById: async (id: string) => {
    const res = await api.get<ApiResponse<{ store: Store }>>(`/stores/${id}`);
    return res.data;
  },
};

export const ratingApi = {
  submitRating: async (payload: { storeId: string; rating: number }) => {
    const res = await api.post<ApiResponse<{ rating: any; storeStats: any }>>('/ratings', payload);
    return res.data;
  },

  getMyRating: async (storeId: string) => {
    const res = await api.get<ApiResponse<{ rating: number | null }>>(`/ratings/${storeId}`);
    return res.data;
  },
};

export const adminApi = {
  getDashboard: async () => {
    const res = await api.get<ApiResponse<{ totalUsers: number; totalStores: number; totalRatings: number }>>('/admin/dashboard');
    return res.data;
  },

  getUsers: async (params?: { page?: number; limit?: number; search?: string; role?: string; sortBy?: string; sortOrder?: string }) => {
    const res = await api.get<ApiResponse<{ users: User[]; pagination: Pagination }>>('/admin/users', { params });
    return res.data;
  },

  createUser: async (payload: { name: string; email: string; password: string; role: string; address?: string }) => {
    const res = await api.post<ApiResponse<{ user: User }>>('/admin/users', payload);
    return res.data;
  },

  getUserDetails: async (id: string) => {
    const res = await api.get<ApiResponse<{ user: User & { stores?: any[] } }>>(`/admin/users/${id}`);
    return res.data;
  },

  getStores: async (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) => {
    const res = await api.get<ApiResponse<{ stores: Store[]; pagination: Pagination }>>('/admin/stores', { params });
    return res.data;
  },

  createStore: async (payload: { name: string; email: string; address: string; ownerId?: string | null }) => {
    const res = await api.post<ApiResponse<{ store: Store }>>('/admin/stores', payload);
    return res.data;
  },

  deleteUser: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/admin/users/${id}`);
    return res.data;
  },

  deleteStore: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/admin/stores/${id}`);
    return res.data;
  },

  deleteRating: async (id: string) => {
    const res = await api.delete<ApiResponse<{ storeId: string; totalRatings: number; overallRating: number | null }>>(`/admin/ratings/${id}`);
    return res.data;
  },

  resetUserPassword: async (id: string, payload?: { password?: string }) => {
    const res = await api.post<ApiResponse<{ temporaryPassword: string; user: { id: string; name: string; email: string; role: string } }>>(`/admin/users/${id}/reset-password`, payload || {});
    return res.data;
  },
};

export const ownerApi = {
  getStores: async () => {
    const res = await api.get<ApiResponse<{ stores: Store[] }>>('/owner/stores');
    return res.data;
  },

  getStoreRatings: async (storeId: string, params?: { page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<{ store: any; ratings: RatingReview[]; pagination: Pagination }>>(`/owner/stores/${storeId}/ratings`, { params });
    return res.data;
  },
};

export default api;
