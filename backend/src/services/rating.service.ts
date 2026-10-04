import { prisma } from '../config/prisma';
import { RatingSubmitInput } from '../validators/store.validator';
import { NotFoundError } from '../utils/errors';

export class RatingService {
  /**
   * Submit or update a user's rating for a store (1-5 inclusive)
   */
  async upsertRating(userId: string, data: RatingSubmitInput) {
    const { storeId, rating } = data;

    // Verify store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    // Atomically upsert using composite unique key [userId, storeId]
    const savedRating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      update: {
        rating,
      },
      create: {
        userId,
        storeId,
        rating,
      },
    });

    // Compute updated store overall rating
    const storeRatings = await prisma.rating.findMany({
      where: { storeId },
      select: { rating: true },
    });

    const count = storeRatings.length;
    const sum = storeRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const overallRating = count > 0 ? Number((sum / count).toFixed(2)) : null;

    return {
      rating: savedRating,
      storeStats: {
        storeId,
        totalRatings: count,
        overallRating,
        averageRating: overallRating,
      },
    };
  }

  /**
   * Get user's rating for a specific store
   */
  async getUserRatingForStore(userId: string, storeId: string) {
    const record = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    return record ? record.rating : null;
  }
}

export const ratingService = new RatingService();
