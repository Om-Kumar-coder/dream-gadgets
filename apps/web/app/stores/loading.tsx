export default function StoresLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="h-48 sm:h-56 bg-surface-100 animate-pulse" />
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="h-7 w-48 bg-surface-100 animate-pulse rounded-lg mb-2" />
        <div className="h-4 w-80 bg-surface-50 animate-pulse rounded-lg mb-10" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
              <div className="h-48 bg-surface-50 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-32 bg-surface-100 animate-pulse rounded-lg" />
                <div className="h-4 w-full bg-surface-50 animate-pulse rounded-lg" />
                <div className="h-4 w-3/4 bg-surface-50 animate-pulse rounded-lg" />
                <div className="flex gap-2 mt-4">
                  <div className="h-9 flex-1 bg-surface-100 animate-pulse rounded-xl" />
                  <div className="h-9 flex-1 bg-surface-100 animate-pulse rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
