export class AddBuybackFunctionalIssues1740000000021 {
    constructor() {
        this.name = 'AddBuybackFunctionalIssues1740000000021';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "buyback_leads"
        ADD COLUMN "functional_issues" TEXT
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "buyback_leads"
        DROP COLUMN IF EXISTS "functional_issues"
    `);
    }
}
//# sourceMappingURL=021-add-buyback-functional-issues.js.map