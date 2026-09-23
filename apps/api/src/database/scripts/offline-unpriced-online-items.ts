/**
 * Take every ONLINE item with no selling price OFFLINE (inventory + accessories).
 *
 * An online listing without a price is a data-integrity defect: customers see a
 * product they cannot buy, and it bypasses the pricing rule enforced by
 * InventoryService.toggleOnline() (guard added for NEW publishes — this script
 * handles legacy rows that predate it).
 *
 * Safety model:
 *  - Non-destructive: only flips is_online → false. No deletes, no price edits.
 *  - Reversible: re-publish from Admin → Inventory once a price is set
 *    (toggle-online validates the price at that point).
 *  - Idempotent: re-running matches nothing and exits cleanly.
 *  - `--dry-run` prints what it would offline without changing anything.
 *
 * Usage (from apps/api):
 *   npm run db:offline-unpriced            # apply
 *   npm run db:offline-unpriced -- --dry-run   # preview
 */
import { AppDataSource } from '../data-source';

const DRY_RUN = process.argv.includes('--dry-run');

interface Row {
  id: string;
  label: string;
  branch: string | null;
}

async function main() {
  await AppDataSource.initialize();
  const q = AppDataSource.createQueryRunner();
  await q.connect();

  try {
    const scopeNote = DRY_RUN ? 'DRY RUN — no changes will be made' : 'LIVE RUN';
    console.log(`Scanning for unpriced online items (${scopeNote})...\n`);

    // ── 1. Inventory items ──────────────────────────────────────────────────
    const invMatches: Row[] = await q.query(`
      SELECT ii.id, ii.imei AS label, b.code AS branch
      FROM inventory_items ii
      LEFT JOIN branches b ON b.id = ii.branch_id
      WHERE ii.is_online = true
        AND (ii.selling_price IS NULL OR ii.selling_price <= 0)
      ORDER BY ii.imei
    `);

    // ── 2. Accessories ──────────────────────────────────────────────────────
    const accMatches: Row[] = await q.query(`
      SELECT a.id, COALESCE(a.sku, a.name) AS label, b.code AS branch
      FROM accessories a
      LEFT JOIN branches b ON b.id = a.branch_id
      WHERE a.is_online = true
        AND (a.selling_price IS NULL OR a.selling_price <= 0)
      ORDER BY a.sku
    `);

    console.log(`Inventory items to take offline: ${invMatches.length}`);
    for (const r of invMatches) console.log(`  - ${r.label} (${r.branch ?? 'no branch'}) ${r.id}`);
    console.log(`Accessories to take offline: ${accMatches.length}`);
    for (const r of accMatches) console.log(`  - ${r.label} ${r.id}`);

    if (DRY_RUN) {
      console.log('\nDry run complete — nothing was changed.');
      return;
    }

    if (!invMatches.length && !accMatches.length) {
      console.log('\n✅ Nothing to do — catalog is already consistent.');
      return;
    }

    await q.startTransaction();
    try {
      const inv = await q.query(
        `UPDATE inventory_items SET is_online = false, updated_at = NOW()
         WHERE is_online = true AND (selling_price IS NULL OR selling_price <= 0)
         RETURNING imei`,
      );
      const acc = await q.query(
        `UPDATE accessories SET is_online = false, updated_at = NOW()
         WHERE is_online = true AND (selling_price IS NULL OR selling_price <= 0)
         RETURNING sku`,
      );
      await q.commitTransaction();
      console.log(`\n✅ Took ${inv.length} inventory item(s) and ${acc.length} accessory(ies) offline.`);
      console.log('   Set a selling price, then re-publish from Admin → Inventory.');
    } catch (err) {
      await q.rollbackTransaction();
      throw err;
    }
  } catch (err) {
    console.error('❌ Cleanup failed:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await q.release();
    await AppDataSource.destroy();
  }
}

main();
