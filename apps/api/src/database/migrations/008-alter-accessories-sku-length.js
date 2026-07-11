export class AlterAccessoriesSkuLength1700000000008 {
    constructor() {
        this.name = 'AlterAccessoriesSkuLength1700000000008';
    }
    async up(queryRunner) {
        // Alter the sku column to allow longer values
        await queryRunner.query(`
      ALTER TABLE "accessories" 
      ALTER COLUMN "sku" TYPE VARCHAR(50)
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "accessories" 
      ALTER COLUMN "sku" TYPE VARCHAR(20)
    `);
    }
}
//# sourceMappingURL=008-alter-accessories-sku-length.js.map