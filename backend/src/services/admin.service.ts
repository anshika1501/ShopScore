import bcrypt from 'bcrypt';
import { Role, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import {
  AdminCreateUserInput,
  AdminCreateStoreInput,
  UserListQueryInput,
  StoreListQueryInput,
} from '../validators/admin.validator';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/errors';

export class AdminService {
  /**
   * Get platform totals: users, stores, submitted ratings
   */
  async getDashboardStats() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    return {
      totalUsers,
      totalStores,
      totalRatings,
    };
  }

  /**
   * List users with search, role filter, sorting, and pagination
   */
  async getUsers(query: UserListQueryInput) {
    const { page, limit, search, role, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role;
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { address: { contains: term, mode: 'insensitive' } },
      ];
    }

    // Whitelist sort fields
    const validSortFields: Record<string, boolean> = {
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
    };
    const orderField = validSortFields[sortBy] ? sortBy : 'createdAt';
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [orderField]: sortOrder === 'asc' ? 'asc' : 'desc',
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          address: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Create admin or store owner or normal user from admin portal
   */
  async createUser(data: AdminCreateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError('An account with this email address already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: passwordHash,
        role: data.role,
        address: data.address || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * View user details. If store owner, show associated store rating(s).
   */
  async getUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        createdAt: true,
        ownedStores: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            createdAt: true,
            ratings: {
              select: {
                rating: true,
              },
            },
          },
        },
        ratings: {
          select: {
            id: true,
            rating: true,
            createdAt: true,
            store: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Process owned store stats if user is a STORE_OWNER
    let storeDetails = null;
    if (user.role === Role.STORE_OWNER) {
      storeDetails = user.ownedStores.map((store) => {
        const count = store.ratings.length;
        const sum = store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        const overallRating = count > 0 ? Number((sum / count).toFixed(2)) : null;

        return {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          createdAt: store.createdAt,
          totalRatings: count,
          overallRating,
          averageRating: overallRating, // null represents "Not rated"
        };
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
      createdAt: user.createdAt,
      stores: storeDetails,
      ratings: user.ratings || [],
    };
  }

  /**
   * Create store and associate with a STORE_OWNER
   */
  async createStore(data: AdminCreateStoreInput) {
    if (data.ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: data.ownerId },
      });

      if (!owner) {
        throw new BadRequestError('Assigned store owner was not found');
      }

      if (owner.role !== Role.STORE_OWNER) {
        throw new BadRequestError('Assigned user must have the STORE_OWNER role');
      }
    }

    const store = await prisma.store.create({
      data: {
        name: data.name,
        email: data.email,
        address: data.address,
        ownerId: data.ownerId || null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      createdAt: store.createdAt,
      owner: store.owner,
      overallRating: null,
      averageRating: null,
      totalRatings: 0,
    };
  }

  /**
   * List stores for Admin with overall rating, search, sorting, and pagination
   */
  async getStores(query: StoreListQueryInput) {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StoreWhereInput = {};

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { address: { contains: term, mode: 'insensitive' } },
      ];
    }

    const validSortFields: Record<string, boolean> = {
      name: true,
      email: true,
      address: true,
      createdAt: true,
    };
    const orderField = validSortFields[sortBy] ? sortBy : 'createdAt';
    const orderBy: Prisma.StoreOrderByWithRelationInput = {
      [orderField]: sortOrder === 'asc' ? 'asc' : 'desc',
    };

    const [total, stores] = await Promise.all([
      prisma.store.count({ where }),
      prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          ratings: {
            select: {
              rating: true,
            },
          },
        },
      }),
    ]);

    const formattedStores = stores.map((s) => {
      const count = s.ratings.length;
      const sum = s.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const overallRating = count > 0 ? Number((sum / count).toFixed(2)) : null;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        createdAt: s.createdAt,
        owner: s.owner,
        totalRatings: count,
        overallRating,
        averageRating: overallRating,
      };
    });

    return {
      stores: formattedStores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Delete user account with integrity protections:
   * - Cannot delete currently logged-in admin
   * - Cannot delete the last remaining admin account
   * - Safely cleans up relations using transaction
   */
  async deleteUser(userId: string, currentAdminId: string) {
    if (userId === currentAdminId) {
      throw new BadRequestError('You cannot delete your own admin account');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedStores: { select: { id: true } },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role === Role.ADMIN) {
      const adminCount = await prisma.user.count({
        where: { role: Role.ADMIN },
      });
      if (adminCount <= 1) {
        throw new BadRequestError('Cannot delete the last remaining administrator account');
      }
    }

    // Atomic transaction
    await prisma.$transaction(async (tx) => {
      // If store owner, unlink stores (set ownerId to null)
      if (user.ownedStores.length > 0) {
        await tx.store.updateMany({
          where: { ownerId: userId },
          data: { ownerId: null },
        });
      }

      // Delete ratings submitted by this user (cascade will also handle this, but explicit in tx)
      await tx.rating.deleteMany({
        where: { userId },
      });

      // Delete the user record
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return { message: `User "${user.name}" was successfully deleted` };
  }

  /**
   * Delete store and all its associated ratings in an atomic transaction
   */
  async deleteStore(storeId: string) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    await prisma.$transaction(async (tx) => {
      // Delete ratings associated with the store
      await tx.rating.deleteMany({
        where: { storeId },
      });

      // Delete the store
      await tx.store.delete({
        where: { id: storeId },
      });
    });

    return { message: `Store "${store.name}" was successfully deleted` };
  }

  /**
   * Delete a specific rating / review and return updated store stats
   */
  async deleteRating(ratingId: string) {
    const rating = await prisma.rating.findUnique({
      where: { id: ratingId },
    });

    if (!rating) {
      throw new NotFoundError('Rating not found');
    }

    const storeId = rating.storeId;

    await prisma.rating.delete({
      where: { id: ratingId },
    });

    // Recompute store ratings stats
    const remainingRatings = await prisma.rating.findMany({
      where: { storeId },
      select: { rating: true },
    });

    const count = remainingRatings.length;
    const sum = remainingRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const overallRating = count > 0 ? Number((sum / count).toFixed(2)) : null;

    return {
      message: 'Rating was successfully deleted',
      storeStats: {
        storeId,
        totalRatings: count,
        overallRating,
        averageRating: overallRating,
      },
    };
  }

  /**
   * Admin-controlled password reset for normal users and store owners.
   * If custom password not provided, generates a secure random temporary password.
   */
  async resetUserPassword(targetUserId: string, customPassword?: string) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Determine temporary password
    let temporaryPassword = customPassword;
    if (!temporaryPassword) {
      // Generate a compliant random password (8-16 chars, 1 uppercase, 1 special char)
      const randomPart = Math.random().toString(36).substring(2, 8); // 6 chars
      temporaryPassword = `Tmp@${randomPart.toUpperCase()}1`;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(temporaryPassword, saltRounds);

    await prisma.user.update({
      where: { id: targetUserId },
      data: { password: passwordHash },
    });

    return {
      message: `Password for ${user.name} (${user.email}) has been reset successfully`,
      temporaryPassword,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

export const adminService = new AdminService();

