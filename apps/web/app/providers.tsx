'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState } from 'react';
import { useWebAuthStore } from '../store/auth.store';
import { RealtimeProvider } from '../components/RealtimeProvider';
import { SplashScreen } from '../components/common/SplashScreen';

type SplashPhase = 'showing' | 'exiting' | 'done';

/** Minimum time the splash stays visible (branded first-load experience). */
const MIN_SPLASH_MS = 1400;
/** Duration of the splash exit animation before unmount. */
const EXIT_MS = 750;

const SplashContext = createContext<{ ready: boolean }>({ ready: true });

/** Lets descendants know the splash has finished (e.g. to skip auth flash). */
export const useSplashGate = () => useContext(SplashContext);

function SplashGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<SplashPhase>('showing');
  const hydrate = useWebAuthStore((s) => s.hydrate);

  // Kick off auth hydration immediately so the UI behind the splash is ready,
  // then hold the splash for a minimum branded duration before exiting.
  useEffect(() => {
    hydrate();

    const timer = setTimeout(() => setPhase('exiting'), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, [hydrate]);

  // Unmount the splash once the exit animation completes.
  useEffect(() => {
    if (phase !== 'exiting') return;
    const timer = setTimeout(() => setPhase('done'), EXIT_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <SplashContext.Provider value={{ ready: phase === 'done' }}>
      {phase !== 'done' && <SplashScreen exiting={phase === 'exiting'} />}
      {children}
    </SplashContext.Provider>
  );
}

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useWebAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SplashGate>
        <AuthHydrator>
          <RealtimeProvider>{children}</RealtimeProvider>
        </AuthHydrator>
      </SplashGate>
    </QueryClientProvider>
  );
}
