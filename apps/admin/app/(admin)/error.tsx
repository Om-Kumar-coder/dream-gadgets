'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, AlertTriangle } from 'lucide-react';

function getErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred.';
  // API response error: { response: { data: { status: 'error', error: { code, message } } } }
  const apiMsg = error?.response?.data?.error?.message ?? error?.response?.data?.message;
  if (typeof apiMsg === 'string') return apiMsg;
  if (Array.isArray(apiMsg)) return apiMsg.join(', ');
  // AxiosError or Error with message string
  if (typeof error.message === 'string' && error.message.length < 200) return error.message;
  return 'An unexpected error occurred.';
}

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Admin page error:', error);
  }, [error]);

  const message = getErrorMessage(error);
  const is403 = error?.message?.includes('403') || error?.message?.toLowerCase()?.includes('forbidden');

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-surface-900 mb-1">
        {is403 ? 'Access Denied' : 'Something went wrong'}
      </h2>
      <p className="text-sm text-surface-500 max-w-md mb-6">
        {is403
          ? "You don't have permission to access this page."
          : message}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-surface-700 bg-surface-100 hover:bg-surface-200 rounded-xl transition-colors"
        >
          Go to Dashboard
        </button>
        {!is403 && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
