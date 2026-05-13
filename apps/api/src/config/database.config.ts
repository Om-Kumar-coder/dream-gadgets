import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://admin:secret@localhost:5432/dreamgadgets',
  poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '20', 10),
}));
