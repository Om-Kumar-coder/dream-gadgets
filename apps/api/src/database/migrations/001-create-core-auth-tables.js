export class CreateCoreAuthTables1700000000001 {
    constructor() {
        this.name = 'CreateCoreAuthTables1700000000001';
    }
    async up(queryRunner) {
        // roles
        await queryRunner.query(`
      CREATE TABLE "roles" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"        VARCHAR(100) UNIQUE NOT NULL,
        "description" TEXT,
        "is_system"   BOOLEAN NOT NULL DEFAULT false,
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        // permissions
        await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "module"      VARCHAR(100) NOT NULL,
        "action"      VARCHAR(50)  NOT NULL,
        "description" TEXT,
        UNIQUE("module", "action")
      )
    `);
        // role_permissions
        await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role_id"       UUID NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
        "permission_id" UUID NOT NULL REFERENCES "permissions"("id") ON DELETE CASCADE,
        PRIMARY KEY ("role_id", "permission_id")
      )
    `);
        // branches
        await queryRunner.query(`
      CREATE TABLE "branches" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"       VARCHAR(200) NOT NULL,
        "code"       VARCHAR(10)  UNIQUE NOT NULL,
        "address"    TEXT,
        "city"       VARCHAR(100),
        "state"      VARCHAR(100),
        "pincode"    VARCHAR(10),
        "phone"      VARCHAR(15),
        "gstin"      VARCHAR(20),
        "is_active"  BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        // users
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email"         VARCHAR(255) UNIQUE,
        "phone"         VARCHAR(15)  UNIQUE NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "first_name"    VARCHAR(100) NOT NULL,
        "last_name"     VARCHAR(100),
        "role_id"       UUID REFERENCES "roles"("id"),
        "branch_id"     UUID REFERENCES "branches"("id"),
        "is_active"     BOOLEAN NOT NULL DEFAULT true,
        "last_login_at" TIMESTAMPTZ,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`CREATE INDEX "idx_users_phone"  ON "users"("phone")`);
        await queryRunner.query(`CREATE INDEX "idx_users_email"  ON "users"("email")`);
        await queryRunner.query(`CREATE INDEX "idx_users_role"   ON "users"("role_id")`);
        await queryRunner.query(`CREATE INDEX "idx_users_branch" ON "users"("branch_id")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "permissions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "branches"`);
    }
}
//# sourceMappingURL=001-create-core-auth-tables.js.map