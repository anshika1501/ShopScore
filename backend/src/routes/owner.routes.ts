import { Router } from 'express';
import { Role } from '@prisma/client';
import { ownerController } from '../controllers/owner.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateQuery } from '../middleware/validate';
import { ownerRatingsQuerySchema } from '../validators/store.validator';

const router = Router();

// All owner routes require authenticated STORE_OWNER role
router.use(requireAuth, requireRole(Role.STORE_OWNER));

router.get('/stores', ownerController.getOwnedStores);
router.get('/stores/:storeId/ratings', validateQuery(ownerRatingsQuerySchema), ownerController.getStoreRatings);

export default router;
