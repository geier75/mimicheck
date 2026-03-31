import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils';

/**
 * Error Boundary Komponente
 * Fängt JavaScript-Fehler in Kinderkomponenten und zeigt eine Fallback-UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Logge den Fehler
    logger.error('ErrorBoundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
    });

    // Optional: Sende an Error-Tracking-Service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      // Custom Fallback UI von Props
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, showDetails } = this.state;
      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
            </div>

            {/* Titel */}
            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Etwas ist schiefgelaufen
            </h1>
            <p className="text-slate-400 text-center mb-6">
              {this.props.message || 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button 
                onClick={this.handleRetry}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Erneut versuchen
              </Button>
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Home className="w-4 h-4 mr-2" />
                Zur Startseite
              </Button>
            </div>

            {/* Fehlerdetails (nur in Dev) */}
            {isDev && error && (
              <div className="border-t border-slate-800 pt-4">
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center text-sm text-slate-500 hover:text-slate-400 mb-2"
                >
                  {showDetails ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                  Technische Details
                </button>
                
                {showDetails && (
                  <div className="bg-slate-950 rounded-lg p-4 overflow-auto max-h-60">
                    <p className="text-red-400 font-mono text-sm mb-2">
                      {error.toString()}
                    </p>
                    {errorInfo?.componentStack && (
                      <pre className="text-slate-500 font-mono text-xs whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC für funktionale Komponenten mit Error Boundary
 */
export function withErrorBoundary(Component, options = {}) {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...options}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
}

/**
 * Page-Level Error Boundary mit spezifischer Nachricht
 */
export function PageErrorBoundary({ children, pageName }) {
  return (
    <ErrorBoundary 
      message={`Die Seite "${pageName}" konnte nicht geladen werden.`}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
