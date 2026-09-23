/**
 * Remove ALL dummy/demo/seeded products from the customer-facing catalog.
 *
 * Safety model (run against production AFTER a backup):
 *  1. Only deletes inventory items that have NEVER been part of a real sale or
 *     online order. Referenced items are merely hidden (is_online = false,
 *     status = 'retired_dummy') so historical orders/sales stay intact.
 *  2. Deletes seed artefacts that have no FK dependents: item photos of deleted
 *     items, dummy models, dummy brand logos and sample accessories. Brands and
 *     models still referenced by retained items survive (they may hold real data).
 *  3. Idempotent — re-running matches nothing and exits cleanly.
 *
 * Usage (from apps/api):
 *   npx ts-node -P tsconfig.ts-node.json -r tsconfig-paths/register \
 *     src/database/scripts/remove-dummy-products.ts
 */
import { AppDataSource } from '../data-source';

const DUMMY_STATUS = 'retired_dummy';

async function main() {
  await AppDataSource.initialize();
  console.log('Connected — removing dummy products (order-safe)...');
  const q = AppDataSource.createQueryRunner();
  await q.connect();
  await q.startTransaction();

  try {
    // ── 1. Identify items that are part of commerce history ──────────────────
    // sale_items.item_id, online_order_items.item_id, transfers, returns,
    // exchanges, reviews and purchases all reference inventory_items. Anything
    // referenced must be preserved (hidden), never hard-deleted.
    // Any of these tables may reference an inventory item — an item that appears
    // in ANY of them is part of business history and must never be hard-deleted.
    const REFERENCED_ITEM_FILTER = `
      SELECT item_id FROM sale_items WHERE item_id IS NOT NULL
      UNION SELECT item_id FROM online_order_items WHERE item_id IS NOT NULL
      UNION SELECT item_id FROM stock_transfer_items WHERE item_id IS NOT NULL
      UNION SELECT item_id FROM purchase_items WHERE item_id IS NOT NULL
      UNION SELECT item_id FROM return_items WHERE item_id IS NOT NULL
      UNION SELECT item_id FROM product_reviews WHERE item_id IS NOT NULL
    `;

    const counts = (await q.query(`
      SELECT
        (SELECT COUNT(*) FROM inventory_items
           WHERE id IN (${REFERENCED_ITEM_FILTER}))                            AS referenced_count,
        (SELECT COUNT(*) FROM inventory_items
           WHERE id NOT IN (${REFERENCED_ITEM_FILTER}))                        AS unreferenced_count
    `))[0];

    console.log(`Items referenced by orders/sales/transfers (will be hidden): ${counts.referenced_count}`);
    console.log(`Items never sold/ordered/transferred (will be deleted):      ${counts.unreferenced_count}`);

    // ── 2. Delete photos of unreferenced items (FK cascade would also do this)─
    await q.query(`
      DELETE FROM item_photos
      WHERE item_id IN (
        SELECT ii.id FROM inventory_items ii
        WHERE ii.id NOT IN (${REFERENCED_ITEM_FILTER})
      )
    `);

    // ── 3. Delete unreferenced inventory items ───────────────────────────────
    const del = await q.query(`
      DELETE FROM inventory_items
      WHERE id NOT IN (${REFERENCED_ITEM_FILTER})
      RETURNING id
    `);
    console.log(`Deleted unreferenced inventory items: ${del.length}`);

    // ── 4. Hide anything still referenced by history so it never shows online ─
    const hidden = await q.query(
      `UPDATE inventory_items
       SET is_online = false, status = $1, updated_at = NOW()
       WHERE is_online = true OR status = 'available'
       RETURNING id`,
      [DUMMY_STATUS],
    );
    console.log(`Hid remaining (history-referenced) items from catalog: ${hidden.length}`);

    // ── 5. Sample accessories from the product seed ──────────────────────────
    const acc = await q.query(`DELETE FROM accessories WHERE sku LIKE 'ACC-%' RETURNING sku`);
    console.log(`Deleted sample accessories: ${acc.length}`);

    // ── 6. Dummy models (safe: no orders can exist for a deleted item's model) ─
    const models = await q.query(`
      DELETE FROM models
      WHERE id NOT IN (SELECT DISTINCT model_id FROM inventory_items)
      RETURNING id
    `);
    console.log(`Deleted dummy models: ${models.length}`);

    // ── 7. Brand logos that point at placeholder SVGs (schema stays) ──────────
    const logos = await q.query(`
      UPDATE brands SET logo_url = NULL
      WHERE logo_url LIKE '/images/placeholders/%' OR logo_url LIKE 'https://via.placeholder.com%'
      RETURNING id
    `);
    console.log(`Cleared placeholder brand logos: ${logos.length}`);

    await q.commitTransaction();
    console.log('\n✅ Dummy product cleanup complete.');
    console.log('   Catalog is now empty and ready for real products.');
    console.log('   Admin → Inventory → Add Item to upload real stock.');
  } catch (err) {
    await q.rollbackTransaction();
    console.error('❌ Cleanup failed, rolled back:', err);
    process.exitCode = 1;
  } finally {
    await q.release();
    await AppDataSource.destroy();
  }
}

main();
