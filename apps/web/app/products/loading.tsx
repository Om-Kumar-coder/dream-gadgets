export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-surface-50/50">
      {/* Banner skeleton */}
      <div className="h-48 sm:h-64 bg-surface-100 animate-pulse" />

      {/* Header skeleton */}
      <div className="bg-white border-b border-surface-100/80">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="h-7 w-48 bg-surface-100 animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-32 bg-surface-100 animate-pulse rounded-lg" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar skeleton (desktop) */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="space-y-6">
            {[1, 2, 3].map((s) => (
              <div key={s}>
                <div className="h-3 w-16 bg-surface-100 animate-pulse rounded-full mb-3" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 bg-surface-50 animate-pulse rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Products grid skeleton */}
        <div className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
                <div className="aspect-[4/3] bg-surface-50 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-surface-50 animate-pulse rounded-lg w-3/4" />
                  <div className="h-3 bg-surface-50 animate-pulse rounded-lg w-1/2" />
                  <div className="h-5 bg-surface-50 animate-pulse rounded-lg w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
