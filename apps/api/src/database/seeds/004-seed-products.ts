import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';

interface BrandData {
  name: string;
  logoUrl: string;
}

interface ModelData {
  name: string;
  brandName: string;
  slug: string;
  description: string;
  specs: Record<string, string>;
}

interface InventoryItemData {
  modelName: string;
  brandName: string;
  colour: string;
  storage: string;
  ram: string;
  condition: string;
  boxType: string;
  purchasePrice: number;
  wholesalePrice: number;
  sellingPrice: number;
  onlinePrice: number;
  photoUrls: string[];
}

interface AccessoryData {
  sku: string;
  name: string;
  description: string;
  category: string;
  brandName: string | null;
  purchasePrice: number;
  sellingPrice: number;
}

// Brand data
const BRANDS: BrandData[] = [
  { name: 'Apple', logoUrl: 'https://via.placeholder.com/100?text=Apple' },
  { name: 'Samsung', logoUrl: 'https://via.placeholder.com/100?text=Samsung' },
  { name: 'Xiaomi', logoUrl: 'https://via.placeholder.com/100?text=Xiaomi' },
  { name: 'OnePlus', logoUrl: 'https://via.placeholder.com/100?text=OnePlus' },
  { name: 'Google', logoUrl: 'https://via.placeholder.com/100?text=Google' },
  { name: 'Motorola', logoUrl: 'https://via.placeholder.com/100?text=Motorola' },
  { name: 'Realme', logoUrl: 'https://via.placeholder.com/100?text=Realme' },
];

