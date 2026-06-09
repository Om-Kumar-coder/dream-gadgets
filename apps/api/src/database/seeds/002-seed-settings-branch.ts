import { DataSource } from 'typeorm';

const DEFAULT_SETTINGS = [
  {
    key: 'invoice.prefix',
    value: '"DG"',
    description: 'Invoice number prefix',
  },
  {
    key: 'return.window_days',
    value: '7',
    description: 'Default return window in days',
  },
  {
    key: 'return.approval_threshold_manager',
    value: '5000',
    description: 'Return amount (INR) requiring manager approval',
  },
  {
    key: 'return.approval_threshold_owner',
    value: '25000',
    description: 'Return amount (INR) requiring owner approval',
  },
  {
    key: 'discount.threshold_manager',
    value: '5',
    description: 'Discount % above which manager approval is required',
  },
  {
    key: 'discount.threshold_owner',
    value: '15',
    description: 'Discount % above which owner approval is required',
  },
  {
    key: 'exchange.kyc_threshold',
    value: '10000',
    description: 'Exchange value (INR) above which EKYC is mandatory',
  },
  {
    key: 'exchange.override_threshold_pct',
    value: '10',
    description: 'Exchange price override % above which manager approval is required',
  },
  {
    key: 'pos.lock_ttl_minutes',
    value: '15',
    description: 'POS item soft-lock TTL in minutes',
  },
  {
    key: 'notification.templates',
    value: JSON.stringify({
      'sale.invoice': {
        email: { subject: 'Your Invoice from Dream Gadgets — {{invoiceNumber}}', body: '' },
        whatsapp: { template: 'sale_invoice', params: ['customerName', 'invoiceNumber', 'amount'] },
      },
      'order.confirmed': {
        email: { subject: 'Order Confirmed — {{orderNumber}}', body: '' },
        whatsapp: { template: 'order_confirmed', params: ['orderNumber', 'total'] },
      },
      'order.shipped': {
        whatsapp: { template: 'order_shipped', params: ['orderNumber', 'trackingNumber', 'courier'] },
        sms: { message: 'Your order {{orderNumber}} has been shipped via {{courier}}. Track: {{trackingNumber}}' },
      },
    }),
    description: 'Notification templates',
  },
  {
    key: 'gst.default_rate',
    value: '18',
    description: 'Default GST rate percentage',
  },
  {
    key: 'warranty.sealed_pack_months',
    value: '12',
    description: 'Warranty months for sealed pack items',
  },
  {
    key: 'warranty.open_box_months',
    value: '6',
    description: 'Warranty months for open box / super mint items',
  },
];

export async function seedSettingsAndBranch(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Insert default settings
    for (const setting of DEFAULT_SETTINGS) {
      await queryRunner.query(
        `INSERT INTO settings (key, value, description)
         VALUES ($1, $2::jsonb, $3)
         ON CONFLICT (key) DO NOTHING`,
        [setting.key, setting.value, setting.description],
      );
    }

    // Insert real branches — Dream Gadgets Kolkata
    const branches = [
      {
        name: 'Dream Gadgets — Chetla (Main Branch)',
        code: 'CHETLA',
        address: '29A, Pitambar Ghatak Lane, Chetla, Near Chetla Police Station, Opp. CIT Market',
        city: 'Kolkata',
        state: 'West Bengal',
        pincode: '700027',
        phone: '8282011193',
        whatsapp: '8282011193',
        email: 'dreamgadgetskolkata@gmail.com',
        instagram: '@dream_gadgets_kolkata',
        workingHours: '12:30 PM – 9:30 PM',
        gstin: '27AAAAA0000A1Z5',
        mapUrl: null,
        sortOrder: 1,
      },
      {
        name: 'Dream Gadgets 2.0 — Jadavpur',
        code: 'JADAVPUR',
        address: '17, Sukanta Setu, Sulekha More, Jadavpur',
        city: 'Kolkata',
        state: 'West Bengal',
        pincode: '700032',
        phone: '9038312344',
        whatsapp: '9038312344',
        email: 'dreamgadgetskolkata@gmail.com',
        instagram: '@dreamgadgets_kolkata_2.0',
        workingHours: '2:00 PM – 10:00 PM',
        gstin: null,
        mapUrl: null,
        sortOrder: 2,
      },
      {
        name: 'Dream Gadgets 3.0 — Champahati',
        code: 'CHAMPAHATI',
        address: 'Champahati Station Road, Near Nilmanikar Vidyalaya',
        city: 'Champahati',
        state: 'West Bengal',
        pincode: '743330',
        phone: '8282011194',
        whatsapp: '8282011194',
        email: 'dreamgadgetskolkata@gmail.com',
        instagram: '@dreamgadgets_kolkata_3.0',
        workingHours: '12:30 PM – 9:30 PM',
        gstin: null,
        mapUrl: null,
        sortOrder: 3,
      },
    ];

    for (const b of branches) {
      const result = await queryRunner.query(
        `INSERT INTO branches (name, code, address, city, state, pincode, phone, whatsapp, email, instagram, working_hours, gstin, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (code) DO NOTHING
         RETURNING id`,
        [b.name, b.code, b.address, b.city, b.state, b.pincode, b.phone, b.whatsapp, b.email, b.instagram, b.workingHours, b.gstin, b.sortOrder],
      );
      if (result.length > 0) {
        console.log(`✓ Branch "${b.name}" created: ${result[0].id}`);
      }
    }

    // Insert sample brands
    const brands = [
      { name: 'Apple', sortOrder: 1 },
      { name: 'Samsung', sortOrder: 2 },
      { name: 'OnePlus', sortOrder: 3 },
      { name: 'Xiaomi', sortOrder: 4 },
      { name: 'Realme', sortOrder: 5 },
      { name: 'Vivo', sortOrder: 6 },
      { name: 'Oppo', sortOrder: 7 },
      { name: 'Google', sortOrder: 8 },
    ];

    for (const brand of brands) {
      await queryRunner.query(
        `INSERT INTO brands (name, sort_order) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
        [brand.name, brand.sortOrder],
      );
    }

    await queryRunner.commitTransaction();
    console.log('✓ Settings, branch, and brands seeded');
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
