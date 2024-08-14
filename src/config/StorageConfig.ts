// src/config/StorageConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for storage configuration
 * @remarks
 * This schema defines the structure and validation rules for the storage configuration.
 */
export const StorageConfigSchema = convict({
  provider: {
    doc: 'Storage provider (e.g., local, s3)',
    format: ['local', 's3'],
    default: 'local',
    env: 'STORAGE_PROVIDER',
  },
  local: {
    doc: 'Local storage configuration',
    format: z.object({
      path: z.string().describe('Local storage path'),
    }),
    default: {
      path: './data',
    },
    env: 'LOCAL_STORAGE',
  },
  s3: {
    doc: 'S3 storage configuration',
    format: z.object({
      bucket: z.string().describe('S3 bucket name'),
      region: z.string().describe('S3 region'),
      accessKeyId: z.string().describe('AWS access key ID'),
      secretAccessKey: z.string().describe('AWS secret access key'),
    }),
    default: {
      bucket: '',
      region: '',
      accessKeyId: '',
      secretAccessKey: '',
    },
    env: 'S3_STORAGE',
  },
  uploadLimits: {
    doc: 'File upload limits',
    format: z.object({
      maxFileSize: z
        .number()
        .positive()
        .describe('Maximum allowed file size in bytes'),
      allowedMimeTypes: z
        .array(z.string())
        .describe('Allowed MIME types for uploaded files'),
    }),
    default: {
      maxFileSize: 104857600, // 100MB
      allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    },
    env: 'UPLOAD_LIMITS',
  },
  fileEncryption: {
    doc: 'File encryption configuration',
    format: z.object({
      enabled: z.boolean().describe('Whether file encryption is enabled'),
      key: z.string().describe('Encryption key'),
    }),
    default: {
      enabled: false,
      key: 'your-secret-key', // Replace with a strong, randomly generated key
    },
    env: 'FILE_ENCRYPTION',
    sensitive: true,
  },
});

export type StorageConfig = z.ZodType<any, any, any>;

const config = StorageConfigSchema.getProperties();

export const storageConfig: StorageConfig = config as unknown as StorageConfig;

try {
  StorageConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Storage configuration validation failed:', error.message);
    throw new Error('Invalid Storage configuration');
  }
  throw error;
}

export default storageConfig;
