import { Request, Response, NextFunction } from 'express';
import { ratingService } from '../services/rating.service';

export class RatingController {
  async upsertRating(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await ratingService.upsertRating(userId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Rating submitted successfully',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getMyRating(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const storeId = req.params.storeId as string;
      const rating = await ratingService.getUserRatingForStore(userId, storeId);
      return res.status(200).json({
        success: true,
        data: { rating },
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const ratingController = new RatingController();
