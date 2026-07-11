export default function LoginLoading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50/50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-surface-100 animate-pulse rounded-full mb-4" />
          <div className="h-7 w-40 bg-surface-100 animate-pulse rounded-lg mx-auto mb-2" />
          <div className="h-4 w-56 bg-surface-50 animate-pulse rounded-lg mx-auto" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-surface-100 p-6 sm:p-8 shadow-sm">
          <div className="space-y-5">
            <div>
              <div className="h-4 w-28 bg-surface-100 animate-pulse rounded-lg mb-2" />
              <div className="h-12 bg-surface-50 animate-pulse rounded-xl" />
            </div>
            <div>
              <div className="h-4 w-20 bg-surface-100 animate-pulse rounded-lg mb-2" />
              <div className="h-12 bg-surface-50 animate-pulse rounded-xl" />
              <div className="flex justify-end mt-2">
                <div className="h-3 w-24 bg-surface-50 animate-pulse rounded-lg" />
              </div>
            </div>
            <div className="h-12 bg-surface-100 animate-pulse rounded-xl" />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="h-4 w-48 bg-surface-50 animate-pulse rounded-lg mx-auto" />
          <div className="h-3 w-24 bg-surface-50 animate-pulse rounded-lg mx-auto mt-3" />
        </div>
      </div>
    </div>
  );
}
