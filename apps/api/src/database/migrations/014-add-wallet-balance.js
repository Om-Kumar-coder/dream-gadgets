export class AddWalletBalance1740000000014 {
    constructor() {
        this.name = 'AddWalletBalance1740000000014';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "wallet_balance" DECIMAL(12,2) NOT NULL DEFAULT 0
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "wallet_balance"
    `);
    }
}
//# sourceMappingURL=014-add-wallet-balance.js.map