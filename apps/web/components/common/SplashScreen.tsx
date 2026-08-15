'use client';

import { useEffect, useState } from 'react';

interface SplashScreenProps {
  /** When true, the splash plays its exit animation before being unmounted. */
  exiting: boolean;
}

/** Floating particles (fixed positions — no randomness at render time). */
const PARTICLES = [
  { left: '8%', size: 6, delay: 0, duration: 9 },
  { left: '16%', size: 4, delay: 1.2, duration: 11 },
  { left: '26%', size: 8, delay: 0.6, duration: 8 },
  { left: '37%', size: 5, delay: 2.4, duration: 10 },
  { left: '48%', size: 7, delay: 0.9, duration: 12 },
  { left: '58%', size: 4, delay: 1.8, duration: 9 },
  { left: '68%', size: 6, delay: 0.3, duration: 10 },
  { left: '77%', size: 5, delay: 2.1, duration: 8 },
  { left: '86%', size: 8, delay: 1.5, duration: 11 },
  { left: '93%', size: 4, delay: 0.7, duration: 9 },
];

export function SplashScreen({ exiting }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(id);
          return 90;
        }
        if (prev < 35) return prev + 4;
        if (prev < 65) return prev + 2;
        return prev + 0.6;
      });
    }, 90);
    return () => clearInterval(id);
  }, []);

  const label = progress < 35 ? 'Loading…' : progress < 65 ? 'Almost there…' : 'Preparing experience…';

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-smooth ${
        exiting ? 'opacity-0 scale-[1.05] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      role="status"
      aria-label="Loading Dream Gadgets"
    >
      {/* Base background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-surface-50 to-white dark:from-surface-950 dark:via-surface-900 dark:to-surface-950" />

      {/* Slow-shifting brand gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-accent/[0.06] dark:from-primary/[0.12] dark:via-transparent dark:to-accent/[0.08] bg-[length:220%_220%] animate-gradient-shift" />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[26rem] h-[26rem] rounded-full bg-primary/[0.08] blur-3xl animate-float" />
        <div className="absolute -bottom-44 -right-40 w-[30rem] h-[30rem] rounded-full bg-accent/[0.07] blur-3xl animate-float-slow" />
        <div className="absolute top-1/4 right-1/5 w-72 h-72 rounded-full bg-primary/[0.05] blur-2xl animate-float" />
        <div className="absolute bottom-1/4 left-1/6 w-60 h-60 rounded-full bg-accent/[0.04] blur-2xl animate-float-slow" />
      </div>

      {/* Rising particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute bottom-[-3rem] rounded-full bg-primary/20 dark:bg-primary/30 animate-float-up"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Center content */}
      <div className="relative flex flex-col items-center px-6">
        {/* Logo — large, with entrance + pulsing glow ring */}
        <div className="relative mb-12">
          <div className="absolute -inset-14 md:-inset-20 rounded-full bg-primary/[0.06] animate-pulse-glow" />
          <div className="absolute -inset-4 md:-inset-6 rounded-full border border-primary/10" />
          <img
            src="/logo-light-bg.png"
            alt="Dream Gadgets"
            className="w-[min(78vw,24rem)] h-auto animate-scale-in-bounce dark:hidden"
            draggable={false}
          />
          <img
            src="/logo-dark-bg.png"
            alt="Dream Gadgets"
            className="w-[min(78vw,24rem)] h-auto hidden animate-scale-in-bounce dark:block"
            draggable={false}
          />
        </div>

        {/* Tagline */}
        <p className="text-[11px] md:text-sm text-surface-400 dark:text-surface-500 font-semibold tracking-[0.35em] uppercase mb-12 animate-fade-in-up">
          Certified Pre-owned Devices
        </p>

        {/* Dynamic progress bar */}
        <div className="w-64 md:w-80">
          <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden shadow-inner relative">
            <div
              className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-[width] duration-200 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* moving shine on the bar fill */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer bg-[length:200%_100%]" />
            </div>
          </div>
          <p className="text-[10px] text-surface-400 dark:text-surface-500 text-center mt-3 font-medium tracking-wide">
            {label}
          </p>
        </div>
      </div>

      {/* Bottom credit */}
      <p className="absolute bottom-8 text-[10px] text-surface-300 dark:text-surface-600 font-medium tracking-[0.25em] uppercase">
        Dream Gadgets — Since 2020
      </p>
    </div>
  );
}