// Model data
const MODELS: ModelData[] = [
  // Apple
  {
    name: 'iPhone 14 Pro',
    brandName: 'Apple',
    slug: 'iphone-14-pro',
    description: 'Premium flagship smartphone with A16 Bionic chip, ProMotion display, and Advanced camera system',
    specs: {
      processor: 'A16 Bionic',
      ram: '6GB',
      storage: '128GB/256GB/512GB/1TB',
      display: '6.1-inch Super Retina XDR',
      camera: '48MP Main',
      battery: '3200mAh',
      os: 'iOS 16',
    },
  },
  {
    name: 'iPhone 14',
    brandName: 'Apple',
    slug: 'iphone-14',
    description: 'Advanced dual camera system, A15 Bionic chip, Crash Detection',
    specs: {
      processor: 'A15 Bionic',
      ram: '6GB',
      storage: '128GB/256GB/512GB',
      display: '6.1-inch Liquid Retina',
      camera: '12MP Main',
      battery: '3279mAh',
      os: 'iOS 16',
    },
  },
  {
    name: 'iPhone 13',
    brandName: 'Apple',
    slug: 'iphone-13',
    description: 'Powerful A15 Bionic chip with improved dual camera system',
    specs: {
      processor: 'A15 Bionic',
      ram: '4GB',
      storage: '128GB/256GB/512GB',
      display: '6.1-inch Liquid Retina',
      camera: '12MP Main',
      battery: '3240mAh',
      os: 'iOS 15',
    },
  },
  // Samsung
  {
    name: 'Galaxy S23 Ultra',
    brandName: 'Samsung',
    slug: 'galaxy-s23-ultra',
    description: 'Ultimate Android smartphone with Snapdragon 8 Gen 2 and 200MP camera',
    specs: {
      processor: 'Snapdragon 8 Gen 2',
      ram: '8GB/12GB',
      storage: '256GB/512GB',
      display: '6.8-inch Dynamic AMOLED 2X',
      camera: '200MP Main',
      battery: '5000mAh',
      os: 'Android 13',
    },
  },
  {
    name: 'Galaxy S23',
    brandName: 'Samsung',
    slug: 'galaxy-s23',
    description: 'Flagship with Snapdragon 8 Gen 2, 50MP main camera, and 120Hz display',
    specs: {
      processor: 'Snapdragon 8 Gen 2',
      ram: '8GB',
      storage: '128GB/256GB',
      display: '6.1-inch Dynamic AMOLED 2X',
      camera: '50MP Main',
      battery: '4000mAh',
      os: 'Android 13',
    },
  },
  {
    name: 'Galaxy A54',
    brandName: 'Samsung',
    slug: 'galaxy-a54',
    description: 'Mid-range smartphone with 50MP camera and long battery life',
    specs: {
      processor: 'Exynos 1280',
      ram: '6GB/8GB',
      storage: '128GB/256GB',
      display: '6.4-inch AMOLED',
      camera: '50MP Main',
      battery: '5000mAh',
      os: 'Android 13',
    },
  },
  // Xiaomi
  {
    name: 'Mi 13 Pro',
    brandName: 'Xiaomi',
    slug: 'mi-13-pro',
    description: 'Flagship with Snapdragon 8 Gen 2, Leica cameras, and 120W charging',
    specs: {
      processor: 'Snapdragon 8 Gen 2',
      ram: '8GB/12GB',
      storage: '256GB/512GB',
      display: '6.7-inch AMOLED',
      camera: '50MP Leica',
      battery: '4820mAh',
      os: 'HyperOS',
    },
  },
  {
    name: 'Redmi Note 12 Pro',
    brandName: 'Xiaomi',
    slug: 'redmi-note-12-pro',
    description: 'Popular mid-range with 50MP camera, 120Hz display, and fast charging',
    specs: {
      processor: 'MediaTek Dimensity 1080',
      ram: '6GB/8GB',
      storage: '128GB/256GB',
      display: '6.67-inch AMOLED',
      camera: '50MP Main',
      battery: '5000mAh',
      os: 'MIUI 13',
    },
  },
  // OnePlus
  {
    name: 'OnePlus 11',
    brandName: 'OnePlus',
    slug: 'oneplus-11',
    description: 'Fast and smooth performance with Snapdragon 8 Gen 2 and Hasselblad camera',
    specs: {
      processor: 'Snapdragon 8 Gen 2',
      ram: '8GB/12GB',
      storage: '256GB/512GB',
      display: '6.7-inch AMOLED',
      camera: '50MP Hasselblad',
      battery: '5000mAh',
      os: 'OxygenOS 13',
    },
  },
  {
    name: 'OnePlus Nord CE 3',
    brandName: 'OnePlus',
    slug: 'oneplus-nord-ce-3',
    description: 'Budget flagship with 120Hz display and fast charging',
    specs: {
      processor: 'Snapdragon 695 5G',
      ram: '8GB',
      storage: '128GB/256GB',
      display: '6.43-inch AMOLED',
      camera: '50MP Main',
      battery: '5000mAh',
      os: 'OxygenOS 13',
    },
  },
  // Google
  {
    name: 'Pixel 7 Pro',
    brandName: 'Google',
    slug: 'pixel-7-pro',
    description: 'Google flagship with Tensor chip and computational photography',
    specs: {
      processor: 'Google Tensor',
      ram: '8GB/12GB',
      storage: '128GB/256GB/512GB',
      display: '6.7-inch QHD+ AMOLED',
      camera: '50MP Main',
      battery: '5000mAh',
      os: 'Android 13',
    },
  },
  {
    name: 'Pixel 7',
    brandName: 'Google',
    slug: 'pixel-7',
    description: 'Flagship photography with Google Tensor and Night Sight',
    specs: {
      processor: 'Google Tensor',
      ram: '8GB',
      storage: '128GB/256GB',
      display: '6.3-inch FHD+ AMOLED',
      camera: '50MP Main',
      battery: '4355mAh',
      os: 'Android 13',
    },
  },
  // Motorola
  {
    name: 'Moto Edge 50 Pro',
    brandName: 'Motorola',
    slug: 'moto-edge-50-pro',
    description: 'Fast flagship with Snapdragon 8 Gen 2 and 50MP Hasselblad camera',
    specs: {
      processor: 'Snapdragon 8 Gen 2',
      ram: '8GB/12GB',
      storage: '256GB/512GB',
      display: '6.7-inch AMOLED',
      camera: '50MP Hasselblad',
      battery: '5100mAh',
      os: 'Android 13',
    },
  },
  // Realme
  {
    name: 'Realme 11 Pro+',
    brandName: 'Realme',
    slug: 'realme-11-pro-plus',
    description: 'Mid-range flagship with MediaTek Dimensity 7050 and 100MP camera',
    specs: {
      processor: 'MediaTek Dimensity 7050',
      ram: '8GB/12GB',
      storage: '256GB/512GB',
      display: '6.7-inch AMOLED',
      camera: '100MP Main',
      battery: '5000mAh',
      os: 'Realme UI 4.0',
    },
  },
];

