import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 bg-surface-50/50">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-4">📱</div>
        <h1 className="text-5xl font-extrabold text-surface-900 mb-2">404</h1>
        <p className="text-lg font-semibold text-surface-700 mb-1">Page not found</p>
        <p className="text-sm text-surface-500 mb-8">
          The page you are looking for doesn&apos;t exist or may have been moved. Let&apos;s get you back to the good stuff.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-primary/25"
          >
            Browse Phones
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-surface-700 rounded-xl text-sm font-bold border border-surface-200 hover:bg-surface-50 active:scale-[0.97] transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
