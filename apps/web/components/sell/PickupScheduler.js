'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const TIME_SLOTS = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '1:00 PM - 3:00 PM',
    '3:00 PM - 5:00 PM',
    '5:00 PM - 7:00 PM',
];
// Generate next 7 days
function getDateOptions() {
    const options = [];
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayName = days[date.getDay()];
        const month = months[date.getMonth()];
        const day = date.getDate();
        const value = date.toISOString().split('T')[0];
        const label = i === 1 ? `Tomorrow (${day} ${month})` : `${dayName} (${day} ${month})`;
        options.push({ value, label });
    }
    return options;
}
export function PickupScheduler({ data, onUpdate }) {
    const dateOptions = getDateOptions();
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "heading-sm text-surface-900 mb-1", children: "Schedule Free Pickup" }), _jsx("p", { className: "text-sm text-surface-500", children: "Choose a convenient time for doorstep pickup" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-2", children: "Pickup Date *" }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: dateOptions.map(d => (_jsx("button", { onClick: () => onUpdate({ pickupDate: d.value }), className: `p-3 rounded-xl text-sm transition-all text-center ${data.pickupDate === d.value
                                ? 'bg-primary text-white shadow-lg shadow-primary/30 font-semibold'
                                : 'bg-surface-50 text-surface-600 hover:bg-surface-100 border border-surface-100'}`, children: d.label }, d.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-2", children: "Pickup Time *" }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: TIME_SLOTS.map(t => (_jsxs("button", { onClick: () => onUpdate({ pickupTime: t }), className: `p-3 rounded-xl text-sm transition-all text-center ${data.pickupTime === t
                                ? 'bg-primary text-white shadow-lg shadow-primary/30 font-semibold'
                                : 'bg-surface-50 text-surface-600 hover:bg-surface-100 border border-surface-100'}`, children: ["\uD83D\uDD50 ", t] }, t))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-2", children: "Pickup Address *" }), _jsx("textarea", { value: data.address, onChange: e => onUpdate({ address: e.target.value }), placeholder: "Street, building, landmark...", rows: 2, className: "input resize-none" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-1.5", children: "City *" }), _jsx("input", { type: "text", value: data.city, onChange: e => onUpdate({ city: e.target.value }), placeholder: "Your city", className: "input" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Pincode *" }), _jsx("input", { type: "text", value: data.pincode, onChange: e => onUpdate({ pincode: e.target.value }), placeholder: "6-digit pincode", className: "input", maxLength: 6 })] })] }), _jsxs("div", { className: "p-3 bg-emerald-50 rounded-xl text-xs text-emerald-700 flex items-start gap-2 border border-emerald-200", children: [_jsx("svg", { className: "w-4 h-4 shrink-0 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("span", { children: "Free doorstep pickup. Our agent will arrive at your chosen time slot. You'll receive a confirmation call before pickup." })] })] }));
}
//# sourceMappingURL=PickupScheduler.js.map