// Inventory items with variants
const INVENTORY_ITEMS: InventoryItemData[] = [
  // iPhone 14 Pro
  ...generateVariants('iPhone 14 Pro', 'Apple', ['Space Black', 'Silver', 'Gold', 'Deep Purple'], ['128GB', '256GB', '512GB', '1TB'], ['6GB'], 'sealed_pack', 'sealed', 119999, 110000, 129999, 124999),
  // iPhone 14
  ...generateVariants('iPhone 14', 'Apple', ['Midnight', 'Starlight', 'Blue', 'Purple'], ['128GB', '256GB', '512GB'], ['6GB'], 'sealed_pack', 'sealed', 79999, 72000, 89999, 84999),
  // iPhone 13
  ...generateVariants('iPhone 13', 'Apple', ['Midnight', 'Starlight', 'Blue', 'Pink'], ['128GB', '256GB', '512GB'], ['4GB'], 'sealed_pack', 'sealed', 69999, 62000, 79999, 74999),
  // Galaxy S23 Ultra
  ...generateVariants('Galaxy S23 Ultra', 'Samsung', ['Phantom Black', 'Cream', 'Green', 'Lavender'], ['256GB', '512GB'], ['8GB', '12GB'], 'sealed_pack', 'sealed', 124999, 115000, 139999, 134999),
  // Galaxy S23
  ...generateVariants('Galaxy S23', 'Samsung', ['Phantom Black', 'Cream', 'Green'], ['128GB', '256GB'], ['8GB'], 'sealed_pack', 'sealed', 79999, 72000, 89999, 84999),
  // Galaxy A54
  ...generateVariants('Galaxy A54', 'Samsung', ['Awesome Black', 'Awesome White', 'Awesome Lime'], ['128GB', '256GB'], ['6GB', '8GB'], 'sealed_pack', 'sealed', 39999, 35000, 49999, 44999),
  // Mi 13 Pro
  ...generateVariants('Mi 13 Pro', 'Xiaomi', ['Black', 'White', 'Green'], ['256GB', '512GB'], ['8GB', '12GB'], 'sealed_pack', 'sealed', 89999, 82000, 109999, 99999),
  // Redmi Note 12 Pro
  ...generateVariants('Redmi Note 12 Pro', 'Xiaomi', ['Black', 'Blue', 'Purple', 'Gold'], ['128GB', '256GB'], ['6GB', '8GB'], 'sealed_pack', 'sealed', 24999, 21000, 32999, 28999),
  // OnePlus 11
  ...generateVariants('OnePlus 11', 'OnePlus', ['Volcanic Black', 'Mint Green'], ['256GB', '512GB'], ['8GB', '12GB'], 'sealed_pack', 'sealed', 74999, 68000, 89999, 84999),
  // OnePlus Nord CE 3
  ...generateVariants('OnePlus Nord CE 3', 'OnePlus', ['Pastel Lime', 'Pastel Gray'], ['128GB', '256GB'], ['8GB'], 'sealed_pack', 'sealed', 25999, 22000, 32999, 28999),
  // Pixel 7 Pro
  ...generateVariants('Pixel 7 Pro', 'Google', ['Obsidian', 'Snow', 'Stormy Black'], ['128GB', '256GB', '512GB'], ['8GB', '12GB'], 'sealed_pack', 'sealed', 89999, 82000, 109999, 99999),
  // Pixel 7
  ...generateVariants('Pixel 7', 'Google', ['Obsidian', 'Snow'], ['128GB', '256GB'], ['8GB'], 'sealed_pack', 'sealed', 59999, 52000, 69999, 64999),
  // Moto Edge 50 Pro
  ...generateVariants('Moto Edge 50 Pro', 'Motorola', ['Charcoal Black', 'Pearl White'], ['256GB', '512GB'], ['8GB', '12GB'], 'sealed_pack', 'sealed', 69999, 62000, 84999, 79999),
  // Realme 11 Pro+
  ...generateVariants('Realme 11 Pro+', 'Realme', ['Starry Black', 'Starry Purple'], ['256GB', '512GB'], ['8GB', '12GB'], 'sealed_pack', 'sealed', 44999, 40000, 54999, 49999),
];

