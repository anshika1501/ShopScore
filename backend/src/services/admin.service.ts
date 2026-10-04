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
}

export const adminService = new AdminService();
