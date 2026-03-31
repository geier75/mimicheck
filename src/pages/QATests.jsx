import React from 'react';
import E2ESmokeTests from '@/components/qa/E2ESmokeTests';

export default function QATests() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <E2ESmokeTests />
        </div>
    );
}