import { z } from 'zod';
import { Role } from '@prisma/client';

const passwordValidation = z
  .string()
  .min(8, 'Password must be between 8 and 16 characters')
  .max(16, 'Password must be between 8 and 16 characters')
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(val), {
    message: 'Password must contain at least one special character',
  });

export const adminCreateUserSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be between 2 and 60 characters')
    .max(60, 'Name must be between 2 and 60 characters')
    .regex(
      /^[a-zA-Z\s\-']+$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
  password: passwordValidation,
  role: z.nativeEnum(Role, { required_error: 'Role is required' }),
  address: z
    .string()
    .trim()
    .min(5, 'Address must be between 5 and 200 characters')
    .max(200, 'Address must be between 5 and 200 characters')
    .regex(/^[a-zA-Z0-9\s,.\-#/']+$/, 'Address contains invalid characters')
    .optional(),
});

export const adminCreateStoreSchema = z.object({
  name: z
    .string({ required_error: 'Store name is required' })
    .trim()
    .min(2, 'Store name must be between 2 and 100 characters')
    .max(100, 'Store name must be between 2 and 100 characters')
    .regex(
      /^[a-zA-Z0-9\s\-'.&,!#]+$/,
      'Store name contains invalid characters'
    ),
  email: z
    .string({ required_error: 'Store email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
  address: z
    .string({ required_error: 'Store address is required' })
    .trim()
    .min(5, 'Store address must be between 5 and 200 characters')
    .max(200, 'Store address must be between 5 and 200 characters')
    .regex(/^[a-zA-Z0-9\s,.\-#/']+$/, 'Store address contains invalid characters'),
  ownerId: z.string().uuid('Invalid owner ID format').optional().nullable(),
});

export const userListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
  search: z.string().trim().optional(),
  role: z.nativeEnum(Role).optional(),
  sortBy: z
    .enum(['name', 'email', 'address', 'role', 'createdAt'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const storeListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
  search: z.string().trim().optional(),
  sortBy: z
    .enum(['name', 'email', 'address', 'createdAt'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const adminResetUserPasswordSchema = z.object({
  password: passwordValidation.optional(),
});

export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
export type AdminCreateStoreInput = z.infer<typeof adminCreateStoreSchema>;
export type AdminResetUserPasswordInput = z.infer<typeof adminResetUserPasswordSchema>;
export type UserListQueryInput = z.infer<typeof userListQuerySchema>;
export type StoreListQueryInput = z.infer<typeof storeListQuerySchema>;

