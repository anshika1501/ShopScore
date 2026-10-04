import { Router } from 'express';
import { storeController } from '../controllers/store.controller';
import { optionalAuth } from '../middleware/auth';
import { validateQuery } from '../middleware/validate';
import { storeBrowseQuerySchema } from '../validators/store.validator';

const router = Router();

// Stores can be browsed publicly or by logged-in users
router.use(optionalAuth);

router.get('/', validateQuery(storeBrowseQuerySchema), storeController.getStores);
router.get('/:id', storeController.getStoreById);

export default router;
