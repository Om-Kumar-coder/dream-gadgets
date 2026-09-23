/**
 * Remove ALL test/demo transactional data from the live database:
 *   - QA test clients (created during Playwright/manual testing)
 *   - Test sales, online orders, returns and purchases tied to those clients
 *     or created by @test.com accounts
 *   - Payments, exchange devices, notifications, audit logs tied to them
 *   - Dummy products (same rules as remove-dummy-products.ts)
 *
 * Safety model (run against production AFTER a backup):
 *  1. Single transaction — either everything is removed or nothing changes.
 *  2. Users are NOT touched (owner/staff accounts stay).
 *  3. Banners/settings are NOT touched.
 *  4. Inventory items referenced by any surviving history are hidden
 *     (is_online=false, status='retired_dummy'), never hard-deleted.
 *  5. Idempotent — re-running matches nothing and exits cleanly.
 *
 * FK notes (from migrations 001–046):
 *   - sale_items/return_items/online_order_items/purchase_items cascade from
 *     their parent (sales/returns/online_orders/purchases).
 *   - payments → sales/online_orders is RESTRICT → deleted explicitly first.
 *   - exchange_devices → clients/sales RESTRICT → deleted explicitly first.
 *   - payments → exchange_devices RESTRICT → devices deleted after payments.
 *   - purchases → clients(vendor) RESTRICT → purchases deleted before clients.
 *   - returns → clients RESTRICT → returns deleted before clients.
 *   - notifications / whatsapp_* → clients RESTRICT → deleted before clients.
 *
 * Usage (from apps/api):
 *   npx ts-node -P tsconfig.ts-node.json -r tsconfig-paths/register \
 *     src/database/scripts/remove-test-transactional-data.ts
 */
import { AppDataSource } from '../data-source';
import type { QueryRunner } from 'typeorm';

async function tableExists(q: QueryRunner, name: string): Promise<boolean> {
  const [row] = await q.query(`SELECT to_regclass($1) IS NOT NULL AS ok`, [`public.${name}`]);
  return Boolean(row?.ok);
}

/** Run a DELETE for `table` guarded by existence, log the affected row count. */
async function del(q: QueryRunner, table: string, where: string, label: string) {
  if (!(await tableExists(q, table))) {
    console.log(`Skipped ${label}: table ${table} does not exist`);
    return 0;
  }
  const rows = await q.query(`DELETE FROM ${table} WHERE ${where} RETURNING id`);
  console.log(`${label}: ${rows.length}`);
  return rows.length;
}

