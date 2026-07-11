export class AddSearchTsvector1700000000006 {
    constructor() {
        this.name = 'AddSearchTsvector1700000000006';
    }
    async up(queryRunner) {
        // The search_vector column was already added as GENERATED ALWAYS in migration 002.
        // Here we just ensure the GIN index exists and add a trigger for non-generated fallback.
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_inventory_search_vector"
      ON "inventory_items" USING GIN ("search_vector")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_search_vector"`);
    }
}
//# sourceMappingURL=006-add-search-tsvector.js.map