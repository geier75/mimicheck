import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function LoadingState({ message = "Lädt...", fullScreen = false }) {
    if (fullScreen) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="max-w-md w-full">
                    <CardContent className="flex flex-col items-center space-y-4 p-12">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                            {message}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-slate-700 dark:text-slate-300">{message}</p>
            </div>
        </div>
    );
}