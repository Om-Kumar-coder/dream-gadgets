export default function FAQLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-48 sm:h-56 bg-surface-100 animate-pulse" />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-7 w-24 bg-surface-100 animate-pulse rounded-lg mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-surface-100 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5">
                <div className="h-5 w-3/4 bg-surface-100 animate-pulse rounded-lg" />
                <div className="w-5 h-5 bg-surface-100 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
