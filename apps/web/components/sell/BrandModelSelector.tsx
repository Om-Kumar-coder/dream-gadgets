'use client';

import { useState, useRef, useEffect, useMemo } from 'react';

interface BrandModelSelectorProps {
  brand: string;
  modelName: string;
  deviceType: string;
  onUpdate: (data: Partial<{ brand: string; modelName: string; deviceType: string }>) => void;
}

const DEVICE_TYPES = [
  { value: 'mobile', label: 'Mobile Phone' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'smartwatch', label: 'Smartwatch' },
  { value: 'gaming', label: 'Console' },
];

const DEVICE_TYPE_ICONS: Record<string, string> = {
  mobile: '📱',
  laptop: '💻',
  tablet: '📟',
  smartwatch: '⌚',
  gaming: '🎮',
};

const ALL_DEVICES = [
  { brand: 'Apple', model: 'iPhone 16 Pro Max', deviceType: 'mobile' },
  { brand: 'Apple', model: 'iPhone 16 Pro', deviceType: 'mobile' },
  { brand: 'Apple', model: 'iPhone 16', deviceType: 'mobile' },
  { brand: 'Apple', model: 'iPhone 15 Pro Max', deviceType: 'mobile' },
  { brand: 'Apple', model: 'iPhone 15 Pro', deviceType: 'mobile' },
  { brand: 'Apple', model: 'iPhone 15', deviceType: 'mobile' },
  { brand: 'Apple', model: 'iPhone 14 Pro Max', deviceType: 'mobile' },
  { brand: 'Apple', model: 'iPhone 14', deviceType: 'mobile' },
  { brand: 'Apple', model: 'iPhone 13', deviceType: 'mobile' },
  { brand: 'Apple', model: 'iPhone 12', deviceType: 'mobile' },
  { brand: 'Apple', model: 'MacBook Air M3', deviceType: 'laptop' },
  { brand: 'Apple', model: 'MacBook Pro', deviceType: 'laptop' },
  { brand: 'Apple', model: 'iPad Pro', deviceType: 'tablet' },
  { brand: 'Apple', model: 'iPad Air', deviceType: 'tablet' },
  { brand: 'Apple', model: 'Apple Watch Ultra', deviceType: 'smartwatch' },
  { brand: 'Apple', model: 'Apple Watch Series 9', deviceType: 'smartwatch' },
  { brand: 'Samsung', model: 'Galaxy S25 Ultra', deviceType: 'mobile' },
  { brand: 'Samsung', model: 'Galaxy S25+', deviceType: 'mobile' },
  { brand: 'Samsung', model: 'Galaxy S25', deviceType: 'mobile' },
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', deviceType: 'mobile' },
  { brand: 'Samsung', model: 'Galaxy S24', deviceType: 'mobile' },
  { brand: 'Samsung', model: 'Galaxy S23 Ultra', deviceType: 'mobile' },
  { brand: 'Samsung', model: 'Galaxy S23', deviceType: 'mobile' },
  { brand: 'Samsung', model: 'Galaxy Z Fold 6', deviceType: 'mobile' },
  { brand: 'Samsung', model: 'Galaxy Z Flip 6', deviceType: 'mobile' },
  { brand: 'Samsung', model: 'Galaxy A55', deviceType: 'mobile' },
  { brand: 'Samsung', model: 'Galaxy Tab S9', deviceType: 'tablet' },
  { brand: 'Samsung', model: 'Galaxy Tab A9', deviceType: 'tablet' },
  { brand: 'Samsung', model: 'Galaxy Watch 6', deviceType: 'smartwatch' },
  { brand: 'OnePlus', model: 'OnePlus 13', deviceType: 'mobile' },
  { brand: 'OnePlus', model: 'OnePlus 12', deviceType: 'mobile' },
  { brand: 'OnePlus', model: 'OnePlus 11', deviceType: 'mobile' },
  { brand: 'OnePlus', model: 'OnePlus Nord 4', deviceType: 'mobile' },
  { brand: 'OnePlus', model: 'OnePlus Nord CE 4', deviceType: 'mobile' },
  { brand: 'Xiaomi', model: 'Xiaomi 14 Pro', deviceType: 'mobile' },
  { brand: 'Xiaomi', model: 'Xiaomi 13 Pro', deviceType: 'mobile' },
  { brand: 'Xiaomi', model: 'Redmi Note 13 Pro', deviceType: 'mobile' },
  { brand: 'Xiaomi', model: 'Xiaomi Pad 6', deviceType: 'tablet' },
  { brand: 'Google', model: 'Pixel 9 Pro', deviceType: 'mobile' },
  { brand: 'Google', model: 'Pixel 9', deviceType: 'mobile' },
  { brand: 'Google', model: 'Pixel 8 Pro', deviceType: 'mobile' },
  { brand: 'Google', model: 'Pixel 8', deviceType: 'mobile' },
  { brand: 'OnePlus', model: 'OnePlus Watch 2', deviceType: 'smartwatch' },
  { brand: 'Sony', model: 'PS5', deviceType: 'gaming' },
  { brand: 'Microsoft', model: 'Xbox Series X', deviceType: 'gaming' },
  { brand: 'Nintendo', model: 'Switch OLED', deviceType: 'gaming' },
  { brand: 'Dell', model: 'XPS 15', deviceType: 'laptop' },
  { brand: 'Dell', model: 'Inspiron 16', deviceType: 'laptop' },
  { brand: 'HP', model: 'Spectre x360', deviceType: 'laptop' },
  { brand: 'HP', model: 'Pavilion 15', deviceType: 'laptop' },
  { brand: 'Lenovo', model: 'ThinkPad X1', deviceType: 'laptop' },
  { brand: 'Lenovo', model: 'IdeaPad Slim 5', deviceType: 'laptop' },
  { brand: 'Asus', model: 'ROG Zephyrus G14', deviceType: 'laptop' },
  { brand: 'Asus', model: 'Vivobook 15', deviceType: 'laptop' },
  { brand: 'Realme', model: 'Realme 12 Pro+', deviceType: 'mobile' },
  { brand: 'Realme', model: 'Realme 11 Pro', deviceType: 'mobile' },
  { brand: 'Vivo', model: 'Vivo X100 Pro', deviceType: 'mobile' },
  { brand: 'Vivo', model: 'Vivo V30', deviceType: 'mobile' },
  { brand: 'Oppo', model: 'Oppo Find X7', deviceType: 'mobile' },
  { brand: 'Oppo', model: 'Oppo Reno 11 Pro', deviceType: 'mobile' },
  { brand: 'Nothing', model: 'Phone 2', deviceType: 'mobile' },
  { brand: 'Nothing', model: 'Phone 2a', deviceType: 'mobile' },
];

