import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserNotificationPreferences1700000000018 implements MigrationInterface {
  name = 'AddUserNotificationPreferences1700000000018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableInfo = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`,
    );
    const existingCols = tableInfo.map((r: any) => r.column_name);

    const adds: TableColumn[] = [];

    if (!existingCols.includes('email_enabled')) {
      adds.push(
        new TableColumn({
          name: 'email_enabled',
          type: 'boolean',
          default: true,
        }),
      );
    }

    if (!existingCols.includes('sms_enabled')) {
      adds.push(
        new TableColumn({
          name: 'sms_enabled',
          type: 'boolean',
          default: true,
        }),
      );
    }

    if (!existingCols.includes('whatsapp_enabled')) {
      adds.push(
        new TableColumn({
          name: 'whatsapp_enabled',
          type: 'boolean',
          default: true,
        }),
      );
    }

    if (adds.length > 0) {
      await queryRunner.addColumns('users', adds);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('users', ['email_enabled', 'sms_enabled', 'whatsapp_enabled']);
  }
}
