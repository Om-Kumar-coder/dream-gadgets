export class AddBuybackAssessmentColumns1740000000020 {
    constructor() {
        this.name = 'AddBuybackAssessmentColumns1740000000020';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "buyback_leads"
        ADD COLUMN "screen_condition" VARCHAR(50),
        ADD COLUMN "body_condition"   VARCHAR(50),
        ADD COLUMN "battery_health"   VARCHAR(20)
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "buyback_leads"
        DROP COLUMN IF EXISTS "screen_condition",
        DROP COLUMN IF EXISTS "body_condition",
        DROP COLUMN IF EXISTS "battery_health"
    `);
    }
}
//# sourceMappingURL=020-add-buyback-assessment-columns.js.map