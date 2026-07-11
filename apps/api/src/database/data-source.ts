import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Use process.cwd() for ESM compatibility (__dirname is not available in ES module scope).
// This file is always loaded from the apps/api/ directory via run-migrations.ts or main.ts.
const apiRoot = process.cwd();

dotenv.config({ path: join(apiRoot, '.env.local') });
dotenv.config({ path: join(apiRoot, '.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://admin:secret@localhost:5432/dreamgadgets',
  entities: [join(apiRoot, 'src/**/*.entity{.ts,.js}')],
  migrations: [join(apiRoot, 'src/database/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
