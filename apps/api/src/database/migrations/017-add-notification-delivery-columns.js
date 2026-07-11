import { TableColumn } from 'typeorm';
export class AddNotificationDeliveryColumns1700000000017 {
    constructor() {
        this.name = 'AddNotificationDeliveryColumns1700000000017';
    }
    async up(queryRunner) {
        const tableInfo = await queryRunner.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications'`);
        const existingCols = tableInfo.map((r) => r.column_name);
        const adds = [];
        if (!existingCols.includes('attempts')) {
            adds.push(new TableColumn({
                name: 'attempts',
                type: 'int',
                default: 0,
            }));
        }
        if (!existingCols.includes('provider_message_id')) {
            adds.push(new TableColumn({
                name: 'provider_message_id',
                type: 'varchar',
                length: '255',
                isNullable: true,
            }));
        }
        if (!existingCols.includes('error_message')) {
            adds.push(new TableColumn({
                name: 'error_message',
                type: 'text',
                isNullable: true,
            }));
        }
        if (!existingCols.includes('target')) {
            adds.push(new TableColumn({
                name: 'target',
                type: 'varchar',
                length: '255',
                isNullable: true,
            }));
        }
        if (!existingCols.includes('last_attempt_at')) {
            adds.push(new TableColumn({
                name: 'last_attempt_at',
                type: 'timestamptz',
                isNullable: true,
            }));
        }
        if (adds.length > 0) {
            await queryRunner.addColumns('notifications', adds);
        }
    }
    async down(queryRunner) {
        await queryRunner.dropColumns('notifications', [
            'attempts',
            'provider_message_id',
            'error_message',
            'target',
            'last_attempt_at',
        ]);
    }
}
//# sourceMappingURL=017-add-notification-delivery-columns.js.map