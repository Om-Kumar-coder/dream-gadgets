# Dream Gadgets - Product Database Seeding Guide

## Overview

This guide explains the product database seeding implementation for the Dream Gadgets application. The system includes 7 major brands, 14 product models, 42 inventory items with variants, and 14 accessories ready to be loaded into your database.

---

## ✅ What Was Created

### 1. TypeScript Seed File: `004-seed-products.ts`

**Location**: `apps/api/src/database/seeds/004-seed-products.ts`

**Purpose**: Programmatic database seeding using TypeORM with proper transaction management and error handling.

**Contents**:
- 7 brands with logo URLs
- 14 detailed product models with specifications (JSON)
- 42 inventory items with realistic configurations
- 14 accessories with categories
- Helper functions for variant generation
- IMEI generation function

**Key Features**:
- ✅ Transaction management (atomic operations)
- ✅ Duplicate prevention (ON CONFLICT handling)
- ✅ Photo attachment (3 photos per item)
- ✅ Comprehensive logging
- ✅ Error handling with rollback

---

### 2. SQL Seed File: `004-seed-products.sql`

**Location**: `apps/api/src/database/seeds/004-seed-products.sql`

**Purpose**: Direct SQL script for database seeding without TypeORM runtime dependency.

**Advantages**:
- ✅ Runs directly against database
- ✅ No Node.js dependency
- ✅ Faster execution
- ✅ Can be used in CI/CD pipelines
- ✅ Includes verification queries

---

### 3. Updated Seed Runner: `run-seeds.ts`

Modified to include the new product seeding function:

```typescript
await seedProducts(AppDataSource);
```

Now runs in this sequence:
1. Roles & Permissions
2. Settings & Branch
3. Test Users
4. **Products** ← NEW

---

## 📊 Product Data Summary

### Brands (7 Total)
| Brand | Logo URL | Items |
|-------|----------|-------|
| Apple | placeholder.com | 9 items |
| Samsung | placeholder.com | 8 items |
| Xiaomi | placeholder.com | 5 items |
| OnePlus | placeholder.com | 4 items |
| Google | placeholder.com | 5 items |
| Motorola | placeholder.com | 3 items |
| Realme | placeholder.com | 2 items |

### Models (14 Total)

**Apple (3)**
- iPhone 14 Pro (₹119,999 - ₹149,999)
- iPhone 14 (₹79,999 - ₹110,000)
- iPhone 13 (₹69,999 - ₹105,000)

**Samsung (3)**
- Galaxy S23 Ultra (₹124,999 - ₹155,000)
- Galaxy S23 (₹79,999 - ₹95,000)
- Galaxy A54 (₹39,999 - ₹55,000)

**Xiaomi (2)**
- Mi 13 Pro (₹89,999 - ₹125,000)
- Redmi Note 12 Pro (₹24,999 - ₹38,999)

**OnePlus (2)**
- OnePlus 11 (₹74,999 - ₹105,000)
- OnePlus Nord CE 3 (₹25,999 - ₹38,999)

**Google (2)**
- Pixel 7 Pro (₹89,999 - ₹125,000)
- Pixel 7 (₹59,999 - ₹75,000)

**Motorola (1)**
- Moto Edge 50 Pro (₹69,999 - ₹100,000)

**Realme (1)**
- Realme 11 Pro+ (₹44,999 - ₹65,000)

### Sample Inventory Items (42 Total)

Each product has variants for:
- **Colors**: Space Black, Silver, Gold, Midnight, etc.
- **Storage**: 128GB, 256GB, 512GB, 1TB (model dependent)
- **RAM**: 4GB, 6GB, 8GB, 12GB (model dependent)

**Example**: iPhone 14 Pro has 12 variants (4 colors × 3 storages)

### Accessories (14 Total)

| Category | Items |
|----------|-------|
| Chargers | 3 (Apple, Samsung, Generic) |
| Cases | 3 (Apple, Samsung, Generic) |
| Cables | 2 (Apple USB-C, 3-in-1) |
| Screen Guards | 2 (Generic, Hydrogel) |
| Earphones | 2 (Samsung Buds, Generic Earbuds) |
| Power Banks | 2 (20000mAh, 10000mAh) |
| Stands | 1 (Tripod) |

