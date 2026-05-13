import { AppDataSource } from '../data-source';
import { seedRolesAndPermissions } from './001-seed-roles-permissions';
import { seedSettingsAndBranch } from './002-seed-settings-branch';
import { seedTestUsers } from './003-seed-test-users';

async function runSeeds() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected — running seeds...');

    await seedRolesAndPermissions(AppDataSource);
    await seedSettingsAndBranch(AppDataSource);
    await seedTestUsers(AppDataSource);

    console.log('All seeds completed successfully');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

runSeeds();
