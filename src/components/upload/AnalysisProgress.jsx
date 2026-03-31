import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, FileText } from 'lucide-react';

export default function AnalysisProgress({ steps, currentStep, fileName, uploadProgress = 0 }) {
    const totalSteps = steps?.length || 1;
    const stepIndex = Math.max(1, Math.min(currentStep, totalSteps));
    // Overall progress: completed full steps + partial progress for step 1 (upload)
    const fractionalStep = stepIndex === 1 ? Math.max(0, Math.min(uploadProgress / 100, 1)) : 0;
    const overallProgress = ((stepIndex - 1) + fractionalStep) / totalSteps * 100;
    return (
        <Card className="shadow-2xl border-none bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                    Dokument wird analysiert...
                </CardTitle>
                <div className="flex items-center justify-center gap-3 p-4 bg-slate-100/60 dark:bg-slate-700/60 rounded-xl">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                        {fileName}
                    </span>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-6 px-8 pb-8">
                {steps.map((step, index) => {
                    const isActive = index + 1 === currentStep;
                    const isCompleted = index + 1 < currentStep;
                    const isPending = index + 1 > currentStep;
                    
                    return (
                        <div key={index} 
                             className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-500 ${
                                 isActive ? 'bg-blue-50/80 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800' :
                                 isCompleted ? 'bg-green-50/60 dark:bg-green-900/20' :
                                 'bg-slate-50/60 dark:bg-slate-800/60'
                             }`}>
                            
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                                isCompleted ? 'bg-green-500 text-white' :
                                isActive ? 'bg-blue-500 text-white' :
                                'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
                            }`}>
                                {isCompleted ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : isActive ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <span className="text-sm font-bold">{index + 1}</span>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold transition-all duration-300 ${
                                    isActive ? 'text-blue-800 dark:text-blue-200' :
                                    isCompleted ? 'text-green-800 dark:text-green-200' :
                                    'text-slate-600 dark:text-slate-400'
                                }`}>
                                    {step.title}
                                </h3>
                                <p className={`text-sm mt-1 transition-all duration-300 ${
                                    isActive ? 'text-blue-600 dark:text-blue-300' :
                                    isCompleted ? 'text-green-600 dark:text-green-300' :
                                    'text-slate-500 dark:text-slate-400'
                                }`}>
                                    {step.description}
                                    {isActive && index === 0 && (
                                        <span className="ml-2 text-xs font-semibold">{Math.round(uploadProgress)}%</span>
                                    )}
                                    {isActive && (
                                        <span className="inline-block ml-2 animate-pulse">⚡</span>
                                    )}
                                    {isCompleted && (
                                        <span className="inline-block ml-2 text-green-500">✓</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    );
                })}
                
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/60 dark:border-blue-800/60">
                    <div className="flex items-center justify-center gap-3 text-blue-800 dark:text-blue-200">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="font-medium">
                            Schritt {currentStep} von {steps.length} - Bitte haben Sie einen Moment Geduld
                        </span>
                    </div>
                    <div className="mt-4 bg-blue-200 dark:bg-blue-800 rounded-full h-2 overflow-hidden" data-testid="overall-progress-bar">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${overallProgress}%` }}
                            data-testid="overall-progress-fill"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}