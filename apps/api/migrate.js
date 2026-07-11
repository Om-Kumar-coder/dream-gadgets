/**
 * Standalone migration runner for production use.
 * Uses compiled JavaScript from dist/ so it runs with plain `node` (no ts-node/tsx).
 * Usage: node migrate.js
 */
const { DataSource } = require('typeorm');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function main() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://admin:secret@localhost:5432/dreamgadgets',
    entities: [path.join(__dirname, 'dist/**/*.entity.js')],
    migrations: [path.join(__dirname, 'dist/database/migrations/*.js')],
    synchronize: false,
    logging: true,
  });

  console.log('Initializing DataSource...');
  await ds.initialize();
  console.log('DataSource initialized. Running migrations...');

  const migrations = await ds.runMigrations();
  console.log(`Ran ${migrations.length} migration(s)`);
  migrations.forEach(m => console.log(`  - ${m.name || m}`));

  await ds.destroy();
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err.message || err);
  if (err.stack) console.error(err.stack.split('\n').slice(0, 6).join('\n'));
  process.exit(1);
});