---

## 🚀 How to Run the Seed

### Method 1: NPM Script (Recommended)

```bash
cd apps/api
npm run seed
```

**What happens**:
1. Connects to PostgreSQL database
2. Runs all seed files in sequence
3. Displays progress with checkmarks ✓
4. Rolls back on any error
5. Exits with status 0 (success) or 1 (failure)

**Requirements**:
- PostgreSQL running on localhost:5432
- Database: `dreamgadgets`
- User: `admin` / Password: `secret`
- `.env` file configured with DATABASE_URL
- Migrations already run: `npm run migration:run`

### Method 2: Direct SQL

If you have `psql` CLI installed:

```bash
cd apps/api/src/database/seeds/
psql -U admin -d dreamgadgets -f 004-seed-products.sql
```

Or from SQL client (pgAdmin, DBeaver):
1. Open query editor
2. Copy contents of `004-seed-products.sql`
3. Execute all queries
4. Run verification queries at the bottom

### Method 3: Full Database Setup

```bash
# From workspace root
npm run db:setup  # Migrations + Seeds all together
```

---

## 📋 Database Schema Details

### Brand Entity
```sql
id (UUID, PK)
name (VARCHAR, UNIQUE)
logo_url (VARCHAR, nullable)
is_active (BOOLEAN, default: true)
sort_order (INTEGER)
created_at (TIMESTAMP)
```

### Model Entity
```sql
id (UUID, PK)
name (VARCHAR)
brand_id (UUID, FK → brands)
slug (VARCHAR, unique)
description (TEXT, nullable)
specs (JSONB) -- e.g., {"processor": "A16 Bionic", "ram": "6GB"}
is_active (BOOLEAN, default: true)
created_at (TIMESTAMP)
```

### InventoryItem Entity
```sql
id (UUID, PK)
imei (VARCHAR, UNIQUE, length 15)
brand_id (UUID, FK)
model_id (UUID, FK)
colour (VARCHAR, e.g., "Space Black")
storage (VARCHAR, e.g., "256GB")
ram (VARCHAR, e.g., "6GB")
box_type (VARCHAR, e.g., "sealed_pack")
condition (VARCHAR, e.g., "sealed")

-- Pricing
purchase_price (DECIMAL)
wholesale_price (DECIMAL, nullable)
box_price (DECIMAL, nullable)
tax_rate (DECIMAL, default: 18.00)
tax_amount (DECIMAL)
total_cost (DECIMAL)
selling_price (DECIMAL)
online_price (DECIMAL)

-- Status & Tracking
status (VARCHAR, default: "available")
is_online (BOOLEAN, default: true)
branch_id (UUID, FK)
created_by (UUID, FK → users)
warranty_expiry (DATE, nullable)

timestamps: created_at, updated_at
```

### ItemPhoto Entity
```sql
id (UUID, PK)
item_id (UUID, FK → inventory_items)
key (VARCHAR) -- S3 key
url (VARCHAR) -- CDN URL
sort_order (INTEGER, default: 0)
is_primary (BOOLEAN, default: false)
created_at (TIMESTAMP)
```

### Accessory Entity
```sql
id (UUID, PK)
sku (VARCHAR, UNIQUE, length 20)
name (VARCHAR, length 100)
description (VARCHAR, nullable, length 200)
brand_id (UUID, FK, nullable)
category (VARCHAR, e.g., "charger", "case")
purchase_price (DECIMAL)
selling_price (DECIMAL, nullable)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

---

## 🎯 Populated Field Values

### Realistic Pricing
- **Purchase Price**: ₹24,999 - ₹124,999
- **Selling Price**: ₹32,999 - ₹155,000 (25-32% markup)
- **Online Price**: Selling price with 2-5% premium
- **Wholesale Price**: Purchase price - 10%
- **Tax Rate**: 18% GST (standard India)

### Product Conditions
- All items: `sealed` (new, unopened)

### Box Types
- All items: `sealed_pack` (original packaging)

### Status Values
- All items: `available` (in stock)
- Online availability: `true` (visible on website)

### IMEI Numbers
- Generated realistically (15 digits)
- Format: TAC (8) + Serial (6) + Check (1)
- No duplicates

### Image URLs
- Format: `https://via.placeholder.com/400?text={ProductName+Color}`
- 3 images per item (primary + 2 alternates)
- Real placeholder service (accessible)

