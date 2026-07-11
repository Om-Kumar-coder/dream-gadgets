export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery skeleton */}
          <div>
            <div className="aspect-square bg-surface-50 animate-pulse rounded-3xl mb-4" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-20 bg-surface-50 animate-pulse rounded-xl" />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="space-y-6">
            <div>
              <div className="h-4 w-24 bg-surface-50 animate-pulse rounded-full mb-3" />
              <div className="h-8 w-3/4 bg-surface-50 animate-pulse rounded-lg mb-2" />
              <div className="h-4 w-1/2 bg-surface-50 animate-pulse rounded-lg" />
            </div>
            <div className="flex items-baseline gap-3">
              <div className="h-10 w-32 bg-surface-50 animate-pulse rounded-lg" />
              <div className="h-5 w-20 bg-surface-50 animate-pulse rounded-lg" />
            </div>
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 flex-1 bg-surface-50 animate-pulse rounded-xl" />
              ))}
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-24 bg-surface-50 animate-pulse rounded-lg" />
                  <div className="h-4 w-32 bg-surface-50 animate-pulse rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
