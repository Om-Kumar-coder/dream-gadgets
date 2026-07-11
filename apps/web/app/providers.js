'use client';
import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useWebAuthStore } from '../store/auth.store';
import { RealtimeProvider } from '../components/RealtimeProvider';
function AuthHydrator({ children }) {
    const hydrate = useWebAuthStore(s => s.hydrate);
    useEffect(() => {
        hydrate();
    }, [hydrate]);
    return _jsx(_Fragment, { children: children });
}
export function Providers({ children }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: { staleTime: 60 * 1000, retry: 1 },
        },
    }));
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(AuthHydrator, { children: _jsx(RealtimeProvider, { children: children }) }) }));
}
//# sourceMappingURL=providers.js.map