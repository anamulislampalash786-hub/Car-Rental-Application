import React, { useEffect, useState } from 'react';
import ReactDOM                        from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App                             from './App';
import useAuthStore                    from '@/store/authStore';
import './index.css';

// ─── Query Client ─────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime:            1000 * 60 * 5,
            retry:                1,
            refetchOnWindowFocus: false,
        },
    },
});

// ─── Hydration wrapper ────────────────────────────────────────────────────────

function AppWithHydration() {
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        // already hydrated before subscription
        if (useAuthStore.getState()._hasHydrated) {
            setHydrated(true);
            return;
        }

        const unsub = useAuthStore.subscribe(
            (state) => state._hasHydrated,
            (hasHydrated) => {
                if (hasHydrated) {
                    setHydrated(true);
                    unsub();
                }
            }
        );

        return () => unsub();
    }, []);

    if (!hydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    return <App />;
}

// ─── Root ─────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <AppWithHydration />
        </QueryClientProvider>
    </React.StrictMode>
);