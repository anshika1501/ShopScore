import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';

// Load environment variables from global root .env
const envPaths = [
  path.resolve(__dirname, '../../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z
    .string()
    .default('postgresql://shopscore:shopscore_secret@localhost:5432/shopscore_dev?schema=public'),
  JWT_SECRET: z.string().default('test_jwt_secret_key_minimum_length_shopscore'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  INITIAL_ADMIN_EMAIL: z.string().email().default('admin@shopscore.com'),
  INITIAL_ADMIN_PASSWORD: z.string().default('ChangeMe@123'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
