import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCouponsTable1712345679000 implements MigrationInterface {
  name = 'CreateCouponsTable1712345679000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) NOT NULL UNIQUE,
        type VARCHAR(20) NOT NULL,
        value DECIMAL(12,2) NOT NULL DEFAULT 0,
        min_order_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        max_discount DECIMAL(12,2) NULL,
        usage_limit INT NOT NULL DEFAULT 0,
        per_user_limit INT NOT NULL DEFAULT 1,
        used_count INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        starts_at TIMESTAMPTZ NULL,
        expires_at TIMESTAMPTZ NULL,
        applicable_brands TEXT NULL,
        applicable_categories TEXT NULL,
        free_item_sku VARCHAR(100) NULL,
        description TEXT NULL,
        created_by VARCHAR NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Index for fast code lookup
    await queryRunner.query(`
      CREATE INDEX idx_coupons_code ON coupons (code)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_coupons_active ON coupons (is_active)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_coupons_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_coupons_code`);
    await queryRunner.query(`DROP TABLE IF EXISTS coupons`);
  }
}