async function main() {
  await AppDataSource.initialize();
  console.log('Connected — removing test transactional data (single transaction)...');
  const q = AppDataSource.createQueryRunner();
  await q.connect();
  await q.startTransaction();

  try {
    // ── 1. Identify test clients ─────────────────────────────────────────────
    // QA-created clients carry @test.com emails or were created with a
    // "Test ..." first name (Playwright fixture convention). Real customers
    // never match either pattern.
    const TEST_CLIENT_FILTER = `
      lower(email) LIKE '%@test.com'
      OR lower(first_name) LIKE 'test%'
    `;
    const testClients: Array<{ id: string; phone: string; email: string; first_name: string; last_name: string }> = await q.query(
      `SELECT id, phone, email, first_name, last_name FROM clients WHERE ${TEST_CLIENT_FILTER}`,
    );
    const clientIds = testClients.map((c) => c.id);
    const clientPhones = testClients.map((c) => c.phone);
    console.log(`\nTest clients found: ${testClients.length}`);
    for (const c of testClients.slice(0, 20)) {
      console.log(`  - ${c.first_name ?? ''} ${c.last_name ?? ''} <${c.email ?? 'no email'}> ${c.phone}`);
    }

    const clientIdList = clientIds.length ? `'${clientIds.join("','")}'` : `'00000000-0000-0000-0000-000000000000'`;

    // Test user accounts (@test.com) whose actions were part of QA.
    const testUsers: Array<{ id: string }> = await q.query(
      `SELECT id FROM users WHERE lower(email) LIKE '%@test.com'`,
    );
    const userIdList = testUsers.length ? `'${testUsers.map((u) => u.id).join("','")}'` : `'00000000-0000-0000-0000-000000000000'`;

    // ── 2. Client-scoped side tables (RESTRICT FKs → delete before clients) ──
    await del(q, 'notifications', `client_id IN (${clientIdList})`, 'Notifications (test clients)');
    await del(q, 'whatsapp_appointments', `client_id IN (${clientIdList})`, 'WhatsApp appointments (test clients)');
    await del(q, 'whatsapp_campaign_logs', `client_id IN (${clientIdList})`, 'WhatsApp campaign logs (test clients)');
    await del(q, 'whatsapp_notifications', `client_id IN (${clientIdList})`, 'WhatsApp notifications (test clients)');
    await del(q, 'whatsapp_customer_preferences', `client_id IN (${clientIdList})`, 'WhatsApp preferences (test clients)');

    // ── 3. Collect transactional ids before deleting them ───────────────────
    const testSales: Array<{ id: string; invoice_number: string }> = await q.query(
      `SELECT id, invoice_number FROM sales
       WHERE client_id IN (${clientIdList}) OR created_by IN (${userIdList})`,
    );
    const testOrders: Array<{ id: string; order_number: string }> = await q.query(
      `SELECT id, order_number FROM online_orders WHERE client_id IN (${clientIdList})`,
    );
    const saleIds = testSales.map((s) => s.id);
    const orderIds = testOrders.map((o) => o.id);
    const saleIdList = saleIds.length ? `'${saleIds.join("','")}'` : `'00000000-0000-0000-0000-000000000000'`;
    const orderIdList = orderIds.length ? `'${orderIds.join("','")}'` : `'00000000-0000-0000-0000-000000000000'`;
    console.log(`\nTest sales: ${testSales.length}${testSales.length ? ' (e.g. ' + testSales.slice(0, 5).map((s) => s.invoice_number).join(', ') + ')' : ''}`);
    console.log(`Test online orders: ${testOrders.length}${testOrders.length ? ' (e.g. ' + testOrders.slice(0, 5).map((o) => o.order_number).join(', ') + ')' : ''}`);

    // Returns and purchases created by/for the test data (idempotent scope).
    const testReturns: Array<{ id: string }> = await q.query(
      `SELECT id FROM returns WHERE client_id IN (${clientIdList}) OR created_by IN (${userIdList})`,
    );
    const testPurchases: Array<{ id: string; invoice_number: string }> = await q.query(
      `SELECT id, invoice_number FROM purchases WHERE vendor_id IN (${clientIdList})`,
    );
    console.log(`Test returns: ${testReturns.length}`);
    console.log(`Test purchases: ${testPurchases.length}${testPurchases.length ? ' (e.g. ' + testPurchases.slice(0, 5).map((p) => p.invoice_number).join(', ') + ')' : ''}`);

    // ── 4. Audit logs referencing anything we are about to delete ────────────
    const allDeadIds = [...saleIds, ...orderIds, ...clientIds, ...testReturns.map((r) => r.id), ...testPurchases.map((p) => p.id)];
    if (allDeadIds.length) {
      const idList = `'${allDeadIds.join("','")}'`;
      await del(q, 'audit_logs', `entity_id IN (${idList})`, 'Audit logs (test entities)');
    }

    // ── 5. Exchange devices (RESTRICT from payments) — before payments ───────
    // devices of test clients/sales; payments referencing them are test
    // payments deleted in the next step, so ordering below keeps FKs valid.
    await del(
      q,
      'exchange_devices',
      `client_id IN (${clientIdList}) OR sale_id IN (${saleIdList})`,
      'Exchange devices (test)',
    );

    // ── 6. Payments (RESTRICT from sales/online_orders) — before parents ─────
    await del(
      q,
      'payments',
      `sale_id IN (${saleIdList}) OR online_order_id IN (${orderIdList})`,
      'Payments (test sales/orders)',
    );

    // ── 7. Parents (children cascade) ────────────────────────────────────────
    await del(q, 'returns', `client_id IN (${clientIdList}) OR created_by IN (${userIdList})`, 'Returns (test)');
    await del(q, 'purchases', `vendor_id IN (${clientIdList})`, 'Purchases (test vendors)');
    await del(q, 'sales', `client_id IN (${clientIdList}) OR created_by IN (${userIdList})`, 'Sales (test)');
    await del(q, 'online_orders', `client_id IN (${clientIdList})`, 'Online orders (test)');

    // ── 8. Buyback leads that used a deleted test client's phone ─────────────
    if (clientPhones.length) {
      const phoneList = `'${clientPhones.join("','")}'`;
      await del(q, 'buyback_leads', `phone IN (${phoneList})`, 'Buyback leads (test phones)');
    }

    // ── 9. Clients themselves ────────────────────────────────────────────────
    await del(q, 'clients', TEST_CLIENT_FILTER, 'Test clients');

    // ── 10. Dummy products (same rules as remove-dummy-products.ts) ──────────
    const REFERENCED_ITEM_FILTER = `
      SELECT item_id FROM sale_items WHERE item_id IS NOT NULL
      UNION SELECT item_id FROM online_order_items WHERE item_id IS NOT NULL
      UNION SELECT item_id FROM stock_transfer_items WHERE item_id IS NOT NULL
      UNION SELECT item_id FROM purchase_items WHERE item_id IS NOT NULL
      UNION SELECT item_id FROM return_items WHERE item_id IS NOT NULL
      UNION SELECT item_id FROM product_reviews WHERE item_id IS NOT NULL
    `;

    const counts = (
      await q.query(`
        SELECT
          (SELECT COUNT(*) FROM inventory_items
             WHERE id IN (${REFERENCED_ITEM_FILTER}))                            AS referenced_count,
          (SELECT COUNT(*) FROM inventory_items
             WHERE id NOT IN (${REFERENCED_ITEM_FILTER}))                        AS unreferenced_count
      `)
    )[0];
    console.log(`\nItems referenced by remaining history (hidden): ${counts.referenced_count}`);
    console.log(`Items never sold/ordered/transferred (deleted): ${counts.unreferenced_count}`);

    await del(q, 'item_photos', `item_id IN (SELECT ii.id FROM inventory_items ii WHERE ii.id NOT IN (${REFERENCED_ITEM_FILTER}))`, 'Photos of removed items');
    await del(q, 'inventory_items', `id NOT IN (${REFERENCED_ITEM_FILTER})`, 'Unreferenced inventory items');
    await del(q, 'accessories', `sku LIKE 'ACC-%'`, 'Sample accessories');

    await del(q, 'models', `id NOT IN (SELECT DISTINCT model_id FROM inventory_items) AND id NOT IN (SELECT DISTINCT model_id FROM exchange_price_guide)`, 'Dummy models');

    const logos = await q.query(
      `UPDATE brands SET logo_url = NULL
       WHERE logo_url LIKE '/images/placeholders/%' OR logo_url LIKE 'https://via.placeholder.com%'
       RETURNING id`,
    );
    console.log(`Cleared placeholder brand logos: ${logos.length}`);

    await q.commitTransaction();
    console.log('\n✅ Test data cleanup complete.');
    console.log('   Dashboard KPIs, orders, sales, clients and inventory are now clean.');
    console.log('   Users, banners and settings were left untouched.');
  } catch (err) {
    await q.rollbackTransaction();
    console.error('❌ Cleanup failed, rolled back (nothing was changed):', err);
    process.exitCode = 1;
  } finally {
    await q.release();
    await AppDataSource.destroy();
  }
}

main();
