import { AppDataSource } from './src/database/data-source';
async function main() {
    await AppDataSource.initialize();
    const migrations = await AppDataSource.runMigrations();
    console.log(`Ran ${migrations.length} migration(s)`);
    await AppDataSource.destroy();
    process.exit(0);
}
main().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=run-migrations.js.map