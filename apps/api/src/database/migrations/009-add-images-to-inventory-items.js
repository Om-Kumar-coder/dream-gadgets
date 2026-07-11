export class AddImagesToInventoryItems1700000000009 {
    constructor() {
        this.name = 'AddImagesToInventoryItems1700000000009';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "inventory_items" ADD COLUMN "images" JSONB NOT NULL DEFAULT '[]'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "inventory_items" DROP COLUMN IF EXISTS "images"`);
    }
}
//# sourceMappingURL=009-add-images-to-inventory-items.js.map