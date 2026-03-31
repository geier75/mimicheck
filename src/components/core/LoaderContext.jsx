/**
 * K1.1 - GLOBAL LOADER (pending-Counter)
 * Einheitlicher Ladeindikator für alle API-Aufrufe
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { track, AREA } from './telemetry';

const LoaderContext = createContext();

export const useLoader = () => {
    const context = useContext(LoaderContext);
    if (!context) {
        throw new Error('useLoader must be used within LoaderProvider');
    }
    return context;
};

export function LoaderProvider({ children }) {
    const [pendingCount, setPendingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const incrementPending = useCallback(() => {
        setPendingCount(prev => {
            const newCount = prev + 1;
            track('net.pending.count', AREA.APPLICATION, { count: newCount });
            return newCount;
        });
    }, []);

    const decrementPending = useCallback(() => {
        setPendingCount(prev => {
            const newCount = Math.max(0, prev - 1);
            track('net.pending.count', AREA.APPLICATION, { count: newCount });
            return newCount;
        });
    }, []);

    useEffect(() => {
        setIsLoading(pendingCount > 0);
    }, [pendingCount]);

    return (
        <LoaderContext.Provider value={{ pendingCount, isLoading, incrementPending, decrementPending }}>
            {children}
            {isLoading && <GlobalLoader />}
        </LoaderContext.Provider>
    );
}

function GlobalLoader() {
    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
            <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 rounded-full shadow-lg p-3 pointer-events-auto">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
        </div>
    );
}