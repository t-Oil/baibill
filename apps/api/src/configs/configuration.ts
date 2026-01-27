import * as process from 'node:process';
import { parseDuration } from './helpers/duration.helper';

export default () => ({
  appUrl: process.env.APP_URL || 'http://localhost:4000',
  appName: process.env.APP_NAME || 'Receipt OCR API',
  frontendAppUrl: process.env.FRONTEND_APP_URL || 'http://localhost:3000',
  port: parseInt(process.env.APP_PORT, 10) || 4000,
  mode: process.env.NODE_ENV || 'develop',
  auth: {
    salt: +process.env.AUTH_SALT || 10,
  },
  database: {
    type: process.env.DB_CONNECTION || 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    sync: process.env.DB_SYNC === 'true',
    autoMigrate: process.env.DB_AUTO_MIGRATE === 'true',
    entities: ['**/*.entity{.ts,.js}'],
    debug: process.env.DB_DEBUG === 'true',
    dropSchema: process.env.DB_DROP_SCHEMA === 'true',
    ssl: process.env.DB_SSL === 'true',
  },
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET || 'accessTokenSecret',
      expire: parseDuration(process.env.JWT_ACCESS_EXPIRE || '5m'),
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET || 'refreshTokenSecret',
      expire: parseDuration(process.env.JWT_REFRESH_EXPIRE || '10m'),
    },
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/jpg').split(','),
    tempDir: process.env.UPLOAD_TEMP_DIR || './tmp/uploads',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.1,
    enabled: process.env.OPENAI_ENABLED === 'true',
  },
});
