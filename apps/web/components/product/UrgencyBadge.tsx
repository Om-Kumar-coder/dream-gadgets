'use client';

interface UrgencyBadgeProps {
  stockLevel?: 'low' | 'medium' | 'high' | 'out';
  salesVelocity?: 'fast' | 'normal' | 'slow';
  customMessage?: string;
}

export function UrgencyBadge({ stockLevel = 'high', salesVelocity = 'normal', customMessage }: UrgencyBadgeProps) {
  if (stockLevel === 'out') {
    return (
      <div className="urgency-pulse bg-red-50 text-red-600 border border-red-200">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        Out of Stock
      </div>
    );
  }

  if (stockLevel === 'low') {
    return (
      <div className="urgency-pulse bg-red-50 text-red-600 border border-red-200">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        Only 2 left in stock
      </div>
    );
  }

  if (salesVelocity === 'fast') {
    return (
      <div className="urgency-pulse bg-amber-50 text-amber-600 border border-amber-200">
        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
        Selling fast
      </div>
    );
  }

  if (customMessage) {
    return (
      <div className="urgency-pulse bg-blue-50 text-blue-600 border border-blue-200">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
        {customMessage}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
      In Stock
    </div>
  );
}

export function StockCounter({ count = 0 }: { count?: number }) {
  if (count <= 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      <div className="flex -space-x-1">
        {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
          <div
            key={i}
            className="w-5 h-5 rounded-full border-2 border-white bg-gray-200"
            style={{ background: i < 3 ? '#10B981' : i < 4 ? '#F59E0B' : '#EF4444' }}
          />
        ))}
      </div>
      <span>{count}+ people viewing</span>
    </div>
  );
}
