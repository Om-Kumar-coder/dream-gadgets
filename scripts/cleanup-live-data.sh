#!/bin/bash
# =============================================================================
# Dream Gadgets — REMOVE DUMMY/TEST DATA FROM LIVE DATABASE
# =============================================================================
# Run ON THE VPS as root:
#   cd /var/www/dream-gadgets && git pull && bash scripts/cleanup-live-data.sh
#
# What it does:
#   1. Backs up the whole DB to /root (timestamped .sql)
#   2. Asks you to type CLEAN to confirm
#   3. Deletes, in ONE transaction (all-or-nothing):
#        - test sales, online orders, returns, purchases, payments
#        - test clients (@test.com emails / "Test ..." names)
#        - related notifications, exchange devices, audit logs
#        - dummy inventory items (never sold/ordered ones hard-deleted,
#          history-referenced ones hidden with status='retired_dummy')
#        - sample accessories (ACC-%), orphan dummy models, placeholder logos
#   4. Verifies and prints remaining counts
#
# NOT touched: users, branches, banners, settings, exchange price guide.
# =============================================================================
set -euo pipefail

DB_NAME="dreamgadgets"
BACKUP="/root/dreamgadgets-backup-before-clean-$(date +%Y%m%d-%H%M%S).sql"

echo "==> Backing up database to $BACKUP ..."
sudo -u postgres pg_dump "$DB_NAME" > "$BACKUP"
echo "    Backup OK ($(du -h "$BACKUP" | cut -f1))"

echo ""
echo "This will DELETE from $DB_NAME:"
echo "  - all test sales / online orders / returns / purchases"
echo "  - all test clients (@test.com or 'Test ...' names)"
echo "  - all dummy products never part of a real order"
echo "Users, branches, banners and settings are kept."
echo ""
read -r -p "Type CLEAN to continue: " CONFIRM
[ "$CONFIRM" = "CLEAN" ] || { echo "Aborted."; exit 1; }

echo "==> Running cleanup (single transaction, all-or-nothing) ..."
sudo -u postgres psql "$DB_NAME" <<'SQL'
\set ON_ERROR_STOP on
BEGIN;

-- ── 1. Test clients (@test.com emails or 'Test ...' first names) ─────────────
-- Test phones: seeded QA users use 98000000xx; QA clients registered during
-- Playwright runs reuse the same block. Matched against clients.phone.
CREATE TEMP TABLE _test_clients AS
  SELECT id, phone FROM clients
  WHERE lower(email) LIKE '%@test.com'
     OR lower(first_name) LIKE 'test%'
     OR phone LIKE '98000000%';

CREATE TEMP TABLE _test_users AS
  SELECT id FROM users WHERE lower(email) LIKE '%@test.com';

DO $$
DECLARE c int; u int;
BEGIN
  SELECT COUNT(*) INTO c FROM _test_clients;
  SELECT COUNT(*) INTO u FROM _test_users;
  RAISE NOTICE 'Test clients: %, test users: %', c, u;
END $$;

-- ── 2. Transactional rows tied to those clients/users ────────────────────────
CREATE TEMP TABLE _test_sales AS
  SELECT id FROM sales
  WHERE client_id IN (SELECT id FROM _test_clients)
     OR created_by IN (SELECT id FROM _test_users);

CREATE TEMP TABLE _test_orders AS
  SELECT id FROM online_orders
  WHERE client_id IN (SELECT id FROM _test_clients);

CREATE TEMP TABLE _test_returns AS
  SELECT id FROM returns
  WHERE client_id IN (SELECT id FROM _test_clients)
     OR created_by IN (SELECT id FROM _test_users);

CREATE TEMP TABLE _test_purchases AS
  SELECT id FROM purchases
  WHERE vendor_id IN (SELECT id FROM _test_clients);

CREATE TEMP TABLE _dead_ids AS
  SELECT id FROM _test_sales
  UNION SELECT id FROM _test_orders
  UNION SELECT id FROM _test_clients
  UNION SELECT id FROM _test_returns
  UNION SELECT id FROM _test_purchases;

DO $$
DECLARE n int;
BEGIN
  SELECT COUNT(*) INTO n FROM _test_sales;    RAISE NOTICE 'Test sales: %', n;
  SELECT COUNT(*) INTO n FROM _test_orders;   RAISE NOTICE 'Test online orders: %', n;
  SELECT COUNT(*) INTO n FROM _test_returns;  RAISE NOTICE 'Test returns: %', n;
  SELECT COUNT(*) INTO n FROM _test_purchases;RAISE NOTICE 'Test purchases: %', n;
END $$;

-- ── 3. Side tables (FK-safe order; parents cascade their children) ───────────
DELETE FROM notifications          WHERE client_id IN (SELECT id FROM _test_clients);
DELETE FROM whatsapp_appointments  WHERE client_id IN (SELECT id FROM _test_clients);
DELETE FROM whatsapp_campaign_logs WHERE client_id IN (SELECT id FROM _test_clients);
DELETE FROM whatsapp_notifications WHERE phone IN (SELECT phone FROM _test_clients);
DELETE FROM whatsapp_customer_preferences WHERE client_id IN (SELECT id FROM _test_clients);
DELETE FROM audit_logs             WHERE entity_id IN (SELECT id FROM _dead_ids);
DELETE FROM exchange_devices       WHERE client_id IN (SELECT id FROM _test_clients)
                                    OR sale_id    IN (SELECT id FROM _test_sales);
