export class AddAccessoryIdToSaleItems1712345678900 {
    constructor() {
        this.name = 'AddAccessoryIdToSaleItems1712345678900';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE sale_items
      ADD COLUMN accessory_id VARCHAR NULL,
      ADD COLUMN quantity INT NULL DEFAULT 1
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE sale_items
      DROP COLUMN accessory_id,
      DROP COLUMN quantity
    `);
    }
}
//# sourceMappingURL=023-add-accessory-id-to-sale-items.js.map