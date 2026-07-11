'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useMemo } from 'react';
const DEVICE_TYPES = [
    { value: 'mobile', label: 'Mobile Phone' },
    { value: 'laptop', label: 'Laptop' },
    { value: 'tablet', label: 'Tablet' },
    { value: 'smartwatch', label: 'Smartwatch' },
    { value: 'gaming', label: 'Console' },
];
const DEVICE_TYPE_ICONS = {
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
export function BrandModelSelector({ brand, modelName, deviceType, onUpdate }) {
    const [searchValue, setSearchValue] = useState(brand && modelName ? `${brand} ${modelName}` : '');
    const [isFocused, setIsFocused] = useState(false);
    const wrapperRef = useRef(null);
    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
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
        if (!searchValue.trim())
            return ALL_DEVICES.slice(0, 8);
        const q = searchValue.toLowerCase();
        return ALL_DEVICES.filter(d => d.brand.toLowerCase().includes(q) ||
            d.model.toLowerCase().includes(q) ||
            `${d.brand} ${d.model}`.toLowerCase().includes(q)).slice(0, 12);
    }, [searchValue]);
    const handleSelect = (item) => {
        onUpdate({ brand: item.brand, modelName: item.model, deviceType: item.deviceType });
        setSearchValue(`${item.brand} ${item.model}`);
        setIsFocused(false);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "heading-sm text-surface-900 mb-1", children: "What device are you selling?" }), _jsx("p", { className: "text-sm text-surface-500", children: "Search for your device below" })] }), _jsxs("div", { ref: wrapperRef, className: "relative", children: [_jsxs("div", { className: "relative", children: [_jsxs("svg", { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("circle", { cx: "11", cy: "11", r: "8" }), _jsx("path", { d: "M21 21l-4.35-4.35" })] }), _jsx("input", { type: "text", value: searchValue, onChange: e => {
                                    setSearchValue(e.target.value);
                                    if (!e.target.value) {
                                        onUpdate({ brand: '', modelName: '' });
                                    }
                                }, onFocus: () => setIsFocused(true), placeholder: "Enter device name (e.g. iPhone 13, HP Laptop\u2026)", className: "w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-surface-200 bg-white text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" }), searchValue && (_jsx("button", { onClick: () => { setSearchValue(''); onUpdate({ brand: '', modelName: '' }); }, className: "absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-1", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] }), isFocused && filtered.length > 0 && (_jsx("div", { className: "absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-surface-100 shadow-xl shadow-black/5 overflow-hidden z-50 animate-dropdown max-h-80 overflow-y-auto", children: filtered.map((item, i) => (_jsxs("button", { type: "button", onClick: () => handleSelect(item), className: "w-full flex items-center gap-3 px-4 py-3 text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors text-left", children: [_jsx("span", { className: "text-lg shrink-0", children: DEVICE_TYPE_ICONS[item.deviceType] || '📱' }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("span", { className: "font-medium", children: [item.brand, " "] }), _jsx("span", { children: item.model })] }), _jsx("span", { className: "text-xs text-surface-400 capitalize shrink-0", children: item.deviceType })] }, `${item.brand}-${item.model}-${i}`))) })), _jsx("div", { className: "flex flex-wrap gap-2 mt-3", children: DEVICE_TYPES.map(dt => (_jsxs("button", { type: "button", onClick: () => {
                                onUpdate({ deviceType: dt.value });
                                setSearchValue('');
                            }, className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${deviceType === dt.value && !brand
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-surface-50 text-surface-500 hover:bg-surface-100 border border-surface-100'}`, children: [_jsx("span", { children: DEVICE_TYPE_ICONS[dt.value] }), dt.label] }, dt.value))) })] }), brand && modelName && (_jsx("div", { className: "p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in-up", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-2xl", children: DEVICE_TYPE_ICONS[deviceType] || '📱' }), _jsxs("div", { children: [_jsxs("p", { className: "text-sm font-semibold text-surface-900", children: [brand, " ", modelName] }), _jsx("p", { className: "text-xs text-surface-500 capitalize", children: deviceType })] }), _jsx("button", { type: "button", onClick: () => { setSearchValue(''); onUpdate({ brand: '', modelName: '' }); }, className: "ml-auto text-surface-400 hover:text-primary p-1 transition-colors", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }) })), !searchValue && (_jsxs("div", { className: "animate-fade-in-up", children: [_jsx("p", { className: "text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2", children: "Popular Brands" }), _jsx("div", { className: "flex flex-wrap gap-2", children: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Google', 'Dell', 'HP', 'Sony'].map(b => (_jsx("button", { type: "button", onClick: () => {
                                setSearchValue(b);
                                setIsFocused(true);
                            }, className: "px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-surface-200 text-surface-600 hover:border-primary/40 hover:text-primary transition-all", children: b }, b))) })] }))] }));
}
//# sourceMappingURL=BrandModelSelector.js.map