'use client';

interface BrandModelSelectorProps {
  brand: string;
  modelName: string;
  deviceType: string;
  onUpdate: (data: Partial<{ brand: string; modelName: string; deviceType: string }>) => void;
}

const DEVICE_TYPES = [
  { value: 'mobile', label: '📱 Mobile Phone' },
  { value: 'laptop', label: '💻 Laptop' },
  { value: 'tablet', label: '📟 Tablet' },
  { value: 'smartwatch', label: '⌚ Smartwatch' },
  { value: 'gaming', label: '🎮 Console' },
];

const BRANDS = [
  'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme',
  'Vivo', 'Oppo', 'Motorola', 'Google', 'Nokia',
  'Nothing', 'Asus', 'LG', 'Sony', 'Huawei',
];

const POPULAR_MODELS: Record<string, string[]> = {
  Apple: ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16', 'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14', 'iPhone 13', 'iPhone 12'],
  Samsung: ['Galaxy S25 Ultra', 'Galaxy S25+', 'Galaxy S25', 'Galaxy S24 Ultra', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23', 'Galaxy Z Fold 6', 'Galaxy Z Flip 6', 'Galaxy A55'],
  OnePlus: ['OnePlus 13', 'OnePlus 12', 'OnePlus 11', 'OnePlus Nord 4', 'OnePlus Nord CE 4'],
  Xiaomi: ['Xiaomi 14 Pro', 'Xiaomi 13 Pro', 'Redmi Note 13 Pro', 'Redmi Note 12', 'Mi 11X'],
  Realme: ['Realme 12 Pro+', 'Realme 11 Pro', 'Realme GT 6', 'Realme Narzo 60'],
  Vivo: ['Vivo X100 Pro', 'Vivo V30', 'Vivo T3', 'Vivo Y100'],
  Oppo: ['Oppo Find X7', 'Oppo Reno 11 Pro', 'Oppo F25'],
  Google: ['Pixel 9 Pro', 'Pixel 9', 'Pixel 8 Pro', 'Pixel 8', 'Pixel 7a'],
};

export function BrandModelSelector({ brand, modelName, deviceType, onUpdate }: BrandModelSelectorProps) {
  const models = brand ? POPULAR_MODELS[brand] || [] : [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">What do you want to sell?</h3>
        <p className="text-sm text-gray-500">Select the type of device</p>
      </div>

      {/* Device type cards */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {DEVICE_TYPES.map(dt => (
          <button
            key={dt.value}
            onClick={() => onUpdate({ deviceType: dt.value })}
            className={`p-3 rounded-xl text-center transition-all text-sm ${
              deviceType === dt.value
                ? 'bg-primary/10 border-2 border-primary text-primary font-semibold'
                : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100'
            }`}
          >
            {dt.label}
          </button>
        ))}
      </div>

      {/* Brand selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Select Brand</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {BRANDS.map(b => (
            <button
              key={b}
              onClick={() => onUpdate({ brand: b, modelName: '' })}
              className={`p-2.5 rounded-xl text-center text-sm font-medium transition-all ${
                brand === b
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Model selection */}
      {brand && (
        <div className="animate-fade-in-up">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Select Model</label>
          {models.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {models.map(m => (
                <button
                  key={m}
                  onClick={() => onUpdate({ modelName: m })}
                  className={`p-2.5 rounded-xl text-center text-sm transition-all ${
                    modelName === m
                      ? 'bg-primary/10 border-2 border-primary text-primary font-semibold'
                      : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={modelName}
                onChange={e => onUpdate({ modelName: e.target.value })}
                placeholder={`Enter ${brand} model name...`}
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">e.g. iPhone 13, Galaxy S24</p>
            </div>
          )}
        </div>
      )}

      {/* Selected summary */}
      {brand && modelName && (
        <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl text-sm animate-scale-in">
          <span className="font-medium text-gray-700">Selected: </span>
          <span className="text-primary font-semibold">{brand} {modelName}</span>
        </div>
      )}
    </div>
  );
}
