export class CreateProductReviews1710000000000 {
    constructor() {
        this.name = 'CreateProductReviews1710000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "product_reviews" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "item_id"    UUID NOT NULL REFERENCES "inventory_items"("id") ON DELETE CASCADE,
        "user_id"    UUID REFERENCES "users"("id"),
        "client_name" VARCHAR(200) NOT NULL,
        "rating"     SMALLINT NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
        "comment"    TEXT,
        "is_verified" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`CREATE INDEX "idx_reviews_item" ON "product_reviews"("item_id")`);
        await queryRunner.query(`CREATE INDEX "idx_reviews_rating" ON "product_reviews"("rating")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "product_reviews"`);
    }
}
//# sourceMappingURL=011-create-product-reviews.js.map