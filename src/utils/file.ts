// src/utils/file.ts

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

import { performanceConfig } from '../config/PerformanceConfig';
import { securityConfig } from '../config/SecurityConfig';
import { storageConfig } from '../config/StorageConfig';
import { cache } from './caching';
import { decrypt, encrypt, hashSHA256 } from './crypto';
import { CustomError } from './errorUtils';
import logger from './logging';
import { createStorageProvider, Storage } from './storageProviderSDK';
import { sanitizeFilename, sanitizeHTML } from './string';
import {
  AudioMetadataSchema,
  AudioProcessingOptionsSchema,
  validateFileSize,
} from './validation/audio';

const FileMetadataSchema = z.object({
  name: z.string(),
  size: z.number().positive(),
  mimeType: z.string(),
  audioMetadata: AudioMetadataSchema.optional(),
  hash: z.string().optional(),
});

export type FileMetadata = z.infer<typeof FileMetadataSchema>;

/**
 * Gets the size of a file in bytes
 * @param {string} filePath - The path to the file
 * @returns {Promise<number>} The file size in bytes
 * @throws {CustomError} If the file is not found or inaccessible
 */
export const getFileSize = async (filePath: string): Promise<number> => {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    logger.error('Error getting file size:', { error, filePath });
    throw new CustomError(
      'File not found or inaccessible',
      'FILE_ACCESS_ERROR',
      404,
    );
  }
};

/**
 * Creates a directory if it doesn't exist
 * @param {string} dirPath - The path to the directory
 * @returns {Promise<void>}
 * @throws {CustomError} If the directory creation fails
 */
export const createDirectoryIfNotExists = async (
  dirPath: string,
): Promise<void> => {
  try {
    await fs.access(dirPath);
  } catch {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      logger.error('Error creating directory:', { error, dirPath });
      throw new CustomError(
        'Failed to create directory',
        'DIRECTORY_CREATE_ERROR',
        500,
      );
    }
  }
};

/**
 * Validates file metadata against the defined schema and configuration
 * @param {FileMetadata} metadata - The file metadata to validate
 * @throws {CustomError} If the metadata is invalid
 */
const validateFileMetadata = (metadata: FileMetadata): void => {
  try {
    FileMetadataSchema.parse(metadata);
    validateFileSize(metadata.size);

    if (
      !storageConfig.uploadLimits.allowedMimeTypes.includes(metadata.mimeType)
    ) {
      throw new CustomError('File type is not allowed', 'FILE_TYPE_ERROR', 400);
    }

    if (metadata.audioMetadata) {
      AudioMetadataSchema.parse(metadata.audioMetadata);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('File metadata validation failed:', { error: error.errors });
      throw new CustomError(
        'Invalid file metadata',
        'METADATA_VALIDATION_ERROR',
        400,
      );
    }
    throw error;
  }
};

/**
 * Streams a file to the configured storage provider, optionally applying audio processing
 * @param {string} filePath - The path to the file
 * @param {FileMetadata} metadata - The file metadata
 * @param {AudioProcessingOptions} [audioOptions] - Optional audio processing options
 * @returns {Promise<string>} The URL of the uploaded file
 * @throws {CustomError} If streaming or processing fails
 */
