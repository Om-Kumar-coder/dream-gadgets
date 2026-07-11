import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  webUrl: process.env.WEB_URL || 'http://localhost:3001',
  adminUrl: 'http://localhost:3002',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiry: process.env.JWT_EXPIRY || '15m',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'change-me-refresh',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  cdnBaseUrl: process.env.CDN_BASE_URL || '',
}));
