import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNotificationDeliveryColumns1700000000017 implements MigrationInterface {
  name = 'AddNotificationDeliveryColumns1700000000017';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableInfo = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications'`,
    );
    const existingCols = tableInfo.map((r: any) => r.column_name);

    const adds: TableColumn[] = [];

    if (!existingCols.includes('attempts')) {
      adds.push(
        new TableColumn({
          name: 'attempts',
          type: 'int',
          default: 0,
        }),
      );
    }

    if (!existingCols.includes('provider_message_id')) {
      adds.push(
        new TableColumn({
          name: 'provider_message_id',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    if (!existingCols.includes('error_message')) {
      adds.push(
        new TableColumn({
          name: 'error_message',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    if (!existingCols.includes('target')) {
      adds.push(
        new TableColumn({
          name: 'target',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    if (!existingCols.includes('last_attempt_at')) {
      adds.push(
        new TableColumn({
          name: 'last_attempt_at',
          type: 'timestamptz',
          isNullable: true,
        }),
      );
    }

    if (adds.length > 0) {
      await queryRunner.addColumns('notifications', adds);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('notifications', [
      'attempts',
      'provider_message_id',
      'error_message',
      'target',
      'last_attempt_at',
    ]);
  }
}
