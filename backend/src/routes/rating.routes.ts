import { Router } from 'express';
import { Role } from '@prisma/client';
import { ratingController } from '../controllers/rating.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { ratingSubmitSchema } from '../validators/store.validator';

const router = Router();

// Rating operations are restricted to authenticated USER role
router.use(requireAuth, requireRole(Role.USER));

router.post('/', validate(ratingSubmitSchema), ratingController.upsertRating);
router.get('/:storeId', ratingController.getMyRating);

export default router;
