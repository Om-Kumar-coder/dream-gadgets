import { TableColumn } from 'typeorm';
export class AddClientGstin1700000000019 {
    constructor() {
        this.name = 'AddClientGstin1700000000019';
    }
    async up(queryRunner) {
        const tableInfo = await queryRunner.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'clients'`);
        const existingCols = tableInfo.map((r) => r.column_name);
        if (!existingCols.includes('gstin')) {
            await queryRunner.addColumn('clients', new TableColumn({
                name: 'gstin',
                type: 'varchar',
                length: '20',
                isNullable: true,
            }));
        }
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('clients', 'gstin');
    }
}
//# sourceMappingURL=019-add-client-gstin.js.map