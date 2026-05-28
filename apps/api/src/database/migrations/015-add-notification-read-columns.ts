import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNotificationReadColumns1730000000015 implements MigrationInterface {
  name = 'AddNotificationReadColumns1730000000015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('notifications', [
      new TableColumn({
        name: 'is_read',
        type: 'boolean',
        default: false,
      }),
      new TableColumn({
        name: 'read_at',
        type: 'timestamptz',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('notifications', ['is_read', 'read_at']);
  }
}
