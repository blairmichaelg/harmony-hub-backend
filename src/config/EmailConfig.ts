// src/config/EmailConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for email configuration
 * @remarks
 * This schema defines the structure and validation rules for the email configuration.
 */
export const EmailConfigSchema = convict({
  smtp: {
    doc: 'SMTP server configuration',
    format: z.object({
      host: z.string().describe('SMTP server host'),
      port: z.number().int().positive().describe('SMTP server port'),
      user: z.string().describe('SMTP server user'),
      password: z.string().describe('SMTP server password'),
      // Add more SMTP-specific fields as needed
    }),
    default: {
      host: 'smtp.example.com',
      port: 587,
      user: '',
      password: '',
    },
    env: 'SMTP_CONFIG',
    sensitive: true,
  },
  fromEmail: {
    doc: 'Default from email address',
    format: z.string().email().describe('Default from email address'),
    default: 'no-reply@example.com',
    env: 'FROM_EMAIL',
  },
  // Add more fields as needed for future extensibility
});

export type EmailConfig = z.ZodType<any, any, any>;

const config = EmailConfigSchema.getProperties();

export const emailConfig: EmailConfig = config as unknown as EmailConfig;

// Validate the configuration
try {
  EmailConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Email configuration validation failed:', error.message);
    throw new Error('Invalid Email configuration');
  }
  throw error;
}

export default emailConfig;
