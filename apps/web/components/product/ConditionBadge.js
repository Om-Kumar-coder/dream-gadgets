import { jsx as _jsx } from "react/jsx-runtime";
const CONDITION_CONFIG = {
    sealed_pack: { label: 'Sealed', className: 'bg-primary text-primary-foreground' },
    open_box: { label: 'Open Box', className: 'bg-primary text-primary-foreground' },
    super_mint: { label: 'Super Mint', className: 'bg-emerald-500 text-white' },
    mint: { label: 'Mint', className: 'bg-teal-500 text-white' },
    good: { label: 'Good', className: 'bg-amber-500 text-white' },
};
export function ConditionBadge({ condition }) {
    const config = CONDITION_CONFIG[condition] ?? { label: condition, className: 'bg-surface-500 text-white' };
    return (_jsx("span", { className: `px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm ${config.className}`, children: config.label }));
}
//# sourceMappingURL=ConditionBadge.js.map