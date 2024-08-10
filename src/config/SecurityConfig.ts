// src/config/SecurityConfig.ts

import convict from 'convict';

/**
 * Schema for security configuration
 * @remarks
 * This schema defines the structure and validation rules for the security configuration.
 */
const SecurityConfigSchema = convict({
  jwtSecret: {
    doc: 'Secret key for signing JWT tokens',
    format: String,
    default: 'defaultSecret',
    env: 'JWT_SECRET',
    sensitive: true,
  },
  saltRounds: {
    doc: 'Number of salt rounds for hashing passwords',
    format: 'int',
    default: 10,
    env: 'SALT_ROUNDS',
  },
  tokenExpiration: {
    doc: 'Expiration time for JWT tokens',
    format: String,
    default: '1h',
    env: 'TOKEN_EXPIRATION',
  },
  // Add more fields as needed for future extensibility
});

/**
 * Interface definition for security configuration
 */
export interface ISecurityConfig {
  jwtSecret: string;
  saltRounds: number;
  tokenExpiration: string;
}

/**
 * Security configuration object
 * @remarks
 * This object contains the parsed and validated security configuration.
 */
const config = SecurityConfigSchema.getProperties();

export const securityConfig: ISecurityConfig = config as unknown as ISecurityConfig;

// Validate the configuration
try {
  SecurityConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Security configuration validation failed:', error.message);
    throw new Error('Invalid security configuration');
  }
  throw error;
}

export default securityConfig;
