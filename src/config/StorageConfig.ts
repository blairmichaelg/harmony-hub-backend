// src/config/StorageConfig.ts

import convict from 'convict';

/**
 * Schema for storage configuration
 * @remarks
 * This schema defines the structure and validation rules for the storage configuration.
 */
const StorageConfigSchema = convict({
  provider: {
    doc: 'Storage provider (e.g., local, s3)',
    format: ['local', 's3'],
    default: 'local',
    env: 'STORAGE_PROVIDER',
  },
  localPath: {
    doc: 'Local storage path',
    format: String,
    default: './data',
    env: 'LOCAL_STORAGE_PATH',
  },
  s3Bucket: {
    doc: 'S3 bucket name',
    format: String,
    default: '',
    env: 'S3_BUCKET',
  },
  s3Region: {
    doc: 'S3 region',
    format: String,
    default: '',
    env: 'S3_REGION',
  },
  // Add more fields as needed for future extensibility
});

/**
 * Interface definition for storage configuration
 */
export interface IStorageConfig {
  provider: 'local' | 's3';
  localPath: string;
  s3Bucket: string;
  s3Region: string;
}

/**
 * Storage configuration object
 * @remarks
 * This object contains the parsed and validated storage configuration.
 */
const config = StorageConfigSchema.getProperties();

export const storageConfig: IStorageConfig = config as unknown as IStorageConfig;

// Validate the configuration
try {
  StorageConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Storage configuration validation failed:', error.message);
    throw new Error('Invalid storage configuration');
  }
  throw error;
}

export default storageConfig;
