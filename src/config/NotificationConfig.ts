// src/config/NotificationConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for notification configuration
 * @remarks
 * This schema defines the structure and validation rules for the notification configuration.
 */
export const NotificationConfigSchema = convict({
  fcm: {
    doc: 'Firebase Cloud Messaging configuration',
    format: z.object({
      apiKey: z.string().describe('Firebase Cloud Messaging API key'),
      // Add more FCM-specific fields as needed
    }),
    default: {
      apiKey: '',
    },
    env: 'FCM_CONFIG',
    sensitive: true,
  },
  twilio: {
    doc: 'Twilio configuration',
    format: z.object({
      accountSid: z.string().describe('Twilio Account SID'),
      authToken: z.string().describe('Twilio Auth Token'),
      // Add more Twilio-specific fields as needed
    }),
    default: {
      accountSid: '',
      authToken: '',
    },
    env: 'TWILIO_CONFIG',
    sensitive: true,
  },
  // Add more fields as needed for future extensibility
});

// Define the NotificationConfig type based on the schema
export interface NotificationConfig {
  fcm: {
    apiKey: string;
    // Add more FCM-specific fields as needed
  };
  twilio: {
    accountSid: string;
    authToken: string;
    // Add more Twilio-specific fields as needed
  };
  // Add more fields as needed for future extensibility
}

const config = NotificationConfigSchema.getProperties();

export const notificationConfig: NotificationConfig =
  config as unknown as NotificationConfig;

// Validate the configuration
try {
  NotificationConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error(
      'Notification configuration validation failed:',
      error.message,
    );
    throw new Error('Invalid Notification configuration');
  }
  throw error;
}

export default notificationConfig;
