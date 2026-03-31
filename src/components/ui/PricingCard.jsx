import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap, Loader2 } from 'lucide-react';

export default function PricingCard({ plan, onSelect, isCurrentPlan, isLoading }) {
    return (
        <Card className={`relative overflow-hidden border-2 transition-all duration-300 ${
            plan.recommended 
                ? 'border-blue-500 shadow-2xl scale-105 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' 
                : 'border-slate-200 dark:border-slate-700 hover:shadow-xl hover:scale-102 bg-white dark:bg-slate-800'
        }`}>
            {plan.recommended && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            )}
            
            <CardHeader className="pb-8 pt-6">
                {plan.recommended && (
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none px-3 py-1">
                        <Zap className="w-3 h-3 mr-1" />
                        Empfohlen
                    </Badge>
                )}
                
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.title}
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {plan.subtitle}
                </p>
                
                <div className="mt-6">
                    <span className="text-5xl font-black text-slate-900 dark:text-white">
                        {plan.price}
                    </span>
                    {plan.id !== 'free' && (
                        <span className="text-slate-600 dark:text-slate-400 ml-2">/Monat</span>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                                plan.recommended ? 'text-blue-600' : 'text-green-600'
                            }`} />
                            <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>

                <Button
                    onClick={() => onSelect(plan.id)}
                    disabled={isCurrentPlan || isLoading}
                    className={`w-full py-6 text-lg font-semibold rounded-xl transition-all duration-300 ${
                        plan.recommended
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                            : isCurrentPlan
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 cursor-not-allowed'
                                : 'bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white'
                    }`}
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isCurrentPlan ? (
                        <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Aktiver Plan
                        </>
                    ) : (
                        plan.id === 'free' ? 'Aktueller Plan' : 'Jetzt upgraden'
                    )}
                </Button>

                {plan.id !== 'free' && (
                    <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                        Jederzeit kündbar • Keine versteckten Kosten
                    </p>
                )}
            </CardContent>
        </Card>
    );
}