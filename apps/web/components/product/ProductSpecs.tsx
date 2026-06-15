'use client';

import { useState } from 'react';

interface ProductSpecsProps {
  specs: Record<string, string>;
  storage?: string;
  ram?: string;
  colour?: string;
  batteryHealth?: number;
}

const SPEC_LABELS: Record<string, string> = {
  processor: 'Processor',
  ram: 'RAM',
  storage: 'Storage',
  display: 'Display',
  camera: 'Camera',
  battery: 'Battery',
  os: 'Operating System',
};

const SPEC_ICONS: Record<string, string> = {
  processor: '🔲',
  ram: '💾',
  storage: '📦',
  display: '🖥️',
  camera: '📷',
  battery: '🔋',
  os: '⚙️',
};

export function ProductSpecs({ specs, storage, ram, colour, batteryHealth }: ProductSpecsProps) {
  const [showAll, setShowAll] = useState(false);

  const mergedSpecs = { ...specs };

  // Override with actual item-level values where available
  if (storage) mergedSpecs.storage = storage;
  if (ram) mergedSpecs.ram = ram;

  // Add extra specs
  if (colour) mergedSpecs.colour = colour;
  if (batteryHealth !== undefined && batteryHealth !== null) {
    mergedSpecs.batteryHealth = `${batteryHealth}%`;
  }

  const specEntries = Object.entries(mergedSpecs).filter(
    ([key]) => key !== 'colour' && key !== 'batteryHealth'
  );

  const extraEntries = Object.entries(mergedSpecs).filter(
    ([key]) => key === 'colour' || key === 'batteryHealth'
  );

  const allEntries = [...specEntries, ...extraEntries];
  const displayEntries = showAll ? allEntries : allEntries.slice(0, 6);

  if (allEntries.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="heading-sm text-surface-900">Specifications</h3>

      <div className="divide-y divide-surface-100 border border-surface-200 rounded-2xl overflow-hidden">
        {displayEntries.map(([key, value], i) => (
          <div
            key={key}
            className={`flex items-center px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-surface-50' : 'bg-white'}`}
          >
            <span className="w-6 text-base shrink-0">
              {SPEC_ICONS[key] || '•'}
            </span>
            <span className="w-28 text-surface-500 shrink-0">
              {SPEC_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
            </span>
            <span className="text-surface-900 font-medium">{String(value)}</span>
          </div>
        ))}
      </div>

      {allEntries.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-primary font-medium hover:underline transition-colors"
        >
          {showAll ? 'Show Less' : `View All ${allEntries.length} Specifications`}
        </button>
      )}
    </div>
  );
}
