export default function CartLoading() {
  return (
    <div className="min-h-screen bg-surface-50/50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        <div className="h-8 w-48 bg-surface-100 animate-pulse rounded-lg mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-surface-100 p-4 sm:p-6">
                <div className="flex gap-4 sm:gap-5">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 bg-surface-50 animate-pulse rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-48 bg-surface-50 animate-pulse rounded-lg" />
                    <div className="h-3 w-24 bg-surface-50 animate-pulse rounded-lg" />
                    <div className="h-6 w-20 bg-surface-50 animate-pulse rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-surface-100 p-6 space-y-4">
            <div className="h-6 w-32 bg-surface-50 animate-pulse rounded-lg" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-24 bg-surface-50 animate-pulse rounded-lg" />
                  <div className="h-4 w-16 bg-surface-50 animate-pulse rounded-lg" />
                </div>
              ))}
            </div>
            <div className="h-12 w-full bg-surface-50 animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
