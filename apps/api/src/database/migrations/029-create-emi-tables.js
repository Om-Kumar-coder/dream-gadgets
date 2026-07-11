export class CreateEmiTables1712345678029 {
    constructor() {
        this.name = 'CreateEmiTables1712345678029';
    }
    async up(queryRunner) {
        // ── EMI Providers ──────────────────────────────────────────────────
        await queryRunner.query(`
      CREATE TABLE "emi_providers" (
        "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"          VARCHAR(100) NOT NULL,
        "slug"          VARCHAR(50) NOT NULL UNIQUE,
        "description"   TEXT,
        "logo_url"      VARCHAR(500),
        "is_active"     BOOLEAN NOT NULL DEFAULT true,
        "sort_order"    INTEGER NOT NULL DEFAULT 0,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        // ── EMI Plans ──────────────────────────────────────────────────────
        await queryRunner.query(`
      CREATE TABLE "emi_plans" (
        "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "provider_id"   UUID NOT NULL REFERENCES emi_providers(id) ON DELETE CASCADE,
        "label"         VARCHAR(100) NOT NULL,
        "tenure_months" INTEGER NOT NULL,
        "min_amount"    NUMERIC(10,2) NOT NULL DEFAULT 0,
        "max_amount"    NUMERIC(10,2),
        "annual_rate"   NUMERIC(5,2) NOT NULL,
        "processing_fee" NUMERIC(10,2) NOT NULL DEFAULT 0,
        "is_active"     BOOLEAN NOT NULL DEFAULT true,
        "sort_order"    INTEGER NOT NULL DEFAULT 0,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`CREATE INDEX idx_emi_plans_provider ON emi_plans(provider_id)`);
        await queryRunner.query(`CREATE INDEX idx_emi_plans_active ON emi_plans(is_active) WHERE is_active = true`);
        await queryRunner.query(`CREATE INDEX idx_emi_plans_active_lookup ON emi_plans(provider_id, is_active, min_amount)`);
        // ── Seed default EMI provider (Bajaj Finserv) ─────────────────────
        await queryRunner.query(`
      INSERT INTO emi_providers (id, name, slug, description, sort_order)
      VALUES
        (gen_random_uuid(), 'Bajaj Finserv', 'bajaj_finserv', 'No-cost EMI available on all major credit cards', 1),
        (gen_random_uuid(), 'ZestMoney', 'zest_money', 'Flexible EMI options with minimal documentation', 2),
        (gen_random_uuid(), 'ICICI Bank', 'icici_bank', 'Low-interest EMI on ICICI credit cards', 3)
    `);
        // ── Seed default EMI plans ─────────────────────────────────────────
        await queryRunner.query(`
      INSERT INTO emi_plans (provider_id, label, tenure_months, min_amount, max_amount, annual_rate, processing_fee, sort_order)
      SELECT
        p.id, label, tenure, min_amt, max_amt, rate, fee, sort
      FROM emi_providers p
      CROSS JOIN (
        VALUES
          ('bajaj_finserv', '3 Months', 3, 3000, NULL, 14.00, 0, 1),
          ('bajaj_finserv', '6 Months', 6, 3000, NULL, 14.00, 0, 2),
          ('bajaj_finserv', '9 Months', 9, 5000, NULL, 15.00, 99, 3),
          ('bajaj_finserv', '12 Months', 12, 5000, NULL, 16.00, 99, 4),
          ('bajaj_finserv', '18 Months', 18, 10000, NULL, 17.00, 199, 5),
          ('bajaj_finserv', '24 Months', 24, 15000, NULL, 18.00, 299, 6),
          ('zest_money', '3 Months', 3, 2000, 50000, 0.00, 0, 1),
          ('zest_money', '6 Months', 6, 2000, 50000, 0.00, 0, 2),
          ('zest_money', '9 Months', 9, 3000, 100000, 12.00, 49, 3),
          ('zest_money', '12 Months', 12, 3000, 100000, 14.00, 99, 4),
          ('icici_bank', '3 Months', 3, 5000, NULL, 0.00, 0, 1),
          ('icici_bank', '6 Months', 6, 5000, NULL, 11.00, 0, 2),
          ('icici_bank', '9 Months', 9, 10000, NULL, 12.00, 99, 3),
          ('icici_bank', '12 Months', 12, 10000, NULL, 13.00, 99, 4)
      ) AS data(slug, label, tenure, min_amt, max_amt, rate, fee, sort)
      WHERE p.slug = data.slug
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "emi_plans"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "emi_providers"`);
    }
}
//# sourceMappingURL=029-create-emi-tables.js.map