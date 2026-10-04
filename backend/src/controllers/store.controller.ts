import { Request, Response, NextFunction } from 'express';
import { storeService } from '../services/store.service';

export class StoreController {
  async getStores(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req as any).validatedQuery || req.query;
      const currentUserId = req.user?.id;
      const result = await storeService.getStores(query, currentUserId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getStoreById(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.id as string;
      const currentUserId = req.user?.id;
      const store = await storeService.getStoreById(storeId, currentUserId);
      return res.status(200).json({
        success: true,
        data: { store },
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const storeController = new StoreController();
