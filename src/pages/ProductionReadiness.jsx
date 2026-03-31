import React from 'react';
import ProductionReadinessController from '../components/admin/ProductionReadinessController';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket } from "lucide-react";

export default function ProductionReadiness() {
    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Rocket className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                Production Readiness Center
                            </CardTitle>
                            <p className="text-lg text-slate-600 mt-2">
                                Finale Systemprüfung für den Live-Launch
                            </p>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Main Content */}
            <ProductionReadinessController />
        </div>
    );
}