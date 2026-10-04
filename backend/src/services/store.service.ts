import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { StoreBrowseQueryInput } from '../validators/store.validator';
import { NotFoundError } from '../utils/errors';

export class StoreService {
  /**
   * Browse stores with search, sort, pagination, overall rating, and optional user submitted rating
   */
  async getStores(query: StoreBrowseQueryInput, currentUserId?: string) {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StoreWhereInput = {};

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { address: { contains: term, mode: 'insensitive' } },
      ];
    }

    const validSortFields: Record<string, boolean> = {
      name: true,
      address: true,
      createdAt: true,
    };
    const orderField = validSortFields[sortBy] ? sortBy : 'createdAt';
    const orderBy: Prisma.StoreOrderByWithRelationInput = {
      [orderField]: sortOrder === 'asc' ? 'asc' : 'desc',
    };

    const [total, stores] = await Promise.all([
      prisma.store.count({ where }),
      prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          ratings: {
            select: {
              rating: true,
              userId: true,
            },
          },
        },
      }),
    ]);

    const formattedStores = stores.map((s) => {
      const count = s.ratings.length;
      const sum = s.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const overallRating = count > 0 ? Number((sum / count).toFixed(2)) : null;

      // Find current user's rating if logged in
      let myRating: number | null = null;
      if (currentUserId) {
        const found = s.ratings.find((r) => r.userId === currentUserId);
        if (found) {
          myRating = found.rating;
        }
      }

      return {
        id: s.id,
        name: s.name,
        address: s.address,
        email: s.email,
        createdAt: s.createdAt,
        totalRatings: count,
        overallRating, // null if no ratings
        myRating,      // null if unauthenticated or not yet rated
      };
    });

    return {
      stores: formattedStores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get store by ID with overall rating and user's rating
   */
  async getStoreById(storeId: string, currentUserId?: string) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        ratings: {
          select: {
            rating: true,
            userId: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    const count = store.ratings.length;
    const sum = store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const overallRating = count > 0 ? Number((sum / count).toFixed(2)) : null;

    let myRating: number | null = null;
    if (currentUserId) {
      const found = store.ratings.find((r) => r.userId === currentUserId);
      if (found) {
        myRating = found.rating;
      }
    }

    return {
      id: store.id,
      name: store.name,
      address: store.address,
      email: store.email,
      createdAt: store.createdAt,
      totalRatings: count,
      overallRating,
      myRating,
    };
  }
}

export const storeService = new StoreService();
