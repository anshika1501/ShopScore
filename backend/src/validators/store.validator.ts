import { z } from 'zod';

export const storeBrowseQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
  search: z.string().trim().optional(),
  sortBy: z.enum(['name', 'address', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const ratingSubmitSchema = z.object({
  storeId: z.string({ required_error: 'Store ID is required' }).min(1, 'Store ID cannot be empty'),
  rating: z
    .number({ required_error: 'Rating is required' })
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
});

export const ownerRatingsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
});

export type StoreBrowseQueryInput = z.infer<typeof storeBrowseQuerySchema>;
export type RatingSubmitInput = z.infer<typeof ratingSubmitSchema>;
export type OwnerRatingsQueryInput = z.infer<typeof ownerRatingsQuerySchema>;
