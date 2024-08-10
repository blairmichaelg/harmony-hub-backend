// src/config/NotificationConfig.ts

import convict from 'convict';

/**
 * Schema for notification configuration
 * @remarks
 * This schema defines the structure and validation rules for the notification configuration.
 */
const NotificationConfigSchema = convict({
  fcmApiKey: {
    doc: 'Firebase Cloud Messaging API key',
    format: String,
    default: '',
    env: 'FCM_API_KEY',
    sensitive: true,
  },
  twilioAccountSid: {
    doc: 'Twilio Account SID',
    format: String,
    default: '',
    env: 'TWILIO_ACCOUNT_SID',
  },
  twilioAuthToken: {
    doc: 'Twilio Auth Token',
    format: String,
    default: '',
    env: 'TWILIO_AUTH_TOKEN',
    sensitive: true,
  },
  // Add more fields as needed for future extensibility
});

/**
 * Interface definition for notification configuration
 */
export interface INotificationConfig {
  fcmApiKey: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
}

/**
 * Notification configuration object
 * @remarks
 * This object contains the parsed and validated notification configuration.
 */
const config = NotificationConfigSchema.getProperties();

export const notificationConfig: INotificationConfig = config as unknown as INotificationConfig;

// Validate the configuration
try {
  NotificationConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Notification configuration validation failed:', error.message);
    throw new Error('Invalid notification configuration');
  }
  throw error;
}

export default notificationConfig;
