import { afterAll, beforeAll, jest } from '@jest/globals';
import dotenv from 'dotenv';

import { EnvConfigSchema } from './src/config/EnvironmentConfig';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Validate the environment configuration
try {
  EnvConfigSchema.parse(process.env);
} catch (error) {
  console.error('Test environment configuration validation failed:', error);
  process.exit(1);
}

// Mock the config object
jest.mock('./src/config', () => ({
  envConfig: {
    nodeEnv: process.env.NODE_ENV,
    port: parseInt(process.env.PORT || '3001', 10),
    logLevel: process.env.LOG_LEVEL,
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    jwtSecret: process.env.JWT_SECRET,
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    },
    openaiApiKey: process.env.OPENAI_API_KEY,
    googleCloudProjectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    ffmpegPath: process.env.FFMPEG_PATH,
    s3BucketName: process.env.S3_BUCKET_NAME,
    enableNewCollaborationFeature: process.env.ENABLE_NEW_COLLABORATION_FEATURE === 'true',
    defaultLanguage: process.env.DEFAULT_LANGUAGE,
    enableCaching: process.env.ENABLE_CACHING === 'true',
    enableSsl: process.env.ENABLE_SSL === 'true',
    corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || [],
    logFilePath: process.env.LOG_FILE_PATH,
    maxConnections: parseInt(process.env.MAX_CONNECTIONS || '50', 10),
    cacheTtl: parseInt(process.env.CACHE_TTL || '60', 10),
  },
}));

// Global setup
beforeAll(() => {
  console.log('Setting up global test environment');
});

// Global teardown
afterAll(() => {
  console.log('Cleaning up global test environment');
});
