import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// bcrypt hash of 'Test@1234' (rounds=10)
// Pre-computed to avoid slow hashing in seed loop
const PASSWORD = 'Test@1234';

const TEST_USERS = [
  {
    role: 'shop_owner',
    firstName: 'Owner',
    lastName: 'Admin',
    phone: '9800000001',
    email: 'owner@dreamgadgets.in',
  },
  {
    role: 'store_manager',
    firstName: 'Store',
    lastName: 'Manager',
    phone: '9800000002',
    email: 'manager@dreamgadgets.in',
  },
  {
    role: 'shop_sales',
    firstName: 'Shop',
    lastName: 'Sales',
    phone: '9800000003',
    email: 'shopsales@dreamgadgets.in',
  },
  {
    role: 'store_sales',
    firstName: 'Store',
    lastName: 'Sales',
    phone: '9800000004',
    email: 'storesales@dreamgadgets.in',
  },
  {
    role: 'calling_staff',
    firstName: 'Calling',
    lastName: 'Staff',
    phone: '9800000005',
    email: 'calling@dreamgadgets.in',
  },
  {
    role: 'employee',
    firstName: 'Basic',
    lastName: 'Employee',
    phone: '9800000006',
    email: 'employee@dreamgadgets.in',
  },
];

export async function seedTestUsers(dataSource: DataSource): Promise<void> {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const [branch] = await dataSource.query(
    `SELECT id FROM branches WHERE code = 'MAIN' LIMIT 1`,
  );
  const branchId = branch?.id;

  for (const u of TEST_USERS) {
    const [role] = await dataSource.query(
      `SELECT id FROM roles WHERE name = $1 LIMIT 1`,
      [u.role],
    );
    if (!role) {
      console.warn(`  ⚠ Role '${u.role}' not found — skipping ${u.email}`);
      continue;
    }

    await dataSource.query(
      `INSERT INTO users (phone, email, password_hash, first_name, last_name, role_id, branch_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       ON CONFLICT (phone) DO UPDATE
         SET email = EXCLUDED.email,
             password_hash = EXCLUDED.password_hash,
             role_id = EXCLUDED.role_id,
             is_active = true`,
      [u.phone, u.email, passwordHash, u.firstName, u.lastName, role.id, branchId],
    );
    console.log(`  ✓ ${u.role.padEnd(16)} → ${u.email}  /  ${u.phone}`);
  }

  console.log(`\n  Password for all test users: ${PASSWORD}`);
}
