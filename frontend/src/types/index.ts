export type Role = 'ADMIN' | 'USER' | 'STORE_OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  address?: string | null;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  createdAt: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  } | null;
  overallRating: number | null;
  averageRating?: number | null;
  totalRatings: number;
  myRating?: number | null;
}

export interface RatingReview {
  id: string;
  rating: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    address?: string | null;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  details?: Record<string, string>;
}
