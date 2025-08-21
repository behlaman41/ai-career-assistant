import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/app'),
  REDIS_URL: z.string().default('redis://localhost:6379/0'),
  S3_ENDPOINT: z.string().default('http://localhost:9000'),
  S3_ACCESS_KEY: z.string().default('minioadmin'),
  S3_SECRET_KEY: z.string().default('minioadmin'),
  S3_BUCKET: z.string().default('files'),
  JWT_SECRET: z.string().default('devsecret'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.coerce.number().optional(),
  EMAIL_FROM: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  RATE_LIMIT_WINDOW: z.string().default('15m'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  WEB_BASE_URL: z.string().default('http://localhost:3000'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }
  return result.data;
}
