import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('Checking database connectivity...');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Loaded' : 'MISSING'}`);

  try {
    // Run simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ PostgreSQL is reachable and accepting queries!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Failed to connect to PostgreSQL.');
    console.error('Diagnostic error details:');
    console.error(error.message || error);
    console.log('\nTroubleshooting tips:');
    console.log('1. Ensure your PostgreSQL container is running: docker compose ps');
    console.log('2. Check backend/.env has the correct DATABASE_URL');
    console.log('3. Ensure port 5432 is mapped properly');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
