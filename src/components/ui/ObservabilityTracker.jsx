import { useEffect, useMemo } from 'react';

// ZEPTO STEP 1.26: React Hook for Component-Level Observability
export const useObservability = (componentName, trackProps = {}) => {
    // FIXED: Extract complex expression to separate variable for static checking
    const trackPropsString = useMemo(() => JSON.stringify(trackProps), [trackProps]);

    useEffect(() => {
        if (window.MiMiCheckObservability) {
            const interactionId = window.MiMiCheckObservability.trackUserInteraction(
                'component_mount',
                componentName,
                { ...trackProps, timestamp: new Date().toISOString() }
            );

            return () => {
                window.MiMiCheckObservability.trackUserInteraction(
                    'component_unmount',
                    componentName,
                    { interactionId, timestamp: new Date().toISOString() }
                );
            };
        }
    }, [componentName, trackProps, trackPropsString]); // FIXED: Include all dependencies

    // ZEPTO STEP 1.27: Return tracking functions for component use
    return {
        trackClick: (elementName, metadata = {}) => {
            if (window.MiMiCheckObservability) {
                return window.MiMiCheckObservability.trackUserInteraction(
                    'click',
                    `${componentName}.${elementName}`,
                    metadata
                );
            }
        },
        trackError: (error, context = {}) => {
            if (window.MiMiCheckObservability) {
                return window.MiMiCheckObservability.trackError(
                    error,
                    { component: componentName, ...context },
                    'medium'
                );
            }
        },
        trackPerformance: (metricName, value, unit = 'ms') => {
            if (window.MiMiCheckObservability) {
                return window.MiMiCheckObservability.trackPerformance(
                    metricName,
                    value,
                    unit,
                    { component: componentName }
                );
            }
        }
    };
};

// ZEPTO STEP 1.28: HOC for automatic observability tracking
export const withObservability = (WrappedComponent, componentName) => {
    return function ObservableComponent(props) {
        const { trackClick, trackError, trackPerformance } = useObservability(
            componentName || WrappedComponent.name,
            { props: Object.keys(props) }
        );

        return (
            <WrappedComponent 
                {...props}
                trackClick={trackClick}
                trackError={trackError}
                trackPerformance={trackPerformance}
            />
        );
    };
};

export default { useObservability, withObservability };