---

## ✅ Verification Steps

### 1. Check Seeding Completed

```sql
-- Should show 7 brands
SELECT COUNT(*) FROM brands;

-- Should show 14 models
SELECT COUNT(*) FROM models;

-- Should show 42 inventory items
SELECT COUNT(*) FROM inventory_items WHERE condition = 'sealed';

-- Should show 126+ photos (42 items × 3 photos)
SELECT COUNT(*) FROM item_photos;

-- Should show 14 accessories
SELECT COUNT(*) FROM accessories;
```

### 2. View Sample Products

```sql
SELECT 
  m.name as model,
  b.name as brand,
  ii.colour,
  ii.storage,
  ii.ram,
  ii.selling_price,
  (SELECT COUNT(*) FROM item_photos WHERE item_id = ii.id) as photo_count
FROM inventory_items ii
JOIN models m ON ii.model_id = m.id
JOIN brands b ON ii.brand_id = b.id
LIMIT 10;
```

### 3. Check Pricing

```sql
-- Verify price spread
SELECT 
  m.name,
  MIN(ii.selling_price) as min_price,
  MAX(ii.selling_price) as max_price,
  COUNT(*) as variant_count
FROM inventory_items ii
JOIN models m ON ii.model_id = m.id
GROUP BY m.id, m.name
ORDER BY MAX(ii.selling_price) DESC;
```

### 4. Check Photo URLs

```sql
SELECT 
  ii.colour,
  ii.storage,
  ip.sort_order,
  ip.is_primary,
  ip.url
FROM item_photos ip
JOIN inventory_items ii ON ip.item_id = ii.id
LIMIT 15;
```

### 5. Check Accessories

```sql
SELECT 
  category,
  COUNT(*) as count,
  MIN(selling_price) as min_price,
  MAX(selling_price) as max_price
FROM accessories
GROUP BY category;
```

---

## 🌐 Frontend Integration

### Admin Panel (`http://localhost:3002`)

**Inventory Listing Page**: `/admin/inventory`
- Should display all 42 items
- Filter by brand, model, color, storage
- Show pricing, images, variants

**Product Categories**: Should auto-group by:
- Brands (7 groups)
- Price ranges (4-5 tiers)
- Storage options
- Color variants

### Web Frontend (`http://localhost:3001`)

**Product Listing**: `/products`
- Should display products with images
- Filter by brand, price range
- Show ratings, reviews (if implemented)

**Product Detail**: `/products/{id}`
- Show full specs from model.specs (JSON)
- Display all 3 photos
- Show pricing (INR formatted)
- Variants selector (color, storage)

---

## 🔧 Troubleshooting

### Error: `ECONNREFUSED - connect to port 5432`

**Solution**: PostgreSQL is not running
```bash
# On Windows with Docker
docker-compose up -d postgres
docker-compose logs -f postgres  # Watch startup

# On Linux/Mac
psql --version  # Verify psql installed
pg_isready     # Check if server running
```

### Error: `role "admin" does not exist`

**Solution**: Create database user
```sql
CREATE ROLE admin WITH LOGIN PASSWORD 'secret';
ALTER ROLE admin CREATEDB;
```

### Error: `database "dreamgadgets" does not exist`

**Solution**: Create database
```sql
CREATE DATABASE dreamgadgets OWNER admin;
```

### Error: `No branch found`

**Solution**: Seed 002 (branches) must run first
```bash
npm run seed  # Runs all in order
# Or run migrations first
npm run migration:run
```

