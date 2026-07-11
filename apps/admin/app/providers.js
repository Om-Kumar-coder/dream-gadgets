'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@dream-gadgets/ui';
import { useState } from 'react';
import { OfflineProvider } from '@/lib/offline/OfflineProvider';
export function Providers({ children }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: { staleTime: 30 * 1000, retry: 1 },
        },
    }));
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsxs(OfflineProvider, { children: [children, _jsx(Toaster, { position: "top-right" })] }) }));
}
//# sourceMappingURL=providers.js.map