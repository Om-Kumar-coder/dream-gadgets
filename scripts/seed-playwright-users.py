#!/usr/bin/env python3
"""Seed test users for Playwright E2E tests."""
import subprocess
import bcrypt

DB_ARGS = ['psql', '-U', 'dg_user', '-d', 'dreamgadgets', '-h', 'localhost']
ENV = {'PGPASSWORD': '?ESlq-)/e8z3LSgv'}

def run_sql(sql):
    subprocess.run(DB_ARGS + ['-c', sql], env=ENV, check=True)

# Get customer role ID
result = subprocess.run(
    DB_ARGS + ['-t', '-c', "SELECT id FROM roles WHERE name = 'customer' LIMIT 1"],
    env=ENV, capture_output=True, text=True, check=True
)
customer_role = result.stdout.strip()

# Get shop_owner role ID
result = subprocess.run(
    DB_ARGS + ['-t', '-c', "SELECT id FROM roles WHERE name = 'shop_owner' LIMIT 1"],
    env=ENV, capture_output=True, text=True, check=True
)
shop_owner_role = result.stdout.strip()

# Create bcrypt hashes
pw_hash = bcrypt.hashpw(b'Test@12345', bcrypt.gensalt(10)).decode()

# Users to create
users = [
    ('pw_auth1@test.com', '9999999901', 'Auth', 'User1', customer_role),
    ('pw_auth2@test.com', '9999999902', 'Auth', 'User2', customer_role),
    ('pw_shopper@test.com', '9999999903', 'Shopper', 'Test', customer_role),
]

for email, phone, first, last, role in users:
    sql = f"""
    INSERT INTO users (email, phone, password_hash, first_name, last_name, role_id, is_active)
    VALUES ('{email}', '{phone}', '{pw_hash}', '{first}', '{last}', '{role}', true)
    ON CONFLICT (phone) DO UPDATE SET
        email = '{email}',
        password_hash = '{pw_hash}',
        role_id = '{role}',
        is_active = true,
        failed_login_attempts = 0,
        locked_until = NULL;
    """
    run_sql(sql)
    print(f"  Created: {email} / Test@12345")

print("Done! Test users seeded successfully.")