// Accessories
const ACCESSORIES: AccessoryData[] = [
  // Apple Accessories
  { sku: 'ACC-USB-C-1M-AP', name: 'Apple USB-C to USB-C Cable 1m', description: 'Official Apple USB-C cable', category: 'cable', brandName: 'Apple', purchasePrice: 1500, sellingPrice: 1999 },
  { sku: 'ACC-20W-CHARGER-AP', name: 'Apple 20W USB-C Power Adapter', description: 'Fast charging adapter for iPhones', category: 'charger', brandName: 'Apple', purchasePrice: 1200, sellingPrice: 1799 },
  { sku: 'ACC-CASE-LEATHER-AP', name: 'Apple Leather Case for iPhone 14', description: 'Genuine leather protective case', category: 'case', brandName: 'Apple', purchasePrice: 4000, sellingPrice: 5499 },
  { sku: 'ACC-SCREENGUARD-AP', name: 'Tempered Glass Screen Protector iPhone', description: 'Premium screen protector', category: 'screen_guard', brandName: null, purchasePrice: 200, sellingPrice: 399 },

  // Samsung Accessories
  { sku: 'ACC-CHARGER-25W-SM', name: 'Samsung 25W Fast Charger', description: 'Super Fast Charging', category: 'charger', brandName: 'Samsung', purchasePrice: 800, sellingPrice: 1299 },
  { sku: 'ACC-CASE-LEATHER-SM', name: 'Samsung Leather Case', description: 'Premium protective case', category: 'case', brandName: 'Samsung', purchasePrice: 1500, sellingPrice: 2299 },
  { sku: 'ACC-EARBUDS-SM', name: 'Samsung Galaxy Buds2 Pro', description: 'Wireless earbuds with ANC', category: 'earphones', brandName: 'Samsung', purchasePrice: 8000, sellingPrice: 9999 },

  // Generic Accessories
  { sku: 'ACC-POWERBANK-20K', name: 'Universal Power Bank 20000mAh', description: 'Dual USB ports, LED display', category: 'power_bank', brandName: null, purchasePrice: 1200, sellingPrice: 1899 },
  { sku: 'ACC-POWERBANK-10K', name: 'Compact Power Bank 10000mAh', description: 'Pocket-friendly capacity', category: 'power_bank', brandName: null, purchasePrice: 700, sellingPrice: 1199 },
  { sku: 'ACC-SCREENGUARD-G', name: 'Generic Tempered Glass Screen Protector', description: 'Fits most smartphones', category: 'screen_guard', brandName: null, purchasePrice: 100, sellingPrice: 249 },
  { sku: 'ACC-CASE-TPU-G', name: 'TPU Protective Phone Case', description: 'Soft TPU material with grip', category: 'case', brandName: null, purchasePrice: 300, sellingPrice: 599 },
  { sku: 'ACC-USB-CABLE-3IN1', name: '3-in-1 USB Charging Cable', description: 'USB-C, Lightning, Micro USB', category: 'cable', brandName: null, purchasePrice: 250, sellingPrice: 599 },
  { sku: 'ACC-EARBUDS-GENERIC', name: 'Wireless Bluetooth Earbuds', description: 'Touch controls, Noise cancellation', category: 'earphones', brandName: null, purchasePrice: 1500, sellingPrice: 2499 },
  { sku: 'ACC-STAND-TRIPOD', name: 'Mobile Phone Tripod Stand', description: 'Adjustable, portable stand', category: 'stand', brandName: null, purchasePrice: 400, sellingPrice: 799 },
  { sku: 'ACC-HYDROGEL-FILM', name: 'Screen Protector Film (Hydrogel)', description: 'Self-healing hydrogel film', category: 'screen_guard', brandName: null, purchasePrice: 150, sellingPrice: 399 },
];