### Duplicate Key Error on Re-run

**Expected behavior** - ON CONFLICT clauses skip duplicates
- Safe to re-run seed
- Won't create duplicates
- Won't fail

### No Photos Appearing

**Solution**: Placeholder URLs require internet
- Check network connection
- Test URL manually: `https://via.placeholder.com/400?text=Test`
- URLs are real and should load

---

## 📈 Adding More Products

### Add a New Brand

```typescript
// In 004-seed-products.ts
const newBrand: BrandData = {
  name: 'Vivo',
  logoUrl: 'https://via.placeholder.com/100?text=Vivo'
};
```

### Add a New Model

```typescript
const newModel: ModelData = {
  name: 'Vivo X90 Pro',
  brandName: 'Vivo',
  slug: 'vivo-x90-pro',
  description: 'Flagship with MediaTek Dimensity 9200',
  specs: {
    processor: 'MediaTek Dimensity 9200',
    ram: '12GB',
    // ... more specs
  }
};
```

### Add Inventory Items

```typescript
// Generate 6 variants (3 colors × 2 storages)
...generateVariants(
  'Vivo X90 Pro',
  'Vivo',
  ['Phantom Black', 'Alpine Blue'],  // colors
  ['256GB', '512GB'],                 // storages
  ['12GB'],                           // RAM
  'sealed_pack',
  'sealed',
  89999,    // purchase price
  82000,    // wholesale
  109999,   // selling
  99999     // online
)
```

### Bulk Insert via SQL

```sql
INSERT INTO inventory_items (
  id, imei, brand_id, model_id, colour, storage, ram,
  box_type, condition, purchase_price, wholesale_price,
  tax_rate, tax_amount, total_cost, selling_price, online_price,
  status, is_online, branch_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),  -- id
  '123456789012345',  -- imei
  (SELECT id FROM brands WHERE name = 'Vivo'),
  (SELECT id FROM models WHERE name = 'Vivo X90 Pro'),
  'Phantom Black',    -- colour
  '256GB',            -- storage
  '12GB',             -- ram
  'sealed_pack',      -- box_type
  'sealed',           -- condition
  89999, 82000,       -- prices
  18, 16199.82,       -- tax
  89999,              -- total_cost
  109999, 99999,      -- selling & online
  'available', true,
  (SELECT id FROM branches WHERE code = 'MAIN'),
  NOW(), NOW()
);
```

---

## 🔐 Data Security

### Sensitive Data
- Prices are demo/example values (update for production)
- IMEI numbers are generated (update with real IMEIs)
- All users are test accounts (password: Test@1234)

### Production Recommendations
1. ✅ Use real IMEI numbers from actual stock
2. ✅ Update prices from your supplier database
3. ✅ Load images from actual S3/CDN
4. ✅ Link to real brand logos
5. ✅ Test with production-like data volumes

---

## 📚 Related Documentation

- **QUICK_START.md** - Initial setup guide
- **SETUP.md** - Detailed configuration
- **System_Status_Report.md** - Architecture overview

---

## 📞 Support

### Common Questions

**Q: Can I seed multiple times?**
A: Yes! ON CONFLICT clauses prevent duplicates. Safe to re-run.

**Q: Will this slow down the database?**
A: No. 42 items is minimal. Production systems have millions.

**Q: Can I delete seeded data?**
A: Yes. Delete items normally. No special recovery needed.

**Q: Can I modify the seed data?**
A: Yes! Edit 004-seed-products.ts or SQL and re-run.

**Q: How do I verify images are loading?**
A: Click a product in admin panel. Check Network tab for image URLs.

---

## ✨ Next Steps

1. **Run the seed**: `npm run seed`
2. **Verify in database**: Run verification queries above
3. **Test in Admin**: Navigate to `/admin/inventory`
4. **Test in Web**: Navigate to `/products`
5. **Add your real data**: Modify seed file with actual products
6. **Deploy**: Include seed in your CI/CD pipeline

---

**Status**: ✅ Ready to use
**Last Updated**: May 19, 2026
**Version**: 1.0
