const CONDITION_CONFIG: Record<string, { label: string; className: string }> = {
  sealed_pack: { label: 'Sealed', className: 'bg-primary text-primary-foreground' },
  open_box: { label: 'Open Box', className: 'bg-primary text-primary-foreground' },
  super_mint: { label: 'Super Mint', className: 'bg-emerald-500 text-white' },
  mint: { label: 'Mint', className: 'bg-teal-500 text-white' },
  good: { label: 'Good', className: 'bg-amber-500 text-white' },
};

export function ConditionBadge({ condition }: { condition: string }) {
  const config = CONDITION_CONFIG[condition] ?? { label: condition, className: 'bg-surface-500 text-white' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm ${config.className}`}>
      {config.label}
    </span>
  );
}
