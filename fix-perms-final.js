#!/usr/bin/env node
const { Client } = require('ssh2');
const conn = new Client();

const sql = `
-- Ensure reports.view exists in permissions table
INSERT INTO permissions (id, module, action)
SELECT gen_random_uuid(), 'reports', 'view'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE module = 'reports' AND action = 'view');

-- Ensure settings.view exists
INSERT INTO permissions (id, module, action)
SELECT gen_random_uuid(), 'settings', 'view'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE module = 'settings' AND action = 'view');

-- Add reports.view to store_manager, multi_store_manager, shop_owner
DO $$
DECLARE
  perm_reports_view UUID;
  perm_settings_view UUID;
  role_store_mgr UUID;
  role_multi_mgr UUID;
  role_owner UUID;
BEGIN
  SELECT id INTO perm_reports_view FROM permissions WHERE module = 'reports' AND action = 'view';
  SELECT id INTO perm_settings_view FROM permissions WHERE module = 'settings' AND action = 'view';
  SELECT id INTO role_store_mgr FROM roles WHERE name = 'store_manager';
  SELECT id INTO role_multi_mgr FROM roles WHERE name = 'multi_store_manager';
  SELECT id INTO role_owner FROM roles WHERE name = 'shop_owner';

  -- reports.view for store_manager and multi_store_manager
  INSERT INTO role_permissions (role_id, permission_id) VALUES
    (role_store_mgr, perm_reports_view),
    (role_multi_mgr, perm_reports_view)
  ON CONFLICT DO NOTHING;

  -- settings.view for multi_store_manager (can see branches)
  INSERT INTO role_permissions (role_id, permission_id) VALUES
    (role_multi_mgr, perm_settings_view)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Done!';
END $$;

-- Clear Redis cache
`;

conn.on('ready', () => {
  conn.exec(`psql "postgresql://dg_user:%3FESlq-)%2Fe8z3LSgv@localhost:5432/dreamgadgets" <<'EOSQL'
${sql}
EOSQL
redis-cli KEYS "perms:role:*" | xargs -r redis-cli DEL`, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => { console.log(out); conn.end(); });
  });
}).connect({ host: '187.127.165.229', username: 'root', password: '?ESlq-)/e8z3LSgv' });
