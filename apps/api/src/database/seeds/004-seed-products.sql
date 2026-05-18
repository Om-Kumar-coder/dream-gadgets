-- Dream Gadgets Product Database Seed Script
-- This SQL script populates the database with realistic product data
-- Run this after migrations are complete

-- ==========================================
-- 1. INSERT BRANDS
-- ==========================================
INSERT INTO brands (id, name, logo_url, is_active, sort_order, created_at) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Apple', 'https://via.placeholder.com/100?text=Apple', true, 1, NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Samsung', 'https://via.placeholder.com/100?text=Samsung', true, 2, NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Xiaomi', 'https://via.placeholder.com/100?text=Xiaomi', true, 3, NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'OnePlus', 'https://via.placeholder.com/100?text=OnePlus', true, 4, NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'Google', 'https://via.placeholder.com/100?text=Google', true, 5, NOW()),
  ('550e8400-e29b-41d4-a716-446655440006', 'Motorola', 'https://via.placeholder.com/100?text=Motorola', true, 6, NOW()),
  ('550e8400-e29b-41d4-a716-446655440007', 'Realme', 'https://via.placeholder.com/100?text=Realme', true, 7, NOW())
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 2. INSERT MODELS
-- ==========================================
INSERT INTO models (id, name, brand_id, slug, description, specs, is_active, created_at)
VALUES
  -- Apple
  ('650e8400-e29b-41d4-a716-446655440001', 'iPhone 14 Pro', '550e8400-e29b-41d4-a716-446655440001', 'iphone-14-pro', 'Premium flagship smartphone with A16 Bionic chip, ProMotion display, and Advanced camera system', '{"processor":"A16 Bionic","ram":"6GB","storage":"128GB/256GB/512GB/1TB","display":"6.1-inch Super Retina XDR","camera":"48MP Main","battery":"3200mAh","os":"iOS 16"}', true, NOW()),
  ('650e8400-e29b-41d4-a716-446655440002', 'iPhone 14', '550e8400-e29b-41d4-a716-446655440001', 'iphone-14', 'Advanced dual camera system, A15 Bionic chip, Crash Detection', '{"processor":"A15 Bionic","ram":"6GB","storage":"128GB/256GB/512GB","display":"6.1-inch Liquid Retina","camera":"12MP Main","battery":"3279mAh","os":"iOS 16"}', true, NOW()),
  ('650e8400-e29b-41d4-a716-446655440003', 'iPhone 13', '550e8400-e29b-41d4-a716-446655440001', 'iphone-13', 'Powerful A15 Bionic chip with improved dual camera system', '{"processor":"A15 Bionic","ram":"4GB","storage":"128GB/256GB/512GB","display":"6.1-inch Liquid Retina","camera":"12MP Main","battery":"3240mAh","os":"iOS 15"}', true, NOW()),
  -- Samsung
  ('650e8400-e29b-41d4-a716-446655440004', 'Galaxy S23 Ultra', '550e8400-e29b-41d4-a716-446655440002', 'galaxy-s23-ultra', 'Ultimate Android smartphone with Snapdragon 8 Gen 2 and 200MP camera', '{"processor":"Snapdragon 8 Gen 2","ram":"8GB/12GB","storage":"256GB/512GB","display":"6.8-inch Dynamic AMOLED 2X","camera":"200MP Main","battery":"5000mAh","os":"Android 13"}', true, NOW()),
  ('650e8400-e29b-41d4-a716-446655440005', 'Galaxy S23', '550e8400-e29b-41d4-a716-446655440002', 'galaxy-s23', 'Flagship with Snapdragon 8 Gen 2, 50MP main camera, and 120Hz display', '{"processor":"Snapdragon 8 Gen 2","ram":"8GB","storage":"128GB/256GB","display":"6.1-inch Dynamic AMOLED 2X","camera":"50MP Main","battery":"4000mAh","os":"Android 13"}', true, NOW()),
  ('650e8400-e29b-41d4-a716-446655440006', 'Galaxy A54', '550e8400-e29b-41d4-a716-446655440002', 'galaxy-a54', 'Mid-range smartphone with 50MP camera and long battery life', '{"processor":"Exynos 1280","ram":"6GB/8GB","storage":"128GB/256GB","display":"6.4-inch AMOLED","camera":"50MP Main","battery":"5000mAh","os":"Android 13"}', true, NOW()),
  -- Xiaomi
  ('650e8400-e29b-41d4-a716-446655440007', 'Mi 13 Pro', '550e8400-e29b-41d4-a716-446655440003', 'mi-13-pro', 'Flagship with Snapdragon 8 Gen 2, Leica cameras, and 120W charging', '{"processor":"Snapdragon 8 Gen 2","ram":"8GB/12GB","storage":"256GB/512GB","display":"6.7-inch AMOLED","camera":"50MP Leica","battery":"4820mAh","os":"HyperOS"}', true, NOW()),
  ('650e8400-e29b-41d4-a716-446655440008', 'Redmi Note 12 Pro', '550e8400-e29b-41d4-a716-446655440003', 'redmi-note-12-pro', 'Popular mid-range with 50MP camera, 120Hz display, and fast charging', '{"processor":"MediaTek Dimensity 1080","ram":"6GB/8GB","storage":"128GB/256GB","display":"6.67-inch AMOLED","camera":"50MP Main","battery":"5000mAh","os":"MIUI 13"}', true, NOW()),
  -- OnePlus
  ('650e8400-e29b-41d4-a716-446655440009', 'OnePlus 11', '550e8400-e29b-41d4-a716-446655440004', 'oneplus-11', 'Fast and smooth performance with Snapdragon 8 Gen 2 and Hasselblad camera', '{"processor":"Snapdragon 8 Gen 2","ram":"8GB/12GB","storage":"256GB/512GB","display":"6.7-inch AMOLED","camera":"50MP Hasselblad","battery":"5000mAh","os":"OxygenOS 13"}', true, NOW()),
  ('650e8400-e29b-41d4-a716-446655440010', 'OnePlus Nord CE 3', '550e8400-e29b-41d4-a716-446655440004', 'oneplus-nord-ce-3', 'Budget flagship with 120Hz display and fast charging', '{"processor":"Snapdragon 695 5G","ram":"8GB","storage":"128GB/256GB","display":"6.43-inch AMOLED","camera":"50MP Main","battery":"5000mAh","os":"OxygenOS 13"}', true, NOW()),
  -- Google
  ('650e8400-e29b-41d4-a716-446655440011', 'Pixel 7 Pro', '550e8400-e29b-41d4-a716-446655440005', 'pixel-7-pro', 'Google flagship with Tensor chip and computational photography', '{"processor":"Google Tensor","ram":"8GB/12GB","storage":"128GB/256GB/512GB","display":"6.7-inch QHD+ AMOLED","camera":"50MP Main","battery":"5000mAh","os":"Android 13"}', true, NOW()),
  ('650e8400-e29b-41d4-a716-446655440012', 'Pixel 7', '550e8400-e29b-41d4-a716-446655440005', 'pixel-7', 'Flagship photography with Google Tensor and Night Sight', '{"processor":"Google Tensor","ram":"8GB","storage":"128GB/256GB","display":"6.3-inch FHD+ AMOLED","camera":"50MP Main","battery":"4355mAh","os":"Android 13"}', true, NOW()),
  -- Motorola
  ('650e8400-e29b-41d4-a716-446655440013', 'Moto Edge 50 Pro', '550e8400-e29b-41d4-a716-446655440006', 'moto-edge-50-pro', 'Fast flagship with Snapdragon 8 Gen 2 and 50MP Hasselblad camera', '{"processor":"Snapdragon 8 Gen 2","ram":"8GB/12GB","storage":"256GB/512GB","display":"6.7-inch AMOLED","camera":"50MP Hasselblad","battery":"5100mAh","os":"Android 13"}', true, NOW()),
  -- Realme
  ('650e8400-e29b-41d4-a716-446655440014', 'Realme 11 Pro+', '550e8400-e29b-41d4-a716-446655440007', 'realme-11-pro-plus', 'Mid-range flagship with MediaTek Dimensity 7050 and 100MP camera', '{"processor":"MediaTek Dimensity 7050","ram":"8GB/12GB","storage":"256GB/512GB","display":"6.7-inch AMOLED","camera":"100MP Main","battery":"5000mAh","os":"Realme UI 4.0"}', true, NOW())
