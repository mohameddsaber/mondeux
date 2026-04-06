import dotenv from 'dotenv';

dotenv.config();

const parseCsvEnv = (value) =>
  value
    ?.split(',')
    .map((entry) => entry.trim())
    .filter(Boolean) ?? [];

const nodeEnv = process.env.NODE_ENV || 'development';
const defaultDevOrigins = nodeEnv === 'production' ? [] : ['http://localhost:5173'];
const configuredOrigins = [
  ...parseCsvEnv(process.env.FRONTEND_URL),
  ...parseCsvEnv(process.env.CORS_ALLOWED_ORIGINS),
];

export const appConfig = {
  nodeEnv,
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  cookieSecret: process.env.COOKIE_SECRET || process.env.JWT_SECRET || 'development-cookie-secret',
  authCookieSameSite: process.env.AUTH_COOKIE_SAME_SITE || (nodeEnv === 'production' ? 'none' : 'lax'),
  authCookieSecure:
    process.env.AUTH_COOKIE_SECURE === 'true' ||
    (process.env.AUTH_COOKIE_SECURE == null && nodeEnv === 'production'),
  allowedOrigins: Array.from(new Set([...configuredOrigins, ...defaultDevOrigins])),
};

export const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (appConfig.allowedOrigins.length === 0) {
    return true;
  }

  return appConfig.allowedOrigins.includes(origin);
};
