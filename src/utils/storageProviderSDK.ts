// src/utils/storageProviderSDK.ts

import { S3 } from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';
import { storageConfig } from '../config/StorageConfig';
import { FileMetadata } from './file';
import logger from './logging';

/**
 * Interface for storage providers
 */
export interface Storage {
  uploadFile(
    filePath: string,
    destinationPath: string,
    metadata?: FileMetadata,
  ): Promise<string>;
  getFile(fileIdentifier: string): Promise<Buffer>;
  // ... other storage methods as needed
}

/**
 * Local storage provider
 */
class LocalStorage implements Storage {
  private storagePath: string;

  constructor(storagePath: string) {
    this.storagePath = storagePath;
  }

  async uploadFile(
    filePath: string,
    destinationPath: string,
    metadata?: FileMetadata,
  ): Promise<string> {
    const fullDestinationPath = path.join(this.storagePath, destinationPath);
    await fs.copyFile(filePath, fullDestinationPath);
    logger.debug(`File uploaded to local storage: ${fullDestinationPath}`);
    return destinationPath; // Return the relative path for local storage
  }

  async getFile(fileIdentifier: string): Promise<Buffer> {
    const fullFilePath = path.join(this.storagePath, fileIdentifier);
    const fileContent = await fs.readFile(fullFilePath);
    logger.debug(`File retrieved from local storage: ${fullFilePath}`);
    return fileContent;
  }

  // ... other local storage methods as needed
}

/**
 * AWS S3 storage provider
 */
class S3Storage implements Storage {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      region: storageConfig.s3.region,
      credentials: {
        accessKeyId: storageConfig.s3.accessKeyId,
        secretAccessKey: storageConfig.s3.secretAccessKey,
      },
    });
  }

  async uploadFile(
    filePath: string,
    destinationPath: string,
    metadata?: FileMetadata,
  ): Promise<string> {
    const fileContent = await fs.readFile(filePath);
    await this.s3.putObject({
      Bucket: storageConfig.s3.bucket,
      Key: destinationPath,
      Body: fileContent,
      Metadata: metadata ? JSON.stringify(metadata) : undefined, // Store metadata as JSON string
    });
    logger.debug(`File uploaded to S3: ${destinationPath}`);
    return `https://${storageConfig.s3.bucket}.s3.${storageConfig.s3.region}.amazonaws.com/${destinationPath}`; // Return the S3 URL
  }

  async getFile(fileIdentifier: string): Promise<Buffer> {
    const data = await this.s3.getObject({
      Bucket: storageConfig.s3.bucket,
      Key: fileIdentifier,
    });
    if (!data.Body) {
      throw new Error(`File not found in S3: ${fileIdentifier}`);
    }
    const fileContent = await data.Body.transformToString();
    logger.debug(`File retrieved from S3: ${fileIdentifier}`);
    return Buffer.from(fileContent);
  }

  // ... other S3 storage methods as needed
}

/**
 * Factory function to create the appropriate storage provider
 * @param {string} providerName - The name of the storage provider (e.g., 'local', 's3')
 * @returns {Storage} An instance of the storage provider
 * @throws {Error} If an unsupported provider is requested
 */
export const createStorageProvider = (providerName: string): Storage => {
  switch (providerName) {
    case 'local':
      return new LocalStorage(storageConfig.local.path);
    case 's3':
      return new S3Storage();
    default:
      throw new Error(`Unsupported storage provider: ${providerName}`);
  }
};
