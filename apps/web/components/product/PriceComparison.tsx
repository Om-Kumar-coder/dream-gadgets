'use client';

interface PriceComparisonProps {
  brand?: string;
  modelName?: string;
  refurbishedPrice: number;
  newPrice?: number | null;
}

export function PriceComparison({ brand, modelName, refurbishedPrice, newPrice }: PriceComparisonProps) {
  if (!newPrice || newPrice <= refurbishedPrice) return null;

  const savings = newPrice - refurbishedPrice;
  const savingsPercent = Math.round((savings / newPrice) * 100);

  return (
    <div className="space-y-3">
      <h3 className="heading-sm text-surface-900">Compare vs New</h3>
      <div className="border border-surface-200 rounded-2xl overflow-hidden divide-y divide-surface-100">
        <div className="compare-row bg-surface-50">
          <span className="text-surface-500">Condition</span>
          <div className="text-right">
            <p className="font-semibold text-surface-900">Refurbished</p>
            <p className="text-xs text-surface-400">Certified, tested, like-new</p>
          </div>
        </div>
        <div className="compare-row">
          <span className="text-surface-500">Price</span>
          <div className="text-right">
            <p className="text-lg font-extrabold text-primary">₹{refurbishedPrice.toLocaleString('en-IN')}</p>
            <p className="text-sm text-surface-400 line-through">₹{newPrice.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="compare-row bg-emerald-50">
          <span className="text-surface-500">You Save</span>
          <div className="text-right">
            <p className="text-lg font-extrabold text-emerald-600">₹{savings.toLocaleString('en-IN')}</p>
            <span className="inline-block text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              {savingsPercent}% OFF
            </span>
          </div>
        </div>
        <div className="compare-row bg-surface-50">
          <span className="text-surface-500">Warranty</span>
          <div className="text-right">
            <p className="font-semibold text-surface-900">Free 30-Day Warranty</p>
            <p className="text-xs text-surface-400">Same as new device warranty</p>
          </div>
        </div>
        <div className="compare-row">
          <span className="text-surface-500">Returns</span>
          <div className="text-right">
            <p className="font-semibold text-surface-900">7-Day Returns</p>
            <p className="text-xs text-surface-400">No questions asked</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
        <p className="text-sm font-semibold text-surface-900 mb-1">✨ Why choose refurbished?</p>
        <p className="text-xs text-surface-500">
          You get the same device experience at a fraction of the cost. Every device goes through our 20-point quality check
          and comes with warranty. Plus, you&apos;re helping reduce e-waste!
        </p>
      </div>
    </div>
  );
}
