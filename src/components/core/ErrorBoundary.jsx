/**
 * G0.3 - GLOBAL ERROR BOUNDARY
 * App bleibt trotz Komponentenfehlern nutzbar
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackError, AREA, SEVERITY } from './telemetry';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        this.setState({
            error,
            errorInfo,
        });

        trackError(error, this.props.area || AREA.APPLICATION, {
            componentStack: errorInfo.componentStack,
            route: window.location.pathname,
        }, SEVERITY.CRITICAL);

        if (window.MiMiCheckObservability) {
            window.MiMiCheckObservability.trackUserInteraction(
                'ui.errorBoundary.hit',
                this.props.area || AREA.APPLICATION,
                {
                    error: error.toString(),
                    stack: error.stack,
                }
            );
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
        
        if (this.props.onReset) {
            this.props.onReset();
        } else {
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
                    <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Ups! Etwas ist schiefgelaufen
                        </h1>

                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                            Ein unerwarteter Fehler ist aufgetreten. Keine Sorge, Ihre Daten sind sicher.
                        </p>

                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8 text-left">
                            <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">
                                Fehlerdetails:
                            </h3>
                            <p className="text-sm text-red-800 dark:text-red-400 font-mono">
                                {this.state.error && this.state.error.toString()}
                            </p>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Button
                                onClick={this.handleReset}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                            >
                                <RefreshCw className="w-5 h-5 mr-2" />
                                Seite neu laden
                            </Button>
                            
                            <Button
                                onClick={() => window.location.href = '/'}
                                variant="outline"
                                className="px-8 py-3 text-lg"
                            >
                                Zur Startseite
                            </Button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <details className="mt-8 text-left">
                                <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Stack Trace (Development)
                                </summary>
                                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-xs text-gray-800 dark:text-gray-200">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;