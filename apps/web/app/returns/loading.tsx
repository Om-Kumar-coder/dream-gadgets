export default function ReturnsLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-48 sm:h-56 bg-surface-100 animate-pulse" />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-7 w-40 bg-surface-100 animate-pulse rounded-lg mb-2" />
        <div className="h-4 w-64 bg-surface-50 animate-pulse rounded-lg mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-surface-50 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
