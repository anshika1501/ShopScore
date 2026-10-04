import { Request, Response, NextFunction } from 'express';
import { ownerService } from '../services/owner.service';

export class OwnerController {
  async getOwnedStores(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user!.id;
      const stores = await ownerService.getOwnedStores(ownerId);
      return res.status(200).json({
        success: true,
        data: { stores },
      });
    } catch (error) {
      return next(error);
    }
  }

  async getStoreRatings(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user!.id;
      const storeId = req.params.storeId as string;
      const query = (req as any).validatedQuery || req.query;
      const result = await ownerService.getStoreRatings(ownerId, storeId, query);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const ownerController = new OwnerController();
