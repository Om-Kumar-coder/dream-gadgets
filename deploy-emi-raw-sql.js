const { Client } = require('ssh2');
const conn = new Client();

const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const DIR = '/var/www/dream-gadgets';

const SQL = `
-- =============================================
-- Run ALL SQL for EMI setup in one transaction
-- =============================================
BEGIN;

-- 1. Create emi_providers table (if not exists)
CREATE TABLE IF NOT EXISTS emi_providers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  logo_url    VARCHAR(500),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create emi_plans table (if not exists)
CREATE TABLE IF NOT EXISTS emi_plans (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id    UUID NOT NULL REFERENCES emi_providers(id) ON DELETE CASCADE,
  label          VARCHAR(255) NOT NULL,
  tenure_months  INTEGER NOT NULL,
  min_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_amount     NUMERIC(10,2),
  annual_rate    NUMERIC(5,2) NOT NULL DEFAULT 0,
  processing_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create indices
CREATE INDEX IF NOT EXISTS idx_emi_plans_provider ON emi_plans(provider_id);
CREATE INDEX IF NOT EXISTS idx_emi_plans_active ON emi_plans(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_emi_providers_active ON emi_providers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_emi_plans_active_lookup ON emi_plans(provider_id, is_active, min_amount);

-- 4. Seed providers (ON CONFLICT DO NOTHING for idempotency)
INSERT INTO emi_providers (id, name, slug, description, is_active, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Bajaj Finserv', 'bajaj_finserv', 'Bajaj Finserv EMI options - flexible tenures up to 24 months', true, 1),
  ('a0000000-0000-0000-0000-000000000002', 'ZestMoney', 'zestmoney', 'ZestMoney - 0% No Cost EMI on select tenures', true, 2),
  ('a0000000-0000-0000-0000-000000000003', 'ICICI Bank', 'icici_bank', 'ICICI Bank credit card EMI options', true, 3)
ON CONFLICT (slug) DO NOTHING;

-- 5. Seed plans
-- Bajaj Finserv plans
INSERT INTO emi_plans (provider_id, label, tenure_months, min_amount, max_amount, annual_rate, processing_fee, is_active, sort_order)
SELECT id, '3 Months', 3, 3000, NULL, 14, 0, true, 1 FROM emi_providers WHERE slug = 'bajaj_finserv'
AND NOT EXISTS (SELECT 1 FROM emi_plans WHERE provider_id = (SELECT id FROM emi_providers WHERE slug = 'bajaj_finserv') AND tenure_months = 3);

INSERT INTO emi_plans (provider_id, label, tenure_months, min_amount, max_amount, annual_rate, processing_fee, is_active, sort_order)
SELECT id, '6 Months', 6, 3000, NULL, 15, 0, true, 2 FROM emi_providers WHERE slug = 'bajaj_finserv'
AND NOT EXISTS (SELECT 1 FROM emi_plans WHERE provider_id = (SELECT id FROM emi_providers WHERE slug = 'bajaj_finserv') AND tenure_months = 6);

INSERT INTO emi_plans (provider_id, label, tenure_months, min_amount, max_amount, annual_rate, processing_fee, is_active, sort_order)
SELECT id, '9 Months', 9, 3000, NULL, 16, 0, true, 3 FROM emi_providers WHERE slug = 'bajaj_finserv'
AND NOT EXISTS (SELECT 1 FROM emi_plans WHERE provider_id = (SELECT id FROM emi_providers WHERE slug = 'bajaj_finserv') AND tenure_months = 9);

INSERT INTO emi_plans (provider_id, label, tenure_months, min_amount, max_amount, annual_rate, processing_fee, is_active, sort_order)
SELECT id, '12 Months', 12, 3000, NULL, 17, 0, true, 4 FROM emi_providers WHERE slug = 'bajaj_finserv'
AND NOT EXISTS (SELECT 1 FROM emi_plans WHERE provider_id = (SELECT id FROM emi_providers WHERE slug = 'bajaj_finserv') AND tenure_months = 12);

INSERT INTO emi_plans (provider_id, label, tenure_months, min_amount, max_amount, annual_rate, processing_fee, is_active, sort_order)
SELECT id, '18 Months', 18, 3000, NULL, 18, 100, true, 5 FROM emi_providers WHERE slug = 'bajaj_finserv'
AND NOT EXISTS (SELECT 1 FROM emi_plans WHERE provider_id = (SELECT id FROM emi_providers WHERE slug = 'bajaj_finserv') AND tenure_months = 18);

INSERT INTO emi_plans (provider_id, label, tenure_months, min_amount, max_amount, annual_rate, processing_fee, is_active, sort_order)
SELECT id, '24 Months', 24, 5000, NULL, 18, 200, true, 6 FROM emi_providers WHERE slug = 'bajaj_finserv'
AND NOT EXISTS (SELECT 1 FROM emi_plans WHERE provider_id = (SELECT id FROM emi_providers WHERE slug = 'bajaj_finserv') AND tenure_months = 24);

-- ZestMoney plans (0% No Cost EMI on 3 & 6 months)
INSERT INTO emi_plans (provider_id, label, tenure_months, min_amount, max_amount, annual_rate, processing_fee, is_active, sort_order)
SELECT id, '3 Months (0% No Cost EMI)', 3, 2000, 50000, 0, 0, true, 1 FROM emi_providers WHERE slug = 'zestmoney'
AND NOT EXISTS (SELECT 1 FROM emi_plans WHERE provider_id = (SELECT id FROM emi_providers WHERE slug = 'zestmoney') AND tenure_months = 3);

INSERT INTO emi_plans (provider_id, label, tenure_months, min_amount, max_amount, annual_rate, processing_fee, is_active, sort_order)
SELECT id, '6 Months (0% No Cost EMI)', 6, 2000, 50000, 0, 0, true, 2 FROM emi_providers WHERE slug = 'zestmoney'
AND NOT EXISTS (SELECT 1 FROM emi_plans WHERE provider_id = (SELECT id FROM emi_providers WHERE slug = 'zestmoney') AND tenure_months = 6);

INSERT INTO emi_plans (provider_id, label, tenure_months, min_amount, max_amount, annual_rate, processing_fee, is_active, sort_order)
SELECT id, '9 Months', 9, 3000, 100000, 14, 0, true, 3 FROM emi_providers WHERE slug = 'zestmoney'
AND NOT EXISTS (SELECT 1 FROM emi_plans WHERE provider_id = (SELECT id FROM emi_providers WHERE slug = 'zestmoney') AND tenure_months = 9);

INSERT INTO emi_plans (provider_id, label, tenure_months, min_amount, max_amount, annual_rate, processing_fee, is_active, sort_order)
SELECT id, '12 Months', 12, 3000, 100000, 16, 0, true, 4 FROM emi_providers WHERE slug = 'zestmoney'
AND NOT EXISTS (SELECT 1 FROM emi_plans WHERE provider_id = (SELECT id FROM emi_providers WHERE slug = 'zestmoney') AND tenure_months = 12);

-- ICICI Bank plans
INSERT INTO emi_plans (provider_id, label, tenure_months, min_amount, max_amount, annual_rate, processing_fee, is_active, sort_order)
SELECT id, '3 Months (0% No Cost)', 3, 5000, 200000, 0, 0, true, 1 FROM emi_providers WHERE slug = 'icici_bank'
AND NOT EXISTS (SELECT 1 FROM emi_plans WHERE provider_id = (SELECT id FROM emi_providers WHERE slug = 'icici_bank') AND tenure_months = 3);

INSERT INTO emi_plans (provider_id, label, tenure_months, min_amount, max_amount, annual_rate, processing_fee, is_active, sort_order)
SELECT id, '6 Months', 6, 5000, 200000, 12, 0, true, 2 FROM emi_providers WHERE slug = 'icici_bank'
AND NOT EXISTS (SELECT 1 FROM emi_plans WHERE provider_id = (SELECT id FROM emi_providers WHERE slug = 'icici_bank') AND tenure_months = 6);

INSERT INTO emi_plans (provider_id, label, tenure_months, min_amount, max_amount, annual_rate, processing_fee, is_active, sort_order)
SELECT id, '9 Months', 9, 5000, 200000, 14, 0, true, 3 FROM emi_providers WHERE slug = 'icici_bank'
AND NOT EXISTS (SELECT 1 FROM emi_plans WHERE provider_id = (SELECT id FROM emi_providers WHERE slug = 'icici_bank') AND tenure_months = 9);

INSERT INTO emi_plans (provider_id, label, tenure_months, min_amount, max_amount, annual_rate, processing_fee, is_active, sort_order)
SELECT id, '12 Months', 12, 5000, 200000, 15, 100, true, 4 FROM emi_providers WHERE slug = 'icici_bank'
AND NOT EXISTS (SELECT 1 FROM emi_plans WHERE provider_id = (SELECT id FROM emi_providers WHERE slug = 'icici_bank') AND tenure_months = 12);

-- 6. Seed permissions for emi module
INSERT INTO permissions (module, action) VALUES
  ('emi', 'view'),
  ('emi', 'create'),
  ('emi', 'edit'),
  ('emi', 'delete')
ON CONFLICT (module, action) DO NOTHING;

-- Assign to admin and shop_owner roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE p.module = 'emi'
  AND r.name IN ('admin', 'shop_owner')
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

COMMIT;
`;