ON CONFLICT DO NOTHING;

-- ==========================================
-- 3. GET MAIN BRANCH ID
-- ==========================================
-- Store this value for use in inventory item insertion
-- SELECT id FROM branches WHERE code = 'MAIN' LIMIT 1;
-- (Use this to set the branch_id variable in your script)

-- Sample IMEI numbers for inventory
-- Note: In production, these would be real IMEI numbers

-- ==========================================
-- 4. INSERT INVENTORY ITEMS (SAMPLE - Add more as needed)
-- ==========================================
-- iPhone 14 Pro variants
WITH branch_id AS (SELECT id FROM branches WHERE code = 'MAIN' LIMIT 1)
INSERT INTO inventory_items (
  id, imei, brand_id, model_id, colour, storage, ram, box_type, condition,
  purchase_price, wholesale_price, tax_rate, tax_amount, total_cost,
  selling_price, online_price, status, is_online, branch_id, created_at, updated_at
)
VALUES
  -- iPhone 14 Pro - Space Black
  ('750e8400-e29b-41d4-a716-446655440001', '354495370014206', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Space Black', '128GB', '6GB', 'sealed_pack', 'sealed', 119999, 110000, 18, 21599.82, 119999, 129999, 124999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440002', '354495370014207', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Space Black', '256GB', '6GB', 'sealed_pack', 'sealed', 119999, 110000, 18, 21599.82, 119999, 135000, 130000, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440003', '354495370014208', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Silver', '128GB', '6GB', 'sealed_pack', 'sealed', 119999, 110000, 18, 21599.82, 119999, 129999, 124999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440004', '354495370014209', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Gold', '256GB', '6GB', 'sealed_pack', 'sealed', 119999, 110000, 18, 21599.82, 119999, 135000, 130000, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440005', '354495370014210', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Deep Purple', '512GB', '6GB', 'sealed_pack', 'sealed', 119999, 110000, 18, 21599.82, 119999, 150000, 145000, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),

  -- iPhone 14 variants
  ('750e8400-e29b-41d4-a716-446655440006', '354495370014211', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Midnight', '128GB', '6GB', 'sealed_pack', 'sealed', 79999, 72000, 18, 14399.82, 79999, 89999, 84999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440007', '354495370014212', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Starlight', '256GB', '6GB', 'sealed_pack', 'sealed', 79999, 72000, 18, 14399.82, 79999, 95000, 90000, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440008', '354495370014213', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Blue', '128GB', '6GB', 'sealed_pack', 'sealed', 79999, 72000, 18, 14399.82, 79999, 89999, 84999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440009', '354495370014214', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Purple', '512GB', '6GB', 'sealed_pack', 'sealed', 79999, 72000, 18, 14399.82, 79999, 110000, 105000, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),

  -- iPhone 13 variants
  ('750e8400-e29b-41d4-a716-446655440010', '354495370014215', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'Midnight', '128GB', '4GB', 'sealed_pack', 'sealed', 69999, 62000, 18, 12599.82, 69999, 79999, 74999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440011', '354495370014216', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'Starlight', '256GB', '4GB', 'sealed_pack', 'sealed', 69999, 62000, 18, 12599.82, 69999, 85000, 80000, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440012', '354495370014217', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'Pink', '128GB', '4GB', 'sealed_pack', 'sealed', 69999, 62000, 18, 12599.82, 69999, 79999, 74999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),

  -- Galaxy S23 Ultra variants
  ('750e8400-e29b-41d4-a716-446655440013', '354495370014218', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'Phantom Black', '256GB', '8GB', 'sealed_pack', 'sealed', 124999, 115000, 18, 22499.82, 124999, 139999, 134999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440014', '354495370014219', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'Cream', '512GB', '12GB', 'sealed_pack', 'sealed', 124999, 115000, 18, 22499.82, 124999, 155000, 150000, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440015', '354495370014220', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'Green', '256GB', '8GB', 'sealed_pack', 'sealed', 124999, 115000, 18, 22499.82, 124999, 139999, 134999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),

  -- Galaxy S23 variants
  ('750e8400-e29b-41d4-a716-446655440016', '354495370014221', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440005', 'Phantom Black', '128GB', '8GB', 'sealed_pack', 'sealed', 79999, 72000, 18, 14399.82, 79999, 89999, 84999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440017', '354495370014222', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440005', 'Cream', '256GB', '8GB', 'sealed_pack', 'sealed', 79999, 72000, 18, 14399.82, 79999, 95000, 90000, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),

  -- Galaxy A54 variants
  ('750e8400-e29b-41d4-a716-446655440018', '354495370014223', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440006', 'Awesome Black', '128GB', '6GB', 'sealed_pack', 'sealed', 39999, 35000, 18, 7199.82, 39999, 49999, 44999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440019', '354495370014224', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440006', 'Awesome White', '256GB', '8GB', 'sealed_pack', 'sealed', 39999, 35000, 18, 7199.82, 39999, 55000, 50000, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),

  -- Xiaomi Mi 13 Pro variants
  ('750e8400-e29b-41d4-a716-446655440020', '354495370014225', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440007', 'Black', '256GB', '8GB', 'sealed_pack', 'sealed', 89999, 82000, 18, 16199.82, 89999, 109999, 99999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440021', '354495370014226', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440007', 'White', '512GB', '12GB', 'sealed_pack', 'sealed', 89999, 82000, 18, 16199.82, 89999, 125000, 115000, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),

  -- Redmi Note 12 Pro variants
  ('750e8400-e29b-41d4-a716-446655440022', '354495370014227', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440008', 'Black', '128GB', '6GB', 'sealed_pack', 'sealed', 24999, 21000, 18, 4499.82, 24999, 32999, 28999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440023', '354495370014228', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440008', 'Blue', '256GB', '8GB', 'sealed_pack', 'sealed', 24999, 21000, 18, 4499.82, 24999, 38999, 34999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440024', '354495370014229', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440008', 'Purple', '128GB', '6GB', 'sealed_pack', 'sealed', 24999, 21000, 18, 4499.82, 24999, 32999, 28999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),

  -- OnePlus 11 variants
  ('750e8400-e29b-41d4-a716-446655440025', '354495370014230', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440009', 'Volcanic Black', '256GB', '8GB', 'sealed_pack', 'sealed', 74999, 68000, 18, 13499.82, 74999, 89999, 84999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440026', '354495370014231', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440009', 'Mint Green', '512GB', '12GB', 'sealed_pack', 'sealed', 74999, 68000, 18, 13499.82, 74999, 105000, 100000, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),

  -- OnePlus Nord CE 3 variants
  ('750e8400-e29b-41d4-a716-446655440027', '354495370014232', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440010', 'Pastel Lime', '128GB', '8GB', 'sealed_pack', 'sealed', 25999, 22000, 18, 4679.82, 25999, 32999, 28999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440028', '354495370014233', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440010', 'Pastel Gray', '256GB', '8GB', 'sealed_pack', 'sealed', 25999, 22000, 18, 4679.82, 25999, 38999, 34999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),

  -- Pixel 7 Pro variants
  ('750e8400-e29b-41d4-a716-446655440029', '354495370014234', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440011', 'Obsidian', '128GB', '8GB', 'sealed_pack', 'sealed', 89999, 82000, 18, 16199.82, 89999, 109999, 99999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440030', '354495370014235', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440011', 'Snow', '256GB', '12GB', 'sealed_pack', 'sealed', 89999, 82000, 18, 16199.82, 89999, 125000, 115000, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440031', '354495370014236', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440011', 'Stormy Black', '512GB', '8GB', 'sealed_pack', 'sealed', 89999, 82000, 18, 16199.82, 89999, 125000, 115000, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),

  -- Pixel 7 variants
  ('750e8400-e29b-41d4-a716-446655440032', '354495370014237', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440012', 'Obsidian', '128GB', '8GB', 'sealed_pack', 'sealed', 59999, 52000, 18, 10799.82, 59999, 69999, 64999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440033', '354495370014238', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440012', 'Snow', '256GB', '8GB', 'sealed_pack', 'sealed', 59999, 52000, 18, 10799.82, 59999, 75000, 70000, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),

  -- Moto Edge 50 Pro variants
  ('750e8400-e29b-41d4-a716-446655440034', '354495370014239', '550e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440013', 'Charcoal Black', '256GB', '8GB', 'sealed_pack', 'sealed', 69999, 62000, 18, 12599.82, 69999, 84999, 79999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440035', '354495370014240', '550e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440013', 'Pearl White', '512GB', '12GB', 'sealed_pack', 'sealed', 69999, 62000, 18, 12599.82, 69999, 100000, 95000, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),

  -- Realme 11 Pro+ variants
  ('750e8400-e29b-41d4-a716-446655440036', '354495370014241', '550e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440014', 'Starry Black', '256GB', '8GB', 'sealed_pack', 'sealed', 44999, 40000, 18, 8099.82, 44999, 54999, 49999, 'available', true, (SELECT id FROM branch_id), NOW(), NOW()),
  ('750e8400-e29b-41d4-a716-446655440037', '354495370014242', '550e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440014', 'Starry Purple', '512GB', '12GB', 'sealed_pack', 'sealed', 44999, 40000, 18, 8099.82, 44999, 65000, 60000, 'available', true, (SELECT id FROM branch_id), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ==========================================
-- 5. INSERT ITEM PHOTOS
-- ==========================================
INSERT INTO item_photos (id, item_id, key, url, sort_order, is_primary, created_at)
SELECT 
  gen_random_uuid() as id,
  ii.id as item_id,
  'photo-1' as key,
  'https://via.placeholder.com/400?text=' || ii.colour || '+' || ii.storage || '+1' as url,
  0 as sort_order,
  true as is_primary,
  NOW() as created_at
FROM inventory_items ii
WHERE ii.created_at > NOW() - INTERVAL '1 hour'
ON CONFLICT DO NOTHING;

-- Add second photo for each item
INSERT INTO item_photos (id, item_id, key, url, sort_order, is_primary, created_at)
SELECT 
  gen_random_uuid() as id,
  ii.id as item_item_id,
  'photo-2' as key,
  'https://via.placeholder.com/400?text=' || ii.colour || '+' || ii.storage || '+2' as url,
  1 as sort_order,
  false as is_primary,
  NOW() as created_at
FROM inventory_items ii
WHERE ii.created_at > NOW() - INTERVAL '1 hour'
ON CONFLICT DO NOTHING;

-- Add third photo for each item
INSERT INTO item_photos (id, item_id, key, url, sort_order, is_primary, created_at)
SELECT 
  gen_random_uuid() as id,
  ii.id as item_id,
  'photo-3' as key,
  'https://via.placeholder.com/400?text=' || ii.colour || '+' || ii.storage || '+3' as url,
  2 as sort_order,
  false as is_primary,
  NOW() as created_at
FROM inventory_items ii
WHERE ii.created_at > NOW() - INTERVAL '1 hour'
ON CONFLICT DO NOTHING;

-- ==========================================
-- 6. INSERT ACCESSORIES
-- ==========================================
INSERT INTO accessories (id, sku, name, description, brand_id, category, purchase_price, selling_price, created_at, updated_at)
VALUES
  -- Apple Accessories
  ('850e8400-e29b-41d4-a716-446655440001', 'ACC-USB-C-1M-AP', 'Apple USB-C to USB-C Cable 1m', 'Official Apple USB-C cable', '550e8400-e29b-41d4-a716-446655440001', 'cable', 1500, 1999, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440002', 'ACC-20W-CHARGER-AP', 'Apple 20W USB-C Power Adapter', 'Fast charging adapter for iPhones', '550e8400-e29b-41d4-a716-446655440001', 'charger', 1200, 1799, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440003', 'ACC-CASE-LEATHER-AP', 'Apple Leather Case for iPhone 14', 'Genuine leather protective case', '550e8400-e29b-41d4-a716-446655440001', 'case', 4000, 5499, NOW(), NOW()),
  
  -- Samsung Accessories
  ('850e8400-e29b-41d4-a716-446655440004', 'ACC-CHARGER-25W-SM', 'Samsung 25W Fast Charger', 'Super Fast Charging', '550e8400-e29b-41d4-a716-446655440002', 'charger', 800, 1299, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440005', 'ACC-CASE-LEATHER-SM', 'Samsung Leather Case', 'Premium protective case', '550e8400-e29b-41d4-a716-446655440002', 'case', 1500, 2299, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440006', 'ACC-EARBUDS-SM', 'Samsung Galaxy Buds2 Pro', 'Wireless earbuds with ANC', '550e8400-e29b-41d4-a716-446655440002', 'earphones', 8000, 9999, NOW(), NOW()),
  
  -- Generic Accessories
  ('850e8400-e29b-41d4-a716-446655440007', 'ACC-POWERBANK-20K', 'Universal Power Bank 20000mAh', 'Dual USB ports, LED display', NULL, 'power_bank', 1200, 1899, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440008', 'ACC-POWERBANK-10K', 'Compact Power Bank 10000mAh', 'Pocket-friendly capacity', NULL, 'power_bank', 700, 1199, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440009', 'ACC-SCREENGUARD-G', 'Generic Tempered Glass Screen Protector', 'Fits most smartphones', NULL, 'screen_guard', 100, 249, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440010', 'ACC-CASE-TPU-G', 'TPU Protective Phone Case', 'Soft TPU material with grip', NULL, 'case', 300, 599, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440011', 'ACC-USB-CABLE-3IN1', '3-in-1 USB Charging Cable', 'USB-C, Lightning, Micro USB', NULL, 'cable', 250, 599, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440012', 'ACC-EARBUDS-GENERIC', 'Wireless Bluetooth Earbuds', 'Touch controls, Noise cancellation', NULL, 'earphones', 1500, 2499, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440013', 'ACC-STAND-TRIPOD', 'Mobile Phone Tripod Stand', 'Adjustable, portable stand', NULL, 'stand', 400, 799, NOW(), NOW()),
  ('850e8400-e29b-41d4-a716-446655440014', 'ACC-SCREEN-PROTECTOR-FILM', 'Screen Protector Film (Hydrogel)', 'Self-healing hydrogel film', NULL, 'screen_guard', 150, 399, NOW(), NOW())
ON CONFLICT (sku) DO NOTHING;

-- ==========================================
-- 7. VERIFICATION QUERIES
-- ==========================================
-- Run these to verify the seed was successful:

-- Count brands
SELECT COUNT(*) as brand_count FROM brands;

-- Count models
SELECT COUNT(*) as model_count FROM models;

-- Count inventory items
SELECT COUNT(*) as inventory_count FROM inventory_items WHERE created_at > NOW() - INTERVAL '1 hour';

-- Count item photos
SELECT COUNT(*) as photo_count FROM item_photos WHERE created_at > NOW() - INTERVAL '1 hour';

-- Count accessories
SELECT COUNT(*) as accessory_count FROM accessories;

-- Sample inventory listing
SELECT ii.id, m.name, ii.colour, ii.storage, ii.ram, ii.selling_price 
FROM inventory_items ii
JOIN models m ON ii.model_id = m.id
LIMIT 10;
