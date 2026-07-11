export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="h-40 bg-surface-100 animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-40 bg-white/20 rounded-lg mx-auto animate-pulse" />
          <div className="h-4 w-32 bg-white/10 rounded-lg mx-auto mt-2 animate-pulse" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Search */}
        <div className="h-12 bg-surface-50 animate-pulse rounded-xl mb-4" />

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 pb-4 border-b border-surface-100 overflow-x-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-24 bg-surface-50 animate-pulse rounded-full shrink-0" />
          ))}
        </div>

        {/* Order cards */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="h-3 w-32 bg-surface-50 animate-pulse rounded-lg" />
                  <div className="h-3 w-24 bg-surface-50 animate-pulse rounded-lg mt-1" />
                </div>
                <div className="h-6 w-20 bg-surface-50 animate-pulse rounded-full" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="h-3 w-16 bg-surface-50 animate-pulse rounded-lg" />
                  <div className="h-7 w-28 bg-surface-100 animate-pulse rounded-lg mt-1" />
                </div>
                <div className="h-3 w-24 bg-surface-50 animate-pulse rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
