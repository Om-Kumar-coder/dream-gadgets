import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';

/**
 * Base buyback price per model (in ₹) — curated reference values.
 * Mirrors the values previously hardcoded in the storefront so the
 * server-side estimate returns consistent prices out of the box.
 * Admin can override individual (model, condition) rows later.
 */
const MODEL_BASE_PRICES: Record<string, { brand: string; basePrice: number }> = {
  // Apple
  'iPhone 16 Pro Max': { brand: 'Apple', basePrice: 125000 },
  'iPhone 16 Pro': { brand: 'Apple', basePrice: 110000 },
  'iPhone 16': { brand: 'Apple', basePrice: 90000 },
  'iPhone 15 Pro Max': { brand: 'Apple', basePrice: 110000 },
  'iPhone 15 Pro': { brand: 'Apple', basePrice: 95000 },
  'iPhone 15': { brand: 'Apple', basePrice: 80000 },
  'iPhone 14 Pro Max': { brand: 'Apple', basePrice: 95000 },
  'iPhone 14 Pro': { brand: 'Apple', basePrice: 85000 },
  'iPhone 14': { brand: 'Apple', basePrice: 70000 },
  'iPhone 13': { brand: 'Apple', basePrice: 55000 },
  'iPhone 12': { brand: 'Apple', basePrice: 40000 },
  // Samsung
  'Galaxy S25 Ultra': { brand: 'Samsung', basePrice: 120000 },
  'Galaxy S25+': { brand: 'Samsung', basePrice: 95000 },
  'Galaxy S25': { brand: 'Samsung', basePrice: 85000 },
  'Galaxy S24 Ultra': { brand: 'Samsung', basePrice: 110000 },
  'Galaxy S24': { brand: 'Samsung', basePrice: 75000 },
  'Galaxy S23 Ultra': { brand: 'Samsung', basePrice: 95000 },
  'Galaxy S23': { brand: 'Samsung', basePrice: 65000 },
  'Galaxy Z Fold 6': { brand: 'Samsung', basePrice: 140000 },
  'Galaxy Z Flip 6': { brand: 'Samsung', basePrice: 95000 },
  'Galaxy A55': { brand: 'Samsung', basePrice: 30000 },
  'Galaxy A54': { brand: 'Samsung', basePrice: 25000 },
  // OnePlus
  'OnePlus 13': { brand: 'OnePlus', basePrice: 75000 },
  'OnePlus 12': { brand: 'OnePlus', basePrice: 65000 },
  'OnePlus 11': { brand: 'OnePlus', basePrice: 55000 },
  'OnePlus Nord 4': { brand: 'OnePlus', basePrice: 30000 },
  'OnePlus Nord CE 4': { brand: 'OnePlus', basePrice: 25000 },
  // Xiaomi / Redmi
  'Xiaomi 14 Pro': { brand: 'Xiaomi', basePrice: 55000 },
  'Xiaomi 13 Pro': { brand: 'Xiaomi', basePrice: 45000 },
  'Redmi Note 13 Pro': { brand: 'Redmi', basePrice: 25000 },
  'Redmi Note 12': { brand: 'Redmi', basePrice: 18000 },
  'Redmi Note 12 Pro': { brand: 'Redmi', basePrice: 22000 },
  // Google
  'Pixel 9 Pro': { brand: 'Google', basePrice: 85000 },
  'Pixel 9': { brand: 'Google', basePrice: 70000 },
  'Pixel 8 Pro': { brand: 'Google', basePrice: 70000 },
  'Pixel 8': { brand: 'Google', basePrice: 55000 },
  'Pixel 7a': { brand: 'Google', basePrice: 35000 },
  'Pixel 7 Pro': { brand: 'Google', basePrice: 50000 },
  'Pixel 7': { brand: 'Google', basePrice: 40000 },
};

/** Condition multipliers — same scale as the old storefront estimator. */
const CONDITION_MULTIPLIERS: Record<string, number> = {
  sealed_pack: 0.95,
  open_box: 0.9,
  super_mint: 0.85,
  mint: 0.75,
  good: 0.6,
  fair: 0.4,
  broken: 0.2,
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function seedExchangePriceGuide(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log('\n  💰 Seeding Exchange Price Guide...');

    const brandMap = new Map<string, string>();
    const modelMap = new Map<string, string>();

    for (const [modelName, data] of Object.entries(MODEL_BASE_PRICES)) {
      // ── Ensure brand exists ──────────────────────────────────────────────
      let brandId = brandMap.get(data.brand);
      if (!brandId) {
        const [existingBrand] = await queryRunner.query(
          'SELECT id FROM brands WHERE name = $1',
          [data.brand],
        );
        if (existingBrand) {
          brandId = existingBrand.id;
        } else {
          brandId = uuid();
          await queryRunner.query(
            `INSERT INTO brands (id, name, logo_url, is_active, sort_order, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [brandId, data.brand, `/images/placeholders/brand-${slugify(data.brand)}.svg`, true, 99],
          );
          console.log(`  ✓ Created brand: ${data.brand}`);
        }
        brandMap.set(data.brand, brandId!);
      }

      // ── Ensure model exists ──────────────────────────────────────────────
      let modelId = modelMap.get(modelName);
      if (!modelId) {
        const [existingModel] = await queryRunner.query(
          'SELECT id FROM models WHERE name = $1 AND brand_id = $2',
          [modelName, brandId],
        );
        if (existingModel) {
          modelId = existingModel.id;
        } else {
          modelId = uuid();
          await queryRunner.query(
            `INSERT INTO models (id, name, brand_id, slug, description, specs, is_active, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
            [
              modelId,
              modelName,
              brandId!,
              slugify(modelName),
              `Buyback reference model — ${modelName}`,
              JSON.stringify({}),
              true,
            ],
          );
        }
        modelMap.set(modelName, modelId!);
      }

      // ── Upsert price guide rows for every condition ──────────────────────
      for (const [condition, multiplier] of Object.entries(CONDITION_MULTIPLIERS)) {
        const basePrice = Math.round(data.basePrice * multiplier);
        await queryRunner.query(
          `INSERT INTO exchange_price_guide (model_id, condition, base_price, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (model_id, condition)
           DO UPDATE SET base_price = EXCLUDED.base_price, updated_at = NOW()`,
          [modelId!, condition, basePrice],
        );
      }
    }

    const [countRow] = await queryRunner.query(
      'SELECT COUNT(*)::int AS count FROM exchange_price_guide',
    );
    console.log(`  ✓ Price guide ready: ${countRow?.count ?? 0} entries across ${Object.keys(MODEL_BASE_PRICES).length} models`);

    await queryRunner.commitTransaction();
    console.log('  ✨ Price guide seeding completed successfully!\n');
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error('  ❌ Price guide seed failed:', err);
    throw err;
  } finally {
    await queryRunner.release();
  }
}
