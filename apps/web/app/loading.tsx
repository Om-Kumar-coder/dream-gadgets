'use client';

import { useEffect, useState } from 'react';

export default function RootLoading() {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const enterTimer = setTimeout(() => setShow(true), 50);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        if (prev < 30) return prev + 3;
        if (prev < 60) return prev + 2;
        return prev + 0.5;
      });
    }, 100);

    return () => {
      clearTimeout(enterTimer);
      clearInterval(progressInterval);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-surface-950 transition-opacity duration-500">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-surface-50 to-white dark:from-surface-950 dark:via-surface-900 dark:to-surface-950" />

      {/* Animated circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/[0.03] animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/[0.02] animate-float-slow" />
      </div>

      {/* Logo Container */}
      <div className="relative flex flex-col items-center">
        {/* Logo mark */}
        <div className="relative mb-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow-red animate-scale-in-bounce">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <path d="M12 8v8" />
              <path d="M8 12h8" />
            </svg>
          </div>
          {/* Glow ring */}
          <div className="absolute -inset-4 rounded-3xl bg-primary/5 animate-pulse-glow" />
        </div>

        {/* Brand name */}
        <div className="flex flex-col items-center gap-1 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-surface-900 dark:text-white">
            Dream<span className="text-primary">Gadgets</span>
          </h1>
          <p className="text-xs text-surface-400 dark:text-surface-500 font-medium tracking-wide uppercase">
            Premium Certified Devices
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 md:w-56">
          <div className="h-1 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-surface-400 dark:text-surface-500 text-center mt-2 font-medium">
            {progress < 30 ? 'Loading...' : progress < 60 ? 'Almost there...' : 'Preparing experience...'}
          </p>
        </div>
      </div>

      {/* Bottom credit */}
      <p className="absolute bottom-8 text-[10px] text-surface-300 dark:text-surface-600 font-medium tracking-wider uppercase">
        Dream Gadgets &mdash; Since 2020
      </p>
    </div>
  );
}
