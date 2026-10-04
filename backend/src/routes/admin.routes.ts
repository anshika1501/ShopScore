import { Router } from 'express';
import { Role } from '@prisma/client';
import { adminController } from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import {
  adminCreateUserSchema,
  adminCreateStoreSchema,
  userListQuerySchema,
  storeListQuerySchema,
} from '../validators/admin.validator';

const router = Router();

// All admin routes require ADMIN role authorization
router.use(requireAuth, requireRole(Role.ADMIN));

router.get('/dashboard', adminController.getDashboardStats);

router.get('/users', validateQuery(userListQuerySchema), adminController.getUsers);
router.post('/users', validate(adminCreateUserSchema), adminController.createUser);
router.get('/users/:id', adminController.getUserDetails);
router.delete('/users/:id', adminController.deleteUser);

router.get('/stores', validateQuery(storeListQuerySchema), adminController.getStores);
router.post('/stores', validate(adminCreateStoreSchema), adminController.createStore);
router.delete('/stores/:id', adminController.deleteStore);

router.delete('/ratings/:id', adminController.deleteRating);

export default router;
