export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-48 sm:h-56 bg-surface-100 animate-pulse" />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="h-7 w-32 bg-surface-100 animate-pulse rounded-lg mb-4" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-surface-50 animate-pulse rounded-lg" />
          <div className="h-4 w-full bg-surface-50 animate-pulse rounded-lg" />
          <div className="h-4 w-5/6 bg-surface-50 animate-pulse rounded-lg" />
          <div className="h-4 w-full bg-surface-50 animate-pulse rounded-lg" />
          <div className="h-4 w-4/5 bg-surface-50 animate-pulse rounded-lg" />
        </div>
        <div className="h-8 w-40 bg-surface-100 animate-pulse rounded-full mt-8 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-surface-50 rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-surface-100 animate-pulse rounded-xl" />
              <div className="h-5 w-28 bg-surface-100 animate-pulse rounded-lg" />
              <div className="h-4 w-full bg-surface-100/50 animate-pulse rounded-lg" />
              <div className="h-4 w-2/3 bg-surface-100/50 animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
