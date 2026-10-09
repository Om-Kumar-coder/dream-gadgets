#!/usr/bin/env bash
# Prod-only demo seed: insert 1-2 public catalogue products, then invalidate the
# public search cache. Idempotent via INVENTORY_ITEMS_<NAME>_ID guard.
set -euo pipefail

# Configures the DB/Redis connection from the same env file the app uses.
# Run on the Prod VPS, in /var/www/dream-gadgets:
#   export $(grep -v '^#' apps/api/.env | xargs)
#   bash scripts/prod-seed-2-public-products.sh

set -a
# shellcheck source=apps/api/.env
source apps/api/.env
set +a

export PGPASSWORD="$DATABASE_URL"

PSQL="psql \"${DATABASE_URL}\""

echo "==> Inserting/updating public demo catalogue..."
${PSQL} <<'SQL'
BEGIN;

-- Ensure DEMO branch exists (created by the admin-flow seeds).
DO $$
DECLARE
  demo_branch UUID;
BEGIN
  SELECT id INTO demo_branch FROM branches WHERE code = 'DEMO' LIMIT 1;
  IF demo_branch IS NULL THEN
    INSERT INTO branches (name, code, address, city, state, pincode, phone, whatsapp, email, instagram, sort_order)
    VALUES ('Dream Gadgets — Demo Branch', 'DEMO', 'Demo Store', 'Kolkata', 'West Bengal', '700027', '0000000000', '0000000000', 'demo@dreamgadgets.in', '', 9999)
    RETURNING id INTO demo_branch;
  END IF;
END $$;

-- ---------- Product A: Apple iPhone 14 Pro ----------
INSERT INTO inventory_items (
  id, imei, brand_id, model_id, colour, storage, condition,
  item_name, online_price, selling_price, status, is_online, created_by
)
VALUES (
  gen_random_uuid(),
  '868650000000004',                         -- Luhn-valid demo IMEI
  'ff7bacca-1a12-44e7-81f0-c52cd6c07120',  -- Apple (prod)
  '1310002d-82b8-49d6-b89c-16e9d7836c9d',  -- iPhone 14 Pro (prod)
  'Space Black', '128GB', 'sealed_pack',
  'iPhone 14 Pro 128GB Demo', 79999, 89999,
  'available', true,
  (SELECT id FROM users WHERE email = 'owner@dreamgadgets.in' LIMIT 1)
)
ON CONFLICT (imei) DO UPDATE SET
  status = 'available',
  is_online = true,
  selling_price = 89999,
  online_price = 79999,
  item_name = 'iPhone 14 Pro 128GB Demo',
  updated_at = NOW()
RETURNING id;

-- ---------- Product B: Samsung Galaxy S23 ----------
INSERT INTO inventory_items (
  id, imei, brand_id, model_id, colour, storage, condition,
  item_name, online_price, selling_price, status, is_online, created_by
)
VALUES (
  gen_random_uuid(),
  '868650000000003',                         -- Luhn-valid demo IMEI
  '8387407c-f4e4-41d3-9639-59e4dd3e501f',  -- Samsung (prod)
  'a942da0b-b070-4d4f-8e3d-b743ee859c87',  -- Galaxy S23 (prod)
  'Phantom Black', '256GB', 'sealed_pack',
  'Galaxy S23 256GB Demo', 49999, 59999,
  'available', true,
  (SELECT id FROM users WHERE email = 'owner@dreamgadgets.in' LIMIT 1)
)
ON CONFLICT (imei) DO UPDATE SET
  status = 'available',
  is_online = true,
  selling_price = 59999,
  online_price = 49999,
  item_name = 'Galaxy S23 256GB Demo',
  updated_at = NOW()
RETURNING id;

COMMIT;
SQL

echo "==> Invalidating public search cache..."
redis-cli -u "$REDIS_URL" DEL "$(redis-cli -u "$REDIS_URL" KEYS "public:products:*")" 2>/dev/null || true

echo "==> Done. Update count (items A+B):"
${PSQL} -t -c "SELECT
  (SELECT COUNT(*) FROM inventory_items WHERE item_name LIKE '%Demo%') AS demo_items;
"
