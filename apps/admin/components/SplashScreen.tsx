'use client';

/**
 * Branded loading screen for the admin app.
 * Shown while OfflineProvider initializes IndexedDB so the user
 * sees branded feedback instead of a blank or partially-ready UI.
 */
export function SplashScreen() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      role="status"
      aria-label="Loading Dream Gadgets Admin"
    >
      {/* Base background */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950" />

      {/* Red glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[26rem] h-[26rem] rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute -bottom-44 -right-40 w-[30rem] h-[30rem] rounded-full bg-accent/10 blur-3xl animate-float" />
        <div className="absolute top-1/3 left-1/2 w-72 h-72 -translate-x-1/2 rounded-full bg-primary/5 blur-2xl animate-glow-pulse" />
      </div>

      {/* Center content */}
      <div className="relative flex flex-col items-center px-6">
        {/* Logo with entrance + pulsing glow ring */}
        <div className="relative mb-10">
          <div className="absolute -inset-14 rounded-full bg-primary/10 animate-glow-pulse" />
          <div className="absolute -inset-4 rounded-full border border-primary/20" />
          <img
            src="/admin/logo-dark-bg.png"
            alt="Dream Gadgets"
            className="w-[min(70vw,20rem)] h-auto animate-logo-pop"
            draggable={false}
          />
        </div>

        {/* Brand label */}
        <p className="text-[11px] text-surface-400 font-semibold tracking-[0.35em] uppercase mb-1 animate-fade-in-up">
          Dream Gadgets
        </p>
        <p className="text-[10px] text-surface-500 font-medium tracking-[0.3em] uppercase mb-12 animate-fade-in-up">
          Admin Panel
        </p>

        {/* Progress bar */}
        <div className="w-56 md:w-64">
          <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-primary to-accent animate-bar-slide" />
          </div>
          <p className="text-[10px] text-surface-500 text-center mt-3 font-medium tracking-wide animate-pulse-soft">
            Initializing workspace
            <span className="animate-dots" aria-hidden>...</span>
          </p>
        </div>
      </div>

      {/* Bottom credit */}
      <p className="absolute bottom-8 text-[10px] text-surface-700 font-medium tracking-[0.25em] uppercase">
        Dream Gadgets — Since 2020
      </p>

      <style jsx>{`
        @keyframes logoPop {
          0% { opacity: 0; transform: scale(0.7) translateY(16px); }
          60% { opacity: 1; transform: scale(1.04) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-logo-pop {
          animation: logoPop 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes barSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(220%); }
        }
        .animate-bar-slide {
          animation: barSlide 1.3s ease-in-out infinite;
        }
        .animate-dots {
          animation: dotsBlink 1.4s ease-in-out infinite;
        }
        @keyframes dotsBlink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
