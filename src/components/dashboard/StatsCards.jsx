import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function StatsCards({ title, value, icon: Icon, bgColor, trend }) {
    return (
        <Card className="border-none shadow-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl glass-morphism card-3d hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bgColor} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white humanistic-serif mb-1">
                    {value}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {trend}
                </p>
            </CardContent>
        </Card>
    );
}