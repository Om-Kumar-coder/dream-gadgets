import { TableColumn } from 'typeorm';
export class AddNotificationReadColumns1730000000015 {
    constructor() {
        this.name = 'AddNotificationReadColumns1730000000015';
    }
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.dropColumns('notifications', ['is_read', 'read_at']);
    }
}
//# sourceMappingURL=015-add-notification-read-columns.js.map