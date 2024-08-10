// src/config/EmailConfig.ts

import convict from 'convict';

/**
 * Schema for email configuration
 * @remarks
 * This schema defines the structure and validation rules for the email configuration.
 */
const EmailConfigSchema = convict({
  smtpHost: {
    doc: 'SMTP server host',
    format: String,
    default: 'smtp.example.com',
    env: 'SMTP_HOST',
  },
  smtpPort: {
    doc: 'SMTP server port',
    format: 'port',
    default: 587,
    env: 'SMTP_PORT',
  },
  smtpUser: {
    doc: 'SMTP server user',
    format: String,
    default: '',
    env: 'SMTP_USER',
  },
  smtpPassword: {
    doc: 'SMTP server password',
    format: String,
    default: '',
    env: 'SMTP_PASSWORD',
    sensitive: true,
  },
  fromEmail: {
    doc: 'Default from email address',
    format: 'email',
    default: 'no-reply@example.com',
    env: 'FROM_EMAIL',
  },
  // Add more fields as needed for future extensibility
});

/**
 * Interface definition for email configuration
 */
export interface IEmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
}

/**
 * Email configuration object
 * @remarks
 * This object contains the parsed and validated email configuration.
 */
const config = EmailConfigSchema.getProperties();

export const emailConfig: IEmailConfig = config as unknown as IEmailConfig;

// Validate the configuration
try {
  EmailConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Email configuration validation failed:', error.message);
    throw new Error('Invalid email configuration');
  }
  throw error;
}

export default emailConfig;
