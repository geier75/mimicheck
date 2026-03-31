/**
 * K1.3 - PERFORMANCE BUDGET
 * Automatisches Performance-Monitoring mit Budget-Checks
 */

import { useEffect } from 'react';
import { track, trackPerformance, AREA, SEVERITY } from './telemetry';

const PERFORMANCE_BUDGETS = {
    // Core Web Vitals
    FCP: 1800,  // First Contentful Paint (ms)
    LCP: 2500,  // Largest Contentful Paint (ms)
    FID: 100,   // First Input Delay (ms)
    CLS: 0.1,   // Cumulative Layout Shift
    TTFB: 600,  // Time to First Byte (ms)
    
    // Custom Metrics
    TTI: 3500,  // Time to Interactive (ms)
    TBT: 200,   // Total Blocking Time (ms)
};

export function PerformanceBudget() {
    useEffect(() => {
        // K1.3: Monitor Core Web Vitals
        if ('PerformanceObserver' in window) {
            // FCP & LCP Observer
            const paintObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const metricName = entry.name === 'first-contentful-paint' ? 'FCP' : 'LCP';
                    const value = entry.startTime;
                    const budget = PERFORMANCE_BUDGETS[metricName];
                    const withinBudget = value <= budget;

                    trackPerformance(metricName.toLowerCase(), AREA.APPLICATION, value, {
                        budget,
                        withinBudget,
                        overBy: withinBudget ? 0 : value - budget
                    });

                    if (!withinBudget) {
                        console.warn(`⚠️ ${metricName} exceeded budget: ${value}ms > ${budget}ms`);
                    }
                }
            });

            try {
                paintObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
            } catch (e) {
                console.warn('Paint observer not supported:', e);
            }

            // FID Observer (First Input Delay)
            const fidObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const value = entry.processingStart - entry.startTime;
                    const budget = PERFORMANCE_BUDGETS.FID;
                    const withinBudget = value <= budget;

                    trackPerformance('fid', AREA.APPLICATION, value, {
                        budget,
                        withinBudget,
                        overBy: withinBudget ? 0 : value - budget
                    });

                    if (!withinBudget) {
                        console.warn(`⚠️ FID exceeded budget: ${value}ms > ${budget}ms`);
                    }
                }
            });

            try {
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID observer not supported:', e);
            }

            // CLS Observer (Cumulative Layout Shift)
            let clsScore = 0;
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsScore += entry.value;
                    }
                }

                const budget = PERFORMANCE_BUDGETS.CLS;
                const withinBudget = clsScore <= budget;

                trackPerformance('cls', AREA.APPLICATION, clsScore, {
                    budget,
                    withinBudget,
                    overBy: withinBudget ? 0 : clsScore - budget
                });

                if (!withinBudget) {
                    console.warn(`⚠️ CLS exceeded budget: ${clsScore} > ${budget}`);
                }
            });

            try {
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('CLS observer not supported:', e);
            }

            // Cleanup
            return () => {
                paintObserver.disconnect();
                fidObserver.disconnect();
                clsObserver.disconnect();
            };
        }

        // K1.3: Navigation Timing API (fallback for older browsers)
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const navigationStart = perfData.navigationStart;

                const metrics = {
                    ttfb: perfData.responseStart - navigationStart,
                    domReady: perfData.domContentLoadedEventEnd - navigationStart,
                    loadComplete: perfData.loadEventEnd - navigationStart,
                };

                Object.entries(metrics).forEach(([name, value]) => {
                    trackPerformance(name, AREA.APPLICATION, value, {
                        timestamp: new Date().toISOString()
                    });
                });

                track('perf.load.complete', AREA.APPLICATION, metrics, SEVERITY.LOW);
            }, 0);
        });

    }, []);

    return null;
}

/**
 * K1.3: Component-level Performance Monitor
 * Usage: <PerformanceMonitor componentName="Dashboard" />
 */
export function PerformanceMonitor({ componentName, children }) {
    useEffect(() => {
        const startTime = performance.now();

        return () => {
            const renderTime = performance.now() - startTime;
            trackPerformance(`component.${componentName}`, AREA.APPLICATION, renderTime, {
                component: componentName
            });

            if (renderTime > 100) {
                console.warn(`⚠️ Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`);
            }
        };
    }, [componentName]);

    return children || null;
}