const FALLBACK_IMAGE_URL = 'https://via.placeholder.com/300x300?text=No+Image';

const MODEL_IMAGE_URLS: Record<string, string[]> = {
  'iPhone 14 Pro': [
    'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg',
  ],
  'iPhone 14': [
    'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg',
  ],
  'iPhone 13': [
    'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg',
  ],
  'Galaxy S23 Ultra': [
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-ultra-5g.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-ultra-5g.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-ultra-5g.jpg',
  ],
  'Galaxy A54': [
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg',
  ],
  'Mi 13 Pro': [
    'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13-pro.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13-pro.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13-pro.jpg',
  ],
  'OnePlus Nord CE 3': [
    'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce3.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce3.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/oneplus-nord-ce3.jpg',
  ],
  'Pixel 7 Pro': [
    'https://fdn2.gsmarena.com/vv/bigpic/google-pixel7-pro-new.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/google-pixel7-pro-new.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/google-pixel7-pro-new.jpg',
  ],
  'Moto Edge 50 Pro': [
    'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge-50-pro.jpg',
  ],
};

// Helper function to generate variants
function generateVariants(
  modelName: string,
  brandName: string,
  colors: string[],
  storages: string[],
  rams: string[],
  boxType: string,
  condition: string,
  purchasePrice: number,
  wholesalePrice: number,
  sellingPrice: number,
  onlinePrice: number,
): InventoryItemData[] {
  const items: InventoryItemData[] = [];
  for (const color of colors) {
    for (const storage of storages) {
      for (const ram of rams) {
        const photoUrls = MODEL_IMAGE_URLS[modelName] ?? [
          FALLBACK_IMAGE_URL,
          FALLBACK_IMAGE_URL,
          FALLBACK_IMAGE_URL,
        ];

        items.push({
          modelName,
          brandName,
          colour: color,
          storage,
          ram,
          condition,
          boxType,
          purchasePrice,
          wholesalePrice,
          sellingPrice: sellingPrice + (storage === '1TB' ? 30000 : storage === '512GB' ? 15000 : storage === '256GB' ? 5000 : 0),
          onlinePrice: onlinePrice + (storage === '1TB' ? 30000 : storage === '512GB' ? 15000 : storage === '256GB' ? 5000 : 0),
          photoUrls,
        });
      }
    }
  }
  return items;
}

