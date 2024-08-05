import { z } from 'zod';

import { envConfig } from './envConfig';

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
};

const authConfigSchema = z.object({
  jwt: z.object({
    secret: z.string(),
    expiresIn: z.string(),
    refreshExpiresIn: z.string(),
  }),
  passwordReset: z.object({
    tokenExpiresIn: z.string(),
  }),
  oauth2: z.object({
    google: z
      .object({
        clientId: z.string(),
        clientSecret: z.string(),
        callbackURL: z.string(),
      })
      .optional(),
    facebook: z
      .object({
        clientId: z.string(),
        clientSecret: z.string(),
        callbackURL: z.string(),
      })
      .optional(),
    github: z
      .object({
        clientId: z.string(),
        clientSecret: z.string(),
        callbackURL: z.string(),
      })
      .optional(),
  }),
});

type AuthConfig = z.infer<typeof authConfigSchema>;

const authConfig: Readonly<AuthConfig> = Object.freeze(
  authConfigSchema.parse({
    jwt: {
      secret: getEnvVar('JWT_SECRET'),
      expiresIn: getEnvVar('JWT_EXPIRES_IN', '1h'),
      refreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
    },
    passwordReset: {
      tokenExpiresIn: getEnvVar('PASSWORD_RESET_EXPIRES_IN', '1h'),
    },
    oauth2: {
      google: process.env.GOOGLE_CLIENT_ID
        ? {
            clientId: getEnvVar('GOOGLE_CLIENT_ID'),
            clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET'),
            callbackURL: `${envConfig.APP_URL}/auth/google/callback`,
          }
        : undefined,
      facebook: process.env.FACEBOOK_CLIENT_ID
        ? {
            clientId: getEnvVar('FACEBOOK_CLIENT_ID'),
            clientSecret: getEnvVar('FACEBOOK_CLIENT_SECRET'),
            callbackURL: `${envConfig.APP_URL}/auth/facebook/callback`,
          }
        : undefined,
      github: process.env.GITHUB_CLIENT_ID
        ? {
            clientId: getEnvVar('GITHUB_CLIENT_ID'),
            clientSecret: getEnvVar('GITHUB_CLIENT_SECRET'),
            callbackURL: `${envConfig.APP_URL}/auth/github/callback`,
          }
        : undefined,
    },
  })
);

export { authConfig, AuthConfig };
