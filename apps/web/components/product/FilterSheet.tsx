'use client';

import { useState } from 'react';
import { ItemCondition } from '@dream-gadgets/shared-types';

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  activeBrand?: string;
  activeCondition?: string;
  activeMinPrice?: string;
  activeMaxPrice?: string;
  brands: string[];
  onApply: (filters: { brand?: string; condition?: string; minPrice?: string; maxPrice?: string }) => void;
}

const CONDITIONS = [
  { value: ItemCondition.SEALED_PACK, label: 'Sealed Pack' },
  { value: ItemCondition.OPEN_BOX, label: 'Open Box' },
  { value: ItemCondition.SUPER_MINT, label: 'Super Mint' },
  { value: ItemCondition.MINT, label: 'Mint' },
  { value: ItemCondition.GOOD, label: 'Good' },
];

const PRICE_RANGES = [
  { label: 'Under ₹10,000', min: '', max: '10000' },
  { label: '₹10,000 – ₹25,000', min: '10000', max: '25000' },
  { label: '₹25,000 – ₹50,000', min: '25000', max: '50000' },
  { label: '₹50,000 – ₹1,00,000', min: '50000', max: '100000' },
  { label: 'Above ₹1,00,000', min: '100000', max: '' },
];

export function FilterSheet({ open, onClose, activeBrand, activeCondition, activeMinPrice, activeMaxPrice, brands, onApply }: FilterSheetProps) {
  const [selectedBrand, setSelectedBrand] = useState(activeBrand || '');
  const [selectedCondition, setSelectedCondition] = useState(activeCondition || '');
  const [selectedPriceMin, setSelectedPriceMin] = useState(activeMinPrice || '');
  const [selectedPriceMax, setSelectedPriceMax] = useState(activeMaxPrice || '');

  if (!open) return null;

  const handleApply = () => {
    onApply({
      brand: selectedBrand,
      condition: selectedCondition,
      minPrice: selectedPriceMin,
      maxPrice: selectedPriceMax,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedBrand('');
    setSelectedCondition('');
    setSelectedPriceMin('');
    setSelectedPriceMax('');
    onApply({});
    onClose();
  };

  const hasActiveFilters = !!(activeBrand || activeCondition || activeMinPrice);

  return (
    <>
      <div className="filter-sheet-overlay" onClick={onClose} />
      <div className="filter-sheet">
        <div className="filter-sheet-handle" />
        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6 overflow-y-auto max-h-[60vh]">
            {/* Brand */}
            <div>
              <p className="text-sm font-bold text-gray-900 mb-3">Brand</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedBrand('')}
                  className={`text-xs px-3 py-2 rounded-xl font-medium border transition-colors ${
                    !selectedBrand ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  All
                </button>
                {brands.map(b => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`text-xs px-3 py-2 rounded-xl font-medium border transition-colors ${
                      selectedBrand === b ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <p className="text-sm font-bold text-gray-900 mb-3">Condition</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCondition('')}
                  className={`text-xs px-3 py-2 rounded-xl font-medium border transition-colors ${
                    !selectedCondition ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  All
                </button>
                {CONDITIONS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setSelectedCondition(c.value)}
                    className={`text-xs px-3 py-2 rounded-xl font-medium border transition-colors ${
                      selectedCondition === c.value ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="text-sm font-bold text-gray-900 mb-3">Price Range</p>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map(r => {
                  const isActive = selectedPriceMin === r.min && selectedPriceMax === r.max;
                  return (
                    <button
                      key={r.label}
                      onClick={() => {
                        setSelectedPriceMin(r.min);
                        setSelectedPriceMax(r.max);
                      }}
                      className={`text-xs px-3 py-2 rounded-xl font-medium border transition-colors ${
                        isActive ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            {hasActiveFilters && (
              <button onClick={handleClear} className="flex-1 py-3 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Clear All
              </button>
            )}
            <button onClick={handleApply} className={`py-3 text-sm font-bold text-white rounded-xl transition-colors ${hasActiveFilters ? 'flex-1 bg-primary hover:opacity-90' : 'w-full bg-primary hover:opacity-90'}`}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
