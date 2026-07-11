'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const FUNCTIONAL_ISSUES = [
    'Won\'t charge',
    'Dead pixels',
    'Touch not working',
    'Face ID / Touch ID broken',
    'No network / WiFi',
    'Battery draining fast',
    'Speaker not working',
    'Camera not working',
    'Buttons not working',
    'Vibrator not working',
];
const CONDITIONS = [
    {
        value: 'sealed_pack',
        label: 'Sealed Pack',
        icon: '📦',
        desc: 'Brand new, original box sealed, never opened',
        color: 'bg-violet-50 text-violet-700 border-violet-200',
    },
    {
        value: 'open_box',
        label: 'Open Box',
        icon: '📱',
        desc: 'Opened but unused, all accessories intact',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
        value: 'super_mint',
        label: 'Super Mint',
        icon: '✨',
        desc: 'Like new, no scratches or signs of use',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
        value: 'mint',
        label: 'Mint',
        icon: '👍',
        desc: 'Minor usage marks, screen in perfect condition',
        color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
        value: 'good',
        label: 'Good',
        icon: '🔧',
        desc: 'Visible wear, scratches on body, screen OK',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
        value: 'fair',
        label: 'Fair',
        icon: '⚠️',
        desc: 'Significant wear, scratches on screen, dents',
        color: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    {
        value: 'broken',
        label: 'Broken / For Parts',
        icon: '🔨',
        desc: 'Cracked screen, battery issues, not working fully',
        color: 'bg-red-50 text-red-700 border-red-200',
    },
];
const CONDITION_QUESTIONS = [
    {
        id: 'screen',
        label: 'Screen Condition',
        options: ['Perfect', 'Minor Scratches', 'Deep Scratches', 'Cracked'],
    },
    {
        id: 'body',
        label: 'Body Condition',
        options: ['Like New', 'Minor Scratches', 'Visible Dents', 'Heavy Damage'],
    },
    {
        id: 'battery',
        label: 'Battery Health',
        options: ['90-100%', '70-89%', '50-69%', 'Below 50%'],
    },
];
export function ConditionSelector({ condition, screenCondition, bodyCondition, batteryHealth, functionalIssues, onUpdate }) {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "heading-sm text-surface-900 mb-1", children: "Device Condition" }), _jsx("p", { className: "text-sm text-surface-500", children: "How would you describe your device?" })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: CONDITIONS.map(c => (_jsxs("button", { onClick: () => onUpdate({ condition: c.value }), className: `condition-card ${condition === c.value
                        ? 'condition-card-selected'
                        : 'condition-card-unselected'}`, children: [_jsx("span", { className: "text-3xl", children: c.icon }), _jsxs("div", { className: "text-center", children: [_jsx("span", { className: `text-sm font-bold ${condition === c.value ? 'text-primary' : 'text-surface-900'}`, children: c.label }), _jsx("p", { className: "text-xs text-surface-500 mt-0.5", children: c.desc })] }), condition === c.value && (_jsx("span", { className: "absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm", children: _jsx("svg", { className: "w-3 h-3 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" }) }) }))] }, c.value))) }), condition && (_jsxs("div", { className: "space-y-4 p-5 bg-surface-50 rounded-2xl border border-surface-100 animate-fade-in-up", children: [_jsx("p", { className: "text-sm font-semibold text-surface-700", children: "Quick Assessment" }), CONDITION_QUESTIONS.map(q => {
                        const currentValue = q.id === 'screen' ? screenCondition :
                            q.id === 'body' ? bodyCondition :
                                batteryHealth;
                        return (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-surface-500 mb-2", children: q.label }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: q.options.map(o => {
                                        const isSelected = currentValue === o;
                                        const fieldKey = q.id === 'screen' ? 'screenCondition' :
                                            q.id === 'body' ? 'bodyCondition' :
                                                'batteryHealth';
                                        return (_jsx("button", { onClick: () => onUpdate({ [fieldKey]: isSelected ? '' : o }), className: `text-xs px-3 py-1.5 rounded-full border transition-all ${isSelected
                                                ? 'bg-primary text-white border-primary shadow-sm'
                                                : 'border-surface-200 text-surface-600 hover:border-primary hover:text-primary'}`, children: o }, o));
                                    }) })] }, q.id));
                    })] })), condition && (_jsxs("div", { className: "space-y-3 p-5 bg-white rounded-2xl border border-red-200", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm", children: "\u26A0\uFE0F" }), _jsx("p", { className: "text-sm font-semibold text-surface-700", children: "Functional Issues" }), _jsx("span", { className: "text-[10px] text-surface-400 font-normal", children: "(select all that apply)" })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: FUNCTIONAL_ISSUES.map(issue => {
                            const selectedIssues = functionalIssues
                                ? functionalIssues.split(',').map(s => s.trim())
                                : [];
                            const isSelected = selectedIssues.includes(issue);
                            return (_jsxs("button", { onClick: () => {
                                    const current = selectedIssues;
                                    const next = isSelected
                                        ? current.filter(i => i !== issue)
                                        : [...current, issue];
                                    onUpdate({ functionalIssues: next.length > 0 ? next.join(', ') : '' });
                                }, className: `text-xs px-3 py-2 rounded-xl border transition-all ${isSelected
                                    ? 'bg-red-50 text-red-700 border-red-300 shadow-sm'
                                    : 'border-surface-200 text-surface-600 hover:border-red-200 hover:text-red-600'}`, children: [isSelected && _jsx("span", { className: "mr-1", children: "\u2713" }), issue] }, issue));
                        }) })] }))] }));
}
//# sourceMappingURL=ConditionSelector.js.map