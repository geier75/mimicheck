import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ErrorState({ 
    title = "Fehler aufgetreten",
    message = "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
    onRetry,
    fullScreen = false 
}) {
    const content = (
        <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                {title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                {message}
            </p>
            {onRetry && (
                <Button 
                    onClick={onRetry}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Erneut versuchen
                </Button>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="flex items-center justify-center min-h-screen p-6">
                <Card className="max-w-2xl w-full border-red-200 dark:border-red-800">
                    <CardContent className="p-12">
                        {content}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <Alert variant="destructive" className="my-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-4">
                <div>
                    <strong>{title}</strong>
                    <p className="mt-1">{message}</p>
                </div>
                {onRetry && (
                    <Button 
                        onClick={onRetry}
                        variant="outline"
                        size="sm"
                        className="w-fit"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Erneut versuchen
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    );
}