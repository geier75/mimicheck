import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Welcome Header Skeleton */}
      <div className="h-48 bg-slate-200/50 dark:bg-slate-700/50 rounded-3xl p-10">
        <div className="flex items-center gap-8 mb-8">
          <div className="w-24 h-24 bg-slate-300/50 dark:bg-slate-600/50 rounded-3xl"></div>
          <div>
            <div className="h-12 w-96 bg-slate-300/50 dark:bg-slate-600/50 rounded-lg mb-4"></div>
            <div className="h-6 w-72 bg-slate-300/50 dark:bg-slate-600/50 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-[200px] bg-slate-200/50 dark:bg-slate-700/50 rounded-3xl"></div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid xl:grid-cols-5 gap-8">
        <div className="xl:col-span-2 h-[600px] bg-slate-200/50 dark:bg-slate-700/50 rounded-3xl"></div>
        <div className="xl:col-span-3 space-y-8">
          <div className="h-[200px] bg-slate-200/50 dark:bg-slate-700/50 rounded-3xl"></div>
          <div className="h-[368px] bg-slate-200/50 dark:bg-slate-700/50 rounded-3xl"></div>
        </div>
      </div>
    </div>
  );
}