import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddClientGstin1700000000019 implements MigrationInterface {
  name = 'AddClientGstin1700000000019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableInfo = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'clients'`,
    );
    const existingCols = tableInfo.map((r: any) => r.column_name);

    if (!existingCols.includes('gstin')) {
      await queryRunner.addColumn(
        'clients',
        new TableColumn({
          name: 'gstin',
          type: 'varchar',
          length: '20',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('clients', 'gstin');
  }
}