const steps = [
  { label: 'Git pull latest', cmd: `cd ${DIR} && git stash 2>/dev/null; git pull 2>&1 | tail -3` },
  { label: 'Build API with nest', cmd: `cd ${DIR}/apps/api && npx nest build 2>&1 | tail -5` },
  { label: 'Run raw SQL migration (tables, seeds, permissions)', cmd: `sudo -u postgres psql -d dreamgadgets -c "${SQL.replace(/"/g, '\\"').replace(/\n/g, ' ')}" 2>&1` },
  { label: 'Verify EMI tables', cmd: `sudo -u postgres psql -d dreamgadgets -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'emi_%'"` },
  { label: 'Verify providers (id, name, slug)', cmd: `sudo -u postgres psql -d dreamgadgets -t -c "SELECT id, name, slug FROM emi_providers ORDER BY sort_order"` },
  { label: 'Verify plans (provider, label, tenure, rate)', cmd: `sudo -u postgres psql -d dreamgadgets -t -c "SELECT p.name AS prov, pl.label, pl.tenure_months, pl.annual_rate FROM emi_plans pl JOIN emi_providers p ON p.id=pl.provider_id ORDER BY p.sort_order, pl.sort_order"` },
  { label: 'Restart API and wait', cmd: `pm2 restart dream-gadgets-api --update-env 2>&1 && sleep 5` },
  { label: 'Health check', cmd: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health` },
  { label: 'TEST: GET /api/v1/public/emi/plans?amount=15000', cmd: `curl -s http://localhost:3000/api/v1/public/emi/plans?amount=15000` },
  { label: 'TEST: POST /api/v1/public/emi/calculate', cmd: `curl -s -X POST http://localhost:3000/api/v1/public/emi/calculate -H "Content-Type: application/json" -d '{"principal":50000,"tenureMonths":12,"annualRate":14}'` },
];

conn.on('ready', async () => {
  console.log('=== SSH CONNECTED ===\n');
  for (let i = 0; i < steps.length; i++) {
    const { label, cmd } = steps[i];
    console.log(`[${i + 1}/${steps.length}] ${label}`);
    await new Promise((resolve) => {
      conn.exec(cmd, (err, stream) => {
        if (err) { console.log(`  ERROR: ${err.message}\n`); resolve(); return; }
        stream.on('data', d => process.stdout.write(d.toString()));
        stream.stderr.on('data', d => process.stdout.write(d.toString()));
        stream.on('close', (code) => { console.log(`  [exit: ${code}]\n`); resolve(); });
      });
    });
  }
  console.log('=== ALL DONE ===');
  conn.end();
});
conn.on('error', e => { console.error('SSH Error:', e.message); process.exit(1); });
conn.connect({ host: HOST, port: 22, username: USER, password: PASS, readyTimeout: 120000, keepaliveInterval: 10000 });
