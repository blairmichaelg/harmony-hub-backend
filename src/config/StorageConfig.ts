import { z } from 'zod';

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
};

const s3ProviderSchema = z.object({
  type: z.literal('s3'),
  bucket: z.string(),
  region: z.string(),
  accessKeyId: z.string(),
  secretAccessKey: z.string(),
});

const gcsProviderSchema = z.object({
  type: z.literal('gcs'),
  bucket: z.string(),
  projectId: z.string(),
  clientEmail: z.string(),
  privateKey: z.string(),
});

const localProviderSchema = z.object({
  type: z.literal('local'),
  basePath: z.string(),
});

const storageProviderSchema = z.discriminatedUnion('type', [
  s3ProviderSchema,
  gcsProviderSchema,
  localProviderSchema,
]);

const storageConfigSchema = z.object({
  provider: storageProviderSchema,
  uploadLimits: z.object({
    maxFileSize: z.number(),
    allowedMimeTypes: z.array(z.string()),
  }),
});

type StorageConfig = z.infer<typeof storageConfigSchema>;

const storageConfig: Readonly<StorageConfig> = Object.freeze(
  storageConfigSchema.parse({
    provider: (() => {
      const type = getEnvVar('STORAGE_TYPE', 'local') as 'local' | 's3' | 'gcs';

      switch (type) {
        case 's3':
          return {
            type,
            bucket: getEnvVar('S3_BUCKET'),
            region: getEnvVar('S3_REGION'),
            accessKeyId: getEnvVar('S3_ACCESS_KEY_ID'),
            secretAccessKey: getEnvVar('S3_SECRET_ACCESS_KEY'),
          };
        case 'gcs':
          return {
            type,
            bucket: getEnvVar('GCS_BUCKET'),
            projectId: getEnvVar('GCS_PROJECT_ID'),
            clientEmail: getEnvVar('GCS_CLIENT_EMAIL'),
            privateKey: getEnvVar('GCS_PRIVATE_KEY'),
          };
        default:
          return {
            type: 'local',
            basePath: getEnvVar('LOCAL_STORAGE_PATH', './uploads'),
          };
      }
    })(),
    uploadLimits: {
      maxFileSize: parseInt(getEnvVar('MAX_FILE_SIZE', '5242880'), 10), // 5MB default
      allowedMimeTypes: getEnvVar('ALLOWED_MIME_TYPES', 'image/*,application/pdf').split(','),
    },
  })
);

export { storageConfig, StorageConfig };
