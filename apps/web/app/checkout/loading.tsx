export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-surface-50/50">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
        {/* Header + Stepper */}
        <div className="mb-10">
          <div className="h-8 w-32 bg-surface-100 animate-pulse rounded-lg mb-6" />
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-surface-100 animate-pulse rounded-full" />
                <div className="h-3 w-16 bg-surface-50 animate-pulse rounded-lg hidden sm:block" />
                {i < 3 && <div className="w-8 sm:w-16 h-px bg-surface-200 ml-2" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-surface-100 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="h-6 w-40 bg-surface-100 animate-pulse rounded-lg mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={i <= 3 ? 'sm:col-span-2' : ''}>
                    <div className="h-4 w-24 bg-surface-100 animate-pulse rounded-lg mb-2" />
                    <div className="h-12 bg-surface-50 animate-pulse rounded-xl" />
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-between items-center">
                <div className="h-10 w-32 bg-surface-50 animate-pulse rounded-xl" />
                <div className="h-10 w-44 bg-surface-100 animate-pulse rounded-xl" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-surface-100 rounded-2xl p-6 shadow-sm sticky top-28">
              <div className="h-6 w-36 bg-surface-100 animate-pulse rounded-lg mb-5" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-surface-50 animate-pulse rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-3/4 bg-surface-50 animate-pulse rounded-lg" />
                      <div className="h-2 w-1/4 bg-surface-50 animate-pulse rounded-lg" />
                    </div>
                    <div className="h-3 w-16 bg-surface-100 animate-pulse rounded-lg" />
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-surface-100 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-surface-50 animate-pulse rounded-lg" />
                  <div className="h-4 w-16 bg-surface-100 animate-pulse rounded-lg" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-surface-50 animate-pulse rounded-lg" />
                  <div className="h-4 w-12 bg-surface-50 animate-pulse rounded-lg" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-surface-100 flex justify-between">
                <div className="h-5 w-12 bg-surface-100 animate-pulse rounded-lg" />
                <div className="h-7 w-28 bg-surface-100 animate-pulse rounded-lg" />
              </div>
              <div className="mt-5 flex items-center justify-center gap-2">
                <div className="w-4 h-4 bg-surface-50 animate-pulse rounded" />
                <div className="h-3 w-40 bg-surface-50 animate-pulse rounded-lg" />
              </div>
              <div className="mt-4 flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-12 h-6 bg-surface-50 animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
