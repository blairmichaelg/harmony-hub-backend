// server.ts

import { config } from 'dotenv';
import * as joi from 'joi';

config();

export interface ServerConfigType {
  port: number;
  host: string;
  protocol: 'http' | 'https';
  apiVersion: string;
  maxRequestBodySize: string;
  compressionLevel: number;
  trustProxy: boolean;
  sessionSecret: string;
  cookieSecret: string;
  helmet: {
    contentSecurityPolicy: boolean;
    xssFilter: boolean;
    hsts: boolean;
    noSniff: boolean;
    referrerPolicy: boolean;
  };
}

const serverConfigSchema = joi.object({
  port: joi.number().port().required(),
  host: joi.string().required(),
  protocol: joi.string().valid('http', 'https').required(),
  apiVersion: joi.string().required(),
  maxRequestBodySize: joi.string().required(),
  compressionLevel: joi.number().min(0).max(9).required(),
  trustProxy: joi.boolean().required(),
  sessionSecret: joi.string().required(),
  cookieSecret: joi.string().required(),
  helmet: joi
    .object({
      contentSecurityPolicy: joi.boolean().required(),
      xssFilter: joi.boolean().required(),
      hsts: joi.boolean().required(),
      noSniff: joi.boolean().required(),
      referrerPolicy: joi.boolean().required(),
    })
    .required(),
});

const serverConfig: ServerConfigType = {
  port: parseInt(process.env.SERVER_PORT || '3000', 10),
  host: process.env.SERVER_HOST || 'localhost',
  protocol: (process.env.SERVER_PROTOCOL || 'http') as 'http' | 'https',
  apiVersion: process.env.API_VERSION || 'v1',
  maxRequestBodySize: process.env.MAX_REQUEST_BODY_SIZE || '10mb',
  compressionLevel: parseInt(process.env.COMPRESSION_LEVEL || '6', 10),
  trustProxy: process.env.TRUST_PROXY === 'true',
  sessionSecret: process.env.SESSION_SECRET || 'harmonyhub_session_secret',
  cookieSecret: process.env.COOKIE_SECRET || 'harmonyhub_cookie_secret',
  helmet: {
    contentSecurityPolicy: process.env.HELMET_CSP !== 'false',
    xssFilter: process.env.HELMET_XSS_FILTER !== 'false',
    hsts: process.env.HELMET_HSTS !== 'false',
    noSniff: process.env.HELMET_NO_SNIFF !== 'false',
    referrerPolicy: process.env.HELMET_REFERRER_POLICY !== 'false',
  },
};

const { error } = serverConfigSchema.validate(serverConfig);

if (error) {
  throw new Error(`Server Configuration Error: ${error.message}`);
}

export default serverConfig;