export const streamFileToStorage = async (
  filePath: string,
  metadata: FileMetadata,
  audioOptions?: z.infer<typeof AudioProcessingOptionsSchema>,
): Promise<string> => {
  try {
    validateFileMetadata(metadata);

    if (audioOptions) {
      AudioProcessingOptionsSchema.parse(audioOptions);
      // Apply audio processing here (implementation needed)
    }

    const storage: Storage = createStorageProvider(storageConfig.provider);
    const secureFilename = generateSecureFilename(metadata.name);
    const destinationPath = `uploads/${secureFilename}`;

    const fileContent = await fs.readFile(filePath);

    metadata.hash = hashSHA256(fileContent.toString());

    if (securityConfig.fileEncryption.enabled) {
      const encryptedContent = await encrypt(
        fileContent.toString(),
        securityConfig.fileEncryption.key,
      );

      await fs.writeFile(filePath, encryptedContent);
    }

    let url = await storage.uploadFile(filePath, destinationPath, metadata);

    if (performanceConfig.cdn.enabled && performanceConfig.cdn.domain) {
      url = `${performanceConfig.cdn.domain}/${url}`;
    }

    if (performanceConfig.caching.enabled) {
      await cache.set(
        `file:${secureFilename}`,
        url,
        performanceConfig.caching.ttl,
      );
    }

    logger.info('File successfully streamed to storage', {
      filename: secureFilename,
      url,
    });

    return url;
  } catch (error) {
    logger.error('Error streaming file to storage:', {
      error,
      filePath,
      metadata,
    });
    throw new CustomError(
      'Failed to stream file to storage',
      'FILE_STREAM_ERROR',
      500,
    );
  }
};

/**
 * Retrieves a file from the configured storage provider, optionally using caching
 * @param {string} fileIdentifier - The identifier of the file
 * @returns {Promise<Buffer>} The file content as a Buffer
 * @throws {Error} If retrieving the file fails
 */
export const getFileFromStorage = async (
  fileIdentifier: string,
): Promise<Buffer> => {
  try {
    if (performanceConfig.caching.enabled) {
      const cachedFile = await cache.get(`file:${fileIdentifier}`);

      if (cachedFile) {
        logger.info('File retrieved from cache', { fileIdentifier });

        return Buffer.from(cachedFile as string);
      }
    }

    const storage: Storage = createStorageProvider(storageConfig.provider);
    let fileContent = await storage.getFile(fileIdentifier);

    if (securityConfig.fileEncryption.enabled) {
      fileContent = Buffer.from(
        await decrypt(
          fileContent.toString(),
          securityConfig.fileEncryption.key,
        ),
      );
    }

    if (performanceConfig.caching.enabled) {
      await cache.set(
        `file:${fileIdentifier}`,
        fileContent.toString(),
        performanceConfig.caching.ttl,
      );
    }

    logger.info('File successfully retrieved from storage', { fileIdentifier });

    return fileContent;
  } catch (error) {
    logger.error('Error retrieving file from storage:', {
      error,
      fileIdentifier,
    });
    throw new Error('Failed to retrieve file from storage');
  }
};

/**
 * Generates a secure filename by adding a timestamp and random string to the original filename
 * @param {string} originalFilename - The original filename
 * @returns {string} The secure filename
 */
export const generateSecureFilename = (originalFilename: string): string => {
  const sanitized = sanitizeFilename(originalFilename);
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(sanitized);
  const nameWithoutExtension = path.basename(sanitized, extension);

  return `${nameWithoutExtension}-${timestamp}-${randomString}${extension}`;
};

/**
 * Sanitizes file content by removing potentially harmful HTML tags and attributes
 * @param {string} content - The file content to sanitize
 * @returns {string} The sanitized file content
 */
export const sanitizeFileContent = (content: string): string => {
  return sanitizeHTML(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
  });
};

/**
 * Memoized function for expensive file operations
 * @param {string} operation - The operation to perform
 * @param {unknown} input - The input for the operation
 * @returns {unknown} The result of the operation
 * @throws {Error} If an unknown operation is provided
 */
export const memoizedFileOperation = ((): ((
  operation: string,
  input: unknown,
) => unknown) => {
  const cache = new Map<string, unknown>();

  return (operation: string, input: unknown): unknown => {
    const cacheKey = `${operation}:${JSON.stringify(input)}`;

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    let result;

    switch (operation) {
      case 'processMetadata':
        // TODO: Implement actual metadata processing logic here
        result = { input, processed: true };
        break;
      default:
        throw new Error('Unknown operation');
    }

    cache.set(cacheKey, result);

    return result;
  };
})();
