import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, changePasswordSchema } from '../validators/auth.validator';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected routes (any authenticated role)
router.get('/me', requireAuth, authController.getCurrentUser);
router.post('/change-password', requireAuth, validate(changePasswordSchema), authController.changePassword);
router.post('/logout', requireAuth, authController.logout);

export default router;
