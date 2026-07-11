export class AlterOrderItemsImeiNullable1712345679025 {
    constructor() {
        this.name = 'AlterOrderItemsImeiNullable1712345679025';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "online_order_items"
        ALTER COLUMN "imei" TYPE VARCHAR(50),
        ALTER COLUMN "imei" DROP NOT NULL
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "online_order_items"
        ALTER COLUMN "imei" TYPE VARCHAR(15),
        ALTER COLUMN "imei" SET NOT NULL
    `);
    }
}
//# sourceMappingURL=025-alter-order-items-imei-nullable.js.map