export default function ShippingLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-48 sm:h-56 bg-surface-100 animate-pulse" />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-7 w-36 bg-surface-100 animate-pulse rounded-lg mb-2" />
        <div className="h-4 w-56 bg-surface-50 animate-pulse rounded-lg mb-8" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-surface-50 rounded-2xl space-y-3">
              <div className="h-5 w-40 bg-surface-100 animate-pulse rounded-lg" />
              <div className="h-4 w-full bg-surface-100/50 animate-pulse rounded-lg" />
              <div className="h-4 w-3/4 bg-surface-100/50 animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
