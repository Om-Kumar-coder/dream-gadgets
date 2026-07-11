export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-surface-50/50">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
        <div className="h-8 w-32 bg-surface-100 animate-pulse rounded-lg mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-white border border-surface-100 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="h-6 w-40 bg-surface-50 animate-pulse rounded-lg mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i}>
                  <div className="h-3 w-20 bg-surface-50 animate-pulse rounded-full mb-1.5" />
                  <div className="h-11 bg-surface-50 animate-pulse rounded-xl" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 bg-white border border-surface-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="h-6 w-32 bg-surface-50 animate-pulse rounded-lg" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-surface-50 animate-pulse rounded-lg" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-24 bg-surface-50 animate-pulse rounded-lg" />
                  <div className="h-2 w-16 bg-surface-50 animate-pulse rounded-lg" />
                </div>
              </div>
            ))}
            <div className="h-px bg-surface-100" />
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 bg-surface-50 animate-pulse rounded-lg" />
                  <div className="h-4 w-16 bg-surface-50 animate-pulse rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
