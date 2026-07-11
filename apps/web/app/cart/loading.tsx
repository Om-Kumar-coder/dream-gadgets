export default function CartLoading() {
  return (
    <div className="min-h-screen bg-surface-50/50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 bg-surface-100 animate-pulse rounded-lg" />
            <div className="h-4 w-20 bg-surface-50 animate-pulse rounded-lg mt-1" />
          </div>
          <div className="h-9 w-24 bg-surface-100 animate-pulse rounded-xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Savings banner */}
            <div className="h-16 bg-surface-50 animate-pulse rounded-2xl" />

            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex gap-4 sm:gap-5 p-4 sm:p-6 bg-white rounded-2xl border border-surface-100"
              >
                {/* Image */}
                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-surface-50 animate-pulse rounded-xl shrink-0" />
                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-5 w-3/4 bg-surface-100 animate-pulse rounded-lg" />
                  <div className="h-3 w-1/3 bg-surface-50 animate-pulse rounded-lg" />
                  <div className="h-6 w-24 bg-surface-100 animate-pulse rounded-lg mt-2" />
                  {/* Quantity controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-0 border border-surface-200 rounded-xl overflow-hidden">
                      <div className="w-10 h-10 bg-surface-50 animate-pulse" />
                      <div className="w-10 h-10 bg-surface-50 animate-pulse" />
                      <div className="w-10 h-10 bg-surface-50 animate-pulse" />
                    </div>
                    <div className="h-4 w-16 bg-surface-50 animate-pulse rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-sm sticky top-28">
              <div className="h-6 w-36 bg-surface-100 animate-pulse rounded-lg mb-5" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-surface-50 animate-pulse rounded-lg" />
                  <div className="h-4 w-16 bg-surface-100 animate-pulse rounded-lg" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-surface-50 animate-pulse rounded-lg" />
                  <div className="h-4 w-12 bg-surface-100 animate-pulse rounded-lg" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-surface-100 flex justify-between">
                <div className="h-5 w-16 bg-surface-100 animate-pulse rounded-lg" />
                <div className="h-6 w-24 bg-surface-100 animate-pulse rounded-lg" />
              </div>
              <div className="mt-4">
                <div className="flex gap-2">
                  <div className="h-12 flex-1 bg-surface-50 animate-pulse rounded-xl" />
                  <div className="h-12 w-20 bg-surface-100 animate-pulse rounded-xl" />
                </div>
              </div>
              <div className="mt-5 h-12 bg-surface-100 animate-pulse rounded-xl" />
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-surface-50 animate-pulse rounded" />
                  <div className="h-3 w-40 bg-surface-50 animate-pulse rounded-lg" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-surface-50 animate-pulse rounded" />
                  <div className="h-3 w-32 bg-surface-50 animate-pulse rounded-lg" />
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-12 h-6 bg-surface-50 animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
            <div className="mt-4 h-12 bg-surface-50 animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
