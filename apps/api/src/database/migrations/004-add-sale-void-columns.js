export class AddSaleVoidColumns1700000000004 {
    constructor() {
        this.name = 'AddSaleVoidColumns1700000000004';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "sales"
        ADD COLUMN IF NOT EXISTS "is_voided" BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "voided_by" UUID REFERENCES "users"("id"),
        ADD COLUMN IF NOT EXISTS "voided_at" TIMESTAMPTZ
    `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_sales_voided" ON "sales"("is_voided")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_sales_voided"`);
        await queryRunner.query(`
      ALTER TABLE "sales"
        DROP COLUMN IF EXISTS "is_voided",
        DROP COLUMN IF EXISTS "voided_by",
        DROP COLUMN IF EXISTS "voided_at"
    `);
    }
}
//# sourceMappingURL=004-add-sale-void-columns.js.map