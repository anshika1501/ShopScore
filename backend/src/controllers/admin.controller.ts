import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';

export class AdminController {
  async getDashboardStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req as any).validatedQuery || req.query;
      const result = await adminService.getUsers(query);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await adminService.createUser(req.body);
      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user },
      });
    } catch (error) {
      return next(error);
    }
  }

  async getUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await adminService.getUserDetails(req.params.id as string);
      return res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      return next(error);
    }
  }

  async getStores(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req as any).validatedQuery || req.query;
      const result = await adminService.getStores(query);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async createStore(req: Request, res: Response, next: NextFunction) {
    try {
      const store = await adminService.createStore(req.body);
      return res.status(201).json({
        success: true,
        message: 'Store created successfully',
        data: { store },
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const currentAdminId = req.user!.id;
      const targetUserId = req.params.id as string;
      const result = await adminService.deleteUser(targetUserId, currentAdminId);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteStore(req: Request, res: Response, next: NextFunction) {
    try {
      const targetStoreId = req.params.id as string;
      const result = await adminService.deleteStore(targetStoreId);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteRating(req: Request, res: Response, next: NextFunction) {
    try {
      const targetRatingId = req.params.id as string;
      const result = await adminService.deleteRating(targetRatingId);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.storeStats,
      });
    } catch (error) {
      return next(error);
    }
  }

  async resetUserPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const targetUserId = req.params.id as string;
      const { password } = req.body || {};
      const result = await adminService.resetUserPassword(targetUserId, password);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          temporaryPassword: result.temporaryPassword,
          user: result.user,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const adminController = new AdminController();

