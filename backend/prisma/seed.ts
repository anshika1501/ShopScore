import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from global root .env
const envPaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ShopScore database...');

  // Admin credentials from environment variables (fallback to default)
  const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@shopscore.com').trim().toLowerCase();
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'ChangeMe@123';

  // Hash seed passwords
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  const ownerPasswordHash = await bcrypt.hash('Owner@12345', 10);
  const userPasswordHash = await bcrypt.hash('User@12345', 10);

  // 1. Seed Administrator User (Preserves existing password on subsequent runs)
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {}, // Empty update ensures idempotency: does not overwrite if already exists
    create: {
      email: adminEmail,
      name: 'ShopScore Administrator Lead',
      password: adminPasswordHash,
      role: Role.ADMIN,
      address: '100 Enterprise Boulevard, Suite 500, Tech City',
    },
  });
  console.log(`✓ Admin user: ${admin.email}`);

  // 2. Seed Store Owner User
  const storeOwner = await prisma.user.upsert({
    where: { email: 'owner@shopscore.com' },
    update: {},
    create: {
      email: 'owner@shopscore.com',
      name: 'Retail Store Operations Owner',
      password: ownerPasswordHash,
      role: Role.STORE_OWNER,
      address: '250 Market Square, Unit 4B, Commercial District',
    },
  });
  console.log(`✓ Store owner user: ${storeOwner.email}`);

  // 3. Seed Normal Demo Users
  const user1 = await prisma.user.upsert({
    where: { email: 'alice.shopper@example.com' },
    update: {},
    create: {
      email: 'alice.shopper@example.com',
      name: 'Alice Catherine Shopper Customer',
      password: userPasswordHash,
      role: Role.USER,
      address: '12 Blossom Terrace, Suburbia, Metro State',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob.reviewer@example.com' },
    update: {},
    create: {
      email: 'bob.reviewer@example.com',
      name: 'Robert Benjamin Reviewer Customer',
      password: userPasswordHash,
      role: Role.USER,
      address: '44 Hilltop Avenue, Highland Park, Metro State',
    },
  });
  console.log(`✓ Normal users: ${user1.email}, ${user2.email}`);

  // 4. Seed Stores (associated with storeOwner)
  const store1 = await prisma.store.upsert({
    where: { id: '11111111-1111-1111-1111-111111111111' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Downtown Prime Electronics Hub',
      email: 'contact@downtownelectronics.com',
      address: '789 High Street, Commercial Zone, City Center',
      ownerId: storeOwner.id,
    },
  });

  const store2 = await prisma.store.upsert({
    where: { id: '22222222-2222-2222-2222-222222222222' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Green Valley Fresh Organic Market',
      email: 'hello@greenvalleymarket.com',
      address: '42 Eco Way, Greenfield Neighborhood, North District',
      ownerId: storeOwner.id,
    },
  });
  console.log(`✓ Stores created: ${store1.name}, ${store2.name}`);

  // 5. Seed Ratings (unique per userId & storeId)
  await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId: user1.id,
        storeId: store1.id,
      },
    },
    update: { rating: 5 },
    create: {
      userId: user1.id,
      storeId: store1.id,
      rating: 5,
    },
  });

  await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId: user2.id,
        storeId: store1.id,
      },
    },
    update: { rating: 4 },
    create: {
      userId: user2.id,
      storeId: store1.id,
      rating: 4,
    },
  });

  await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId: user1.id,
        storeId: store2.id,
      },
    },
    update: { rating: 4 },
    create: {
      userId: user1.id,
      storeId: store2.id,
      rating: 4,
    },
  });
  console.log('✓ Sample ratings seeded successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
