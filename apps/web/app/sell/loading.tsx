export default function SellLoading() {
  return (
    <div className="min-h-screen bg-surface-50/50">
      {/* Hero skeleton */}
      <div className="relative h-[40vh] min-h-[280px] bg-gradient-to-br from-surface-100 to-surface-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <div className="h-5 w-32 bg-white/30 rounded-full mb-3 animate-pulse" />
          <div className="h-10 w-72 bg-white/20 rounded-xl mb-2 animate-pulse" />
          <div className="h-5 w-48 bg-white/15 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Form skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-surface-100 animate-pulse" />
              {step < 5 && <div className="w-8 h-1 bg-surface-100 animate-pulse rounded-full" />}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl border border-surface-100 p-8 shadow-sm">
          <div className="space-y-6">
            <div>
              <div className="h-4 w-24 bg-surface-100 animate-pulse rounded-lg mb-2" />
              <div className="h-12 bg-surface-50 animate-pulse rounded-xl" />
            </div>
            <div>
              <div className="h-4 w-32 bg-surface-100 animate-pulse rounded-lg mb-2" />
              <div className="h-12 bg-surface-50 animate-pulse rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i}>
                  <div className="h-4 w-20 bg-surface-100 animate-pulse rounded-lg mb-2" />
                  <div className="h-12 bg-surface-50 animate-pulse rounded-xl" />
                </div>
              ))}
            </div>
            <div className="h-32 bg-surface-50 animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
