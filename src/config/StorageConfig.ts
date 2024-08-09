// src/config/StorageConfig.ts

import convict from 'convict';
import { z } from 'zod';

// Define the configuration schema
const S3ProviderSchema = z.object({
  type: z.literal('s3').describe('Storage provider type'),
  bucket: z.string().describe('S3 bucket name'),
  region: z.string().describe('AWS region'),
  accessKeyId: z.string().describe('AWS access key ID'),
  secretAccessKey: z.string().describe('AWS secret access key'),
});

const GCSProviderSchema = z.object({
  type: z.literal('gcs').describe('Storage provider type'),
  bucket: z.string().describe('GCS bucket name'),
  projectId: z.string().describe('GCP project ID'),
  clientEmail: z.string().email().describe('GCP client email'),
  privateKey: z.string().describe('GCP private key'),
});

const LocalProviderSchema = z.object({
  type: z.literal('local').describe('Storage provider type'),
  basePath: z.string().describe('Base path for local storage'),
});

const StorageProviderSchema = z.discriminatedUnion('type', [
  S3ProviderSchema,
  GCSProviderSchema,
  LocalProviderSchema,
]);

const StorageConfigSchema = convict({
  provider: {
    doc: 'Storage provider configuration',
    format: StorageProviderSchema,
    default: {
      type: 'local',
      basePath: './uploads',
    },
    env: 'STORAGE_PROVIDER',
  },
  uploadLimits: {
    maxFileSize: {
      doc: 'Maximum file size in bytes',
      format: 'number',
      default: 5242880, // 5MB
      env: 'MAX_FILE_SIZE',
    },
    allowedMimeTypes: {
      doc: 'Allowed MIME types for uploads',
      format: Array,
      default: ['image/*', 'application/pdf'],
      env: 'ALLOWED_MIME_TYPES',
    },
  },
  projectStorage: {
    enabled: {
      doc: 'Enable project-based storage organization',
      format: 'Boolean',
      default: false,
      env: 'STORAGE_PROJECT_BASED_ENABLED',
    },
    defaultQuota: {
      doc: 'Default storage quota per project in bytes',
      format: 'number',
      default: 1073741824, // 1GB
      env: 'STORAGE_PROJECT_DEFAULT_QUOTA',
    },
  },
  versioning: {
    enabled: {
      doc: 'Enable file versioning',
      format: 'Boolean',
      default: false,
      env: 'STORAGE_VERSIONING_ENABLED',
    },
    maxVersions: {
      doc: 'Maximum number of versions to keep per file',
      format: 'nat',
      default: 5,
      env: 'STORAGE_VERSIONING_MAX_VERSIONS',
    },
  },
});

export type StorageConfig = z.infer<typeof StorageConfigSchema>;

// Create and validate the configuration object
export const storageConfig = StorageConfigSchema.validate({
  // Load configuration from environment variables or use defaults
});

export default storageConfig;