export async function seedProducts(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log('\n  🏭 Seeding Brands...');
    const brandMap = new Map<string, string>();

    for (const brandData of BRANDS) {
      const [existingBrand] = await queryRunner.query(
        'SELECT id FROM brands WHERE name = $1',
        [brandData.name],
      );

      if (existingBrand) {
        brandMap.set(brandData.name, existingBrand.id);
        console.log(`  ✓ Brand already exists: ${brandData.name}`);
        continue;
      }

      const brandId = uuid();
      await queryRunner.query(
        `INSERT INTO brands (id, name, logo_url, is_active, sort_order, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [brandId, brandData.name, brandData.logoUrl, true, 0],
      );
      brandMap.set(brandData.name, brandId);
      console.log(`  ✓ Created brand: ${brandData.name}`);
    }

    console.log('\n  📱 Seeding Models...');
    const modelMap = new Map<string, string>();

    for (const modelData of MODELS) {
      const brandId = brandMap.get(modelData.brandName);
      if (!brandId) {
        console.warn(`  ⚠ Brand not found for model ${modelData.name}`);
        continue;
      }

      const [existingModel] = await queryRunner.query(
        'SELECT id FROM models WHERE name = $1 AND brand_id = $2',
        [modelData.name, brandId],
      );

      if (existingModel) {
        modelMap.set(`${modelData.brandName}:${modelData.name}`, existingModel.id);
        console.log(`  ✓ Model already exists: ${modelData.name}`);
        continue;
      }

      const modelId = uuid();
      await queryRunner.query(
        `INSERT INTO models (id, name, brand_id, slug, description, specs, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [modelId, modelData.name, brandId, modelData.slug, modelData.description, JSON.stringify(modelData.specs), true],
      );
      modelMap.set(`${modelData.brandName}:${modelData.name}`, modelId);
      console.log(`  ✓ Created model: ${modelData.name}`);
    }

    console.log('\n  📦 Seeding Inventory Items...');
    const [branch] = await queryRunner.query('SELECT id FROM branches WHERE code = $1 LIMIT 1', ['MAIN']);
    if (!branch) {
      throw new Error('Main branch not found. Please run seed 002 first.');
    }

    let itemCount = 0;
    for (const itemData of INVENTORY_ITEMS) {
      const brandId = brandMap.get(itemData.brandName);
      const modelId = modelMap.get(`${itemData.brandName}:${itemData.modelName}`);

      if (!brandId || !modelId) {
        console.warn(`  ⚠ Brand or model not found for item ${itemData.modelName}`);
        continue;
      }

      const itemId = uuid();
      const imei = generateIMEI();

      // Calculate pricing
      const totalCost = itemData.purchasePrice;
      const taxRate = 18; // 18% GST
      const taxAmount = (itemData.purchasePrice * taxRate) / 100;

      await queryRunner.query(
        `INSERT INTO inventory_items (
          id, imei, brand_id, model_id, colour, storage, ram, box_type, condition,
          purchase_price, wholesale_price, tax_rate, tax_amount, total_cost,
          selling_price, online_price, images, status, is_online, branch_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW())`,
        [
          itemId,
          imei,
          brandId,
          modelId,
          itemData.colour,
          itemData.storage,
          itemData.ram,
          itemData.boxType,
          itemData.condition,
          itemData.purchasePrice,
          itemData.wholesalePrice,
          taxRate,
          taxAmount,
          totalCost,
          itemData.sellingPrice,
          itemData.onlinePrice,
          JSON.stringify(itemData.photoUrls),
          'available',
          true,
          branch.id,
        ],
      );

      // Add photos
      for (let i = 0; i < itemData.photoUrls.length; i++) {
        const photoId = uuid();
        await queryRunner.query(
          `INSERT INTO item_photos (id, item_id, key, url, sort_order, is_primary, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [photoId, itemId, `photo-${i + 1}`, itemData.photoUrls[i], i, i === 0],
        );
      }

      itemCount++;
    }
    console.log(`  ✓ Created ${itemCount} inventory items with photos`);

    console.log('\n  🎁 Seeding Accessories...');
    let accessoryCount = 0;
    for (const accData of ACCESSORIES) {
      const [existingAcc] = await queryRunner.query('SELECT id FROM accessories WHERE sku = $1', [accData.sku]);

      if (existingAcc) {
        console.log(`  ✓ Accessory already exists: ${accData.sku}`);
        continue;
      }

      let brandId = null;
      if (accData.brandName) {
        brandId = brandMap.get(accData.brandName);
      }

      const accId = uuid();
      await queryRunner.query(
        `INSERT INTO accessories (id, sku, name, description, brand_id, category, purchase_price, selling_price, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [accId, accData.sku, accData.name, accData.description, brandId, accData.category, accData.purchasePrice, accData.sellingPrice],
      );
      accessoryCount++;
    }
    console.log(`  ✓ Created ${accessoryCount} accessories`);

    await queryRunner.commitTransaction();
    console.log('\n  ✨ Product seeding completed successfully!\n');
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error('  ❌ Seed failed:', err);
    throw err;
  } finally {
    await queryRunner.release();
  }
}

// Helper function to generate realistic IMEI
const usedImeis = new Set<string>();

function generateIMEI(): string {
  while (true) {
    const tac = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    const serial = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const base = `${tac}${serial}`;
    const imei = `${base}${calculateCheckDigit(base)}`;
    if (!usedImeis.has(imei)) {
      usedImeis.add(imei);
      return imei;
    }
  }
}

function calculateCheckDigit(base: string): string {
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    let digit = parseInt(base[base.length - 1 - i], 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return ((10 - (sum % 10)) % 10).toString();
}