export function BrandModelSelector({ brand, modelName, deviceType, onUpdate }: BrandModelSelectorProps) {
  const [searchValue, setSearchValue] = useState(brand && modelName ? `${brand} ${modelName}` : '');
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update search value when brand/model changes externally
  useEffect(() => {
    if (brand && modelName) {
      setSearchValue(`${brand} ${modelName}`);
    }
  }, [brand, modelName]);

  const filtered = useMemo(() => {
    if (!searchValue.trim()) return ALL_DEVICES.slice(0, 8);
    const q = searchValue.toLowerCase();
    return ALL_DEVICES.filter(
      d =>
        d.brand.toLowerCase().includes(q) ||
        d.model.toLowerCase().includes(q) ||
        `${d.brand} ${d.model}`.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [searchValue]);

  const handleSelect = (item: typeof ALL_DEVICES[0]) => {
    onUpdate({ brand: item.brand, modelName: item.model, deviceType: item.deviceType });
    setSearchValue(`${item.brand} ${item.model}`);
    setIsFocused(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="heading-sm text-surface-900 mb-1">What device are you selling?</h3>
        <p className="text-sm text-surface-500">Search for your device below</p>
      </div>

      {/* Smart Search Input */}
      <div ref={wrapperRef} className="relative">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchValue}
            onChange={e => {
              setSearchValue(e.target.value);
              if (!e.target.value) {
                onUpdate({ brand: '', modelName: '' });
              }
            }}
            onFocus={() => setIsFocused(true)}
            placeholder="Enter device name (e.g. iPhone 13, HP Laptop…)"
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-surface-200 bg-white text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
          {searchValue && (
            <button
              onClick={() => { setSearchValue(''); onUpdate({ brand: '', modelName: '' }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {isFocused && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-surface-100 shadow-xl shadow-black/5 overflow-hidden z-50 animate-dropdown max-h-80 overflow-y-auto">
            {filtered.map((item, i) => (
              <button
                key={`${item.brand}-${item.model}-${i}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors text-left"
              >
                <span className="text-lg shrink-0">{DEVICE_TYPE_ICONS[item.deviceType] || '📱'}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{item.brand} </span>
                  <span>{item.model}</span>
                </div>
                <span className="text-xs text-surface-400 capitalize shrink-0">{item.deviceType}</span>
              </button>
            ))}
          </div>
        )}

        {/* Quick device type filter chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {DEVICE_TYPES.map(dt => (
            <button
              key={dt.value}
              type="button"
              onClick={() => {
                onUpdate({ deviceType: dt.value });
                setSearchValue('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                deviceType === dt.value && !brand
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-50 text-surface-500 hover:bg-surface-100 border border-surface-100'
              }`}
            >
              <span>{DEVICE_TYPE_ICONS[dt.value]}</span>
              {dt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected device summary */}
      {brand && modelName && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in-up">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{DEVICE_TYPE_ICONS[deviceType] || '📱'}</span>
            <div>
              <p className="text-sm font-semibold text-surface-900">{brand} {modelName}</p>
              <p className="text-xs text-surface-500 capitalize">{deviceType}</p>
            </div>
            <button
              type="button"
              onClick={() => { setSearchValue(''); onUpdate({ brand: '', modelName: '' }); }}
              className="ml-auto text-surface-400 hover:text-primary p-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Brands quick pick */}
      {!searchValue && (
        <div className="animate-fade-in-up">
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Popular Brands</p>
          <div className="flex flex-wrap gap-2">
            {['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Google', 'Dell', 'HP', 'Sony'].map(b => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  setSearchValue(b);
                  setIsFocused(true);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-surface-200 text-surface-600 hover:border-primary/40 hover:text-primary transition-all"
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
