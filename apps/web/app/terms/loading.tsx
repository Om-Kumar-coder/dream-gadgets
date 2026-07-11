export default function TermsLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-48 sm:h-56 bg-surface-100 animate-pulse" />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-7 w-32 bg-surface-100 animate-pulse rounded-lg mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-3/4 bg-surface-100 animate-pulse rounded-lg" />
              <div className="h-4 w-full bg-surface-50 animate-pulse rounded-lg" />
              <div className="h-4 w-5/6 bg-surface-50 animate-pulse rounded-lg" />
              <div className="h-4 w-2/3 bg-surface-50 animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
