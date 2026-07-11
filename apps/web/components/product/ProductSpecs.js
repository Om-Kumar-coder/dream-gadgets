'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const SPEC_LABELS = {
    processor: 'Processor',
    ram: 'RAM',
    storage: 'Storage',
    display: 'Display',
    camera: 'Camera',
    battery: 'Battery',
    os: 'Operating System',
};
const SPEC_ICONS = {
    processor: '🔲',
    ram: '💾',
    storage: '📦',
    display: '🖥️',
    camera: '📷',
    battery: '🔋',
    os: '⚙️',
};
export function ProductSpecs({ specs, storage, ram, colour, batteryHealth }) {
    const [showAll, setShowAll] = useState(false);
    const mergedSpecs = { ...specs };
    // Override with actual item-level values where available
    if (storage)
        mergedSpecs.storage = storage;
    if (ram)
        mergedSpecs.ram = ram;
    // Add extra specs
    if (colour)
        mergedSpecs.colour = colour;
    if (batteryHealth !== undefined && batteryHealth !== null) {
        mergedSpecs.batteryHealth = `${batteryHealth}%`;
    }
    const specEntries = Object.entries(mergedSpecs).filter(([key]) => key !== 'colour' && key !== 'batteryHealth');
    const extraEntries = Object.entries(mergedSpecs).filter(([key]) => key === 'colour' || key === 'batteryHealth');
    const allEntries = [...specEntries, ...extraEntries];
    const displayEntries = showAll ? allEntries : allEntries.slice(0, 6);
    if (allEntries.length === 0)
        return null;
    return (_jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "heading-sm text-surface-900", children: "Specifications" }), _jsx("div", { className: "divide-y divide-surface-100 border border-surface-200 rounded-2xl overflow-hidden", children: displayEntries.map(([key, value], i) => (_jsxs("div", { className: `flex items-center px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-surface-50' : 'bg-white'}`, children: [_jsx("span", { className: "w-6 text-base shrink-0", children: SPEC_ICONS[key] || '•' }), _jsx("span", { className: "w-28 text-surface-500 shrink-0", children: SPEC_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()) }), _jsx("span", { className: "text-surface-900 font-medium", children: String(value) })] }, key))) }), allEntries.length > 6 && (_jsx("button", { onClick: () => setShowAll(!showAll), className: "text-sm text-primary font-medium hover:underline transition-colors", children: showAll ? 'Show Less' : `View All ${allEntries.length} Specifications` }))] }));
}
//# sourceMappingURL=ProductSpecs.js.map