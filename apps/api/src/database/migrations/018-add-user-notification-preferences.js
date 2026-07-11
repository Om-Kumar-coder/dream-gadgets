import { TableColumn } from 'typeorm';
export class AddUserNotificationPreferences1700000000018 {
    constructor() {
        this.name = 'AddUserNotificationPreferences1700000000018';
    }
    async up(queryRunner) {
        const tableInfo = await queryRunner.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`);
        const existingCols = tableInfo.map((r) => r.column_name);
        const adds = [];
        if (!existingCols.includes('email_enabled')) {
            adds.push(new TableColumn({
                name: 'email_enabled',
                type: 'boolean',
                default: true,
            }));
        }
        if (!existingCols.includes('sms_enabled')) {
            adds.push(new TableColumn({
                name: 'sms_enabled',
                type: 'boolean',
                default: true,
            }));
        }
        if (!existingCols.includes('whatsapp_enabled')) {
            adds.push(new TableColumn({
                name: 'whatsapp_enabled',
                type: 'boolean',
                default: true,
            }));
        }
        if (adds.length > 0) {
            await queryRunner.addColumns('users', adds);
        }
    }
    async down(queryRunner) {
        await queryRunner.dropColumns('users', ['email_enabled', 'sms_enabled', 'whatsapp_enabled']);
    }
}
//# sourceMappingURL=018-add-user-notification-preferences.js.map