// SecurityConfig.ts

import { config } from 'dotenv';
import * as joi from 'joi';

config();

export interface SecurityConfigType {
  cors: {
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  contentSecurityPolicy: {
    directives: {
      [key: string]: string[];
    };
  };
  encryption: {
    algorithm: string;
    secretKey: string;
    iv: string;
  };
}

const securityConfigSchema = joi
  .object({
    cors: joi
      .object({
        allowedOrigins: joi.array().items(joi.string()).required(),
        allowedMethods: joi.array().items(joi.string()).required(),
        allowedHeaders: joi.array().items(joi.string()).required(),
        exposedHeaders: joi.array().items(joi.string()).required(),
        maxAge: joi.number().required(),
        credentials: joi.boolean().required(),
      })
      .required(),
    rateLimit: joi
      .object({
        windowMs: joi.number().required(),
        max: joi.number().required(),
      })
      .required(),
    contentSecurityPolicy: joi
      .object({
        directives: joi.object().pattern(joi.string(), joi.array().items(joi.string())).required(),
      })
      .required(),
    encryption: joi
      .object({
        algorithm: joi.string().required(),
        secretKey: joi.string().required(),
        iv: joi.string().required(),
      })
      .required(),
  })
  .required();

const securityConfig: SecurityConfigType = {
  cors: {
    allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || '').split(','),
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400,
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.harmonyhub.com'],
    },
  },
  encryption: {
    algorithm: 'aes-256-cbc',
    secretKey: process.env.ENCRYPTION_SECRET_KEY || '',
    iv: process.env.ENCRYPTION_IV || '',
  },
};

const { error } = securityConfigSchema.validate(securityConfig);

if (error) {
  throw new Error(`Security Configuration Error: ${error.message}`);
}

export default securityConfig;
