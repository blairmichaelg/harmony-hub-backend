// src/config/StorageConfig.ts

import { z } from 'zod';

import { getEnvVar } from '../utils/envUtils';

/**
 * Schema for S3 storage provider configuration
 */
const S3ProviderSchema = z.object({
  type: z.literal('s3').describe('Storage provider type'),
  bucket: z.string().describe('S3 bucket name'),
  region: z.string().describe('AWS region'),
  accessKeyId: z.string().describe('AWS access key ID'),
  secretAccessKey: z.string().describe('AWS secret access key'),
});

/**
 * Schema for Google Cloud Storage provider configuration
 */
const GCSProviderSchema = z.object({
  type: z.literal('gcs').describe('Storage provider type'),
  bucket: z.string().describe('GCS bucket name'),
  projectId: z.string().describe('GCP project ID'),
  clientEmail: z.string().email().describe('GCP client email'),
  privateKey: z.string().describe('GCP private key'),
});

/**
 * Schema for local storage provider configuration
 */
const LocalProviderSchema = z.object({
  type: z.literal('local').describe('Storage provider type'),
  basePath: z.string().describe('Base path for local storage'),
});

/**
 * Schema for storage provider configuration
 */
const StorageProviderSchema = z.discriminatedUnion('type', [
  S3ProviderSchema,
  GCSProviderSchema,
  LocalProviderSchema,
]);

/**
 * Schema for storage configuration
 * @remarks
 * This schema defines the structure and validation rules for the storage configuration.
 */
export const StorageConfigSchema = z.object({
  provider: StorageProviderSchema.describe('Storage provider configuration'),
  uploadLimits: z
    .object({
      maxFileSize: z.coerce.number().positive().describe('Maximum file size in bytes'),
      allowedMimeTypes: z.array(z.string()).describe('Allowed MIME types for uploads'),
    })
    .describe('Upload limits configuration'),
});

/**
 * Type definition for storage configuration
 */
export type StorageConfig = z.infer<typeof StorageConfigSchema>;

/**
 * Helper function to get storage provider configuration
 */
const getStorageProvider = (): z.infer<typeof StorageProviderSchema> => {
  const type = getEnvVar('STORAGE_TYPE', 'local') as 'local' | 's3' | 'gcs';

  switch (type) {
    case 's3':
      return S3ProviderSchema.parse({
        type,
        bucket: getEnvVar('S3_BUCKET'),
        region: getEnvVar('S3_REGION'),
        accessKeyId: getEnvVar('S3_ACCESS_KEY_ID'),
        secretAccessKey: getEnvVar('S3_SECRET_ACCESS_KEY'),
      });
    case 'gcs':
      return GCSProviderSchema.parse({
        type,
        bucket: getEnvVar('GCS_BUCKET'),
        projectId: getEnvVar('GCS_PROJECT_ID'),
        clientEmail: getEnvVar('GCS_CLIENT_EMAIL'),
        privateKey: getEnvVar('GCS_PRIVATE_KEY'),
      });
    default:
      return LocalProviderSchema.parse({
        type: 'local',
        basePath: getEnvVar('LOCAL_STORAGE_PATH', './uploads'),
      });
  }
};

/**
 * Storage configuration object
 * @remarks
 * This object contains the parsed and validated storage configuration.
 */
export const storageConfig: StorageConfig = StorageConfigSchema.parse({
  provider: getStorageProvider(),
  uploadLimits: {
    maxFileSize: getEnvVar('MAX_FILE_SIZE', '5242880'), // 5MB default
    allowedMimeTypes: getEnvVar('ALLOWED_MIME_TYPES', 'image/*,application/pdf').split(','),
  },
});

// Validate the configuration
try {
  StorageConfigSchema.parse(storageConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Storage configuration validation failed:');
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    throw new Error('Invalid storage configuration');
  }
  throw error;
}
