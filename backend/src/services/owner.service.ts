import { prisma } from '../config/prisma';
import { OwnerRatingsQueryInput } from '../validators/store.validator';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class OwnerService {
  /**
   * Get all stores owned by the authenticated STORE_OWNER with ratings performance
   */
  async getOwnedStores(ownerId: string) {
    const stores = await prisma.store.findMany({
      where: { ownerId },
      include: {
        ratings: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return stores.map((s) => {
      const count = s.ratings.length;
      const sum = s.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const overallRating = count > 0 ? Number((sum / count).toFixed(2)) : null;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        createdAt: s.createdAt,
        totalRatings: count,
        overallRating,
        averageRating: overallRating,
      };
    });
  }

  /**
   * Get ratings submitted for a specific store owned by the caller.
   * Strictly enforces data isolation.
   */
  async getStoreRatings(ownerId: string, storeId: string, query: OwnerRatingsQueryInput) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    // Strict store-owner data isolation check
    if (store.ownerId !== ownerId) {
      throw new ForbiddenError('Access denied: You do not have permission to view ratings for this store');
    }

    const where = { storeId };

    const [total, ratings] = await Promise.all([
      prisma.rating.count({ where }),
      prisma.rating.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              address: true,
            },
          },
        },
      }),
    ]);

    const formattedRatings = ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        address: r.user.address,
      },
    }));

    return {
      store: {
        id: store.id,
        name: store.name,
        address: store.address,
      },
      ratings: formattedRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

export const ownerService = new OwnerService();