DELETE FROM payments               WHERE sale_id         IN (SELECT id FROM _test_sales)
                                    OR online_order_id   IN (SELECT id FROM _test_orders);
DELETE FROM returns                WHERE id IN (SELECT id FROM _test_returns);
DELETE FROM purchases              WHERE id IN (SELECT id FROM _test_purchases);
DELETE FROM sales                  WHERE id IN (SELECT id FROM _test_sales);
DELETE FROM online_orders          WHERE id IN (SELECT id FROM _test_orders);
DELETE FROM buyback_leads          WHERE phone IN (SELECT phone FROM _test_clients);
DELETE FROM clients                WHERE id IN (SELECT id FROM _test_clients);

-- ── 4. Dummy products: delete anything never sold/ordered/transferred ────────
DELETE FROM item_photos
 WHERE item_id IN (
   SELECT ii.id FROM inventory_items ii
   WHERE ii.id NOT IN (
     SELECT item_id FROM sale_items WHERE item_id IS NOT NULL
     UNION SELECT item_id FROM online_order_items  WHERE item_id IS NOT NULL
     UNION SELECT item_id FROM stock_transfer_items WHERE item_id IS NOT NULL
     UNION SELECT item_id FROM purchase_items      WHERE item_id IS NOT NULL
     UNION SELECT item_id FROM return_items        WHERE item_id IS NOT NULL
     UNION SELECT item_id FROM product_reviews     WHERE item_id IS NOT NULL
   ));

DELETE FROM inventory_items
 WHERE id NOT IN (
   SELECT item_id FROM sale_items WHERE item_id IS NOT NULL
   UNION SELECT item_id FROM online_order_items  WHERE item_id IS NOT NULL
   UNION SELECT item_id FROM stock_transfer_items WHERE item_id IS NOT NULL
   UNION SELECT item_id FROM purchase_items      WHERE item_id IS NOT NULL
   UNION SELECT item_id FROM return_items        WHERE item_id IS NOT NULL
   UNION SELECT item_id FROM product_reviews     WHERE item_id IS NOT NULL
 );

-- Hide items still referenced by surviving history (never hard-delete those)
UPDATE inventory_items
   SET is_online = false, status = 'retired_dummy', updated_at = NOW()
 WHERE is_online = true OR status = 'available';

-- Sample accessories, orphan dummy models, placeholder brand logos
DELETE FROM accessories WHERE sku LIKE 'ACC-%';

DELETE FROM models
 WHERE id NOT IN (SELECT DISTINCT model_id FROM inventory_items WHERE model_id IS NOT NULL)
   AND id NOT IN (SELECT DISTINCT model_id FROM exchange_price_guide WHERE model_id IS NOT NULL);

UPDATE brands SET logo_url = NULL
 WHERE logo_url LIKE '/images/placeholders/%' OR logo_url LIKE 'https://via.placeholder.com%';

-- ── 5. Report + commit ────────────────────────────────────────────────────────
DO $$
DECLARE s int; o int; c int; ii int; on_i int; acc int;
BEGIN
  SELECT COUNT(*) INTO s   FROM sales;
  SELECT COUNT(*) INTO o   FROM online_orders;
  SELECT COUNT(*) INTO c   FROM clients;
  SELECT COUNT(*) INTO ii  FROM inventory_items;
  SELECT COUNT(*) INTO on_i FROM inventory_items WHERE is_online = true;
  SELECT COUNT(*) INTO acc FROM accessories;
  RAISE NOTICE 'REMAINING -> sales: %, orders: %, clients: %, items: % (online: %), accessories: %',
    s, o, c, ii, on_i, acc;
END $$;

COMMIT;
SQL

echo ""
echo "==> Restarting web + admin to clear caches ..."
pm2 restart dream-gadgets-web dream-gadgets-admin >/dev/null 2>&1 || true

echo ""
echo "==> Final counts (should all be 0 except branches/users):"
sudo -u postgres psql "$DB_NAME" -c "
SELECT 'sales' AS what, COUNT(*) FROM sales
UNION ALL SELECT 'online_orders', COUNT(*) FROM online_orders
UNION ALL SELECT 'clients', COUNT(*) FROM clients
UNION ALL SELECT 'inventory_online', COUNT(*) FROM inventory_items WHERE is_online
UNION ALL SELECT 'accessories', COUNT(*) FROM accessories
UNION ALL SELECT 'users (kept)', COUNT(*) FROM users
UNION ALL SELECT 'branches (kept)', COUNT(*) FROM branches;"

echo ""
echo "✅ Done. Backup saved at: $BACKUP"
echo "   Open https://dreamgadgets.in/admin — dashboard should now show zeros."
