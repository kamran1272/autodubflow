import { getConfig } from '@autodubflow/config';
import { createLogger } from '@autodubflow/logger';
import { prisma } from '@autodubflow/database';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { toNodeHandler } from 'better-auth/node';

const logger = createLogger('auth');
const config = getConfig();

const apiBaseUrl = process.env.BETTER_AUTH_URL ?? process.env.API_URL ?? config.API_URL;
const webBaseUrl = process.env.WEB_URL ?? config.WEB_URL;
const secret = process.env.BETTER_AUTH_SECRET ?? 'dev-auth-secret-change-me';

export const auth = betterAuth({
  baseURL: apiBaseUrl,
  secret,
  trustedOrigins: [webBaseUrl, apiBaseUrl],
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      logger.info('password-reset-email-sent', {
        userId: user.id,
        email: user.email,
        resetUrl: url,
      });
    },
    onPasswordReset: async ({ user }) => {
      logger.info('password-reset-completed', { userId: user.id, email: user.email });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});

export const authHandler = toNodeHandler(auth);
