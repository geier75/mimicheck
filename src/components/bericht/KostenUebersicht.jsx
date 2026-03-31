import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Euro, AlertTriangle, CheckCircle } from "lucide-react";

export default function KostenUebersicht({ analyseErgebnis, gesamtkosten }) {
  const kostenposten = analyseErgebnis?.kostenposten || [];
  
  return (
    <section className="my-10">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 border-b-2 border-slate-200 dark:border-slate-600 pb-2">
        Kostenaufstellung im Detail
      </h2>
      
      {/* Summary Card */}
      <Card className="mb-6 shadow-lg border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Euro className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-800 dark:text-white">Gesamtkosten</h3>
                <p className="text-slate-600 dark:text-slate-400">Laut Abrechnung</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-800 dark:text-white">
                {gesamtkosten?.toFixed(2) || '0.00'}€
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">für den Abrechnungszeitraum</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Items */}
      <div className="space-y-4">
        {kostenposten.map((position, index) => {
          const isOk = position.status === 'ok';
          const isProblematic = position.status === 'pruefbeduerftig';
          const hasError = position.status === 'fehlerhaft';
          
          return (
            <Card key={index} className={`shadow-md border-2 ${
              hasError 
                ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20' 
                : isProblematic 
                  ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20'
                  : 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        hasError 
                          ? 'bg-red-500 text-white'
                          : isProblematic 
                            ? 'bg-amber-500 text-white'
                            : 'bg-green-500 text-white'
                      }`}>
                        {hasError ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : isProblematic ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </div>
                      <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                        {position.position}
                      </h3>
                      <Badge className={
                        hasError 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                          : isProblematic 
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
                      }>
                        {hasError ? 'Fehlerhaft' : isProblematic ? 'Prüfung nötig' : 'In Ordnung'}
                      </Badge>
                    </div>
                    
                    {position.bemerkung && (
                      <p className={`text-sm mt-2 p-3 rounded-lg border ${
                        hasError 
                          ? 'text-red-700 dark:text-red-300 bg-red-100/50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
                          : isProblematic 
                            ? 'text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
                            : 'text-green-700 dark:text-green-300 bg-green-100/50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
                      }`}>
                        <strong>Hinweis:</strong> {position.bemerkung}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">
                      {position.betrag?.toFixed(2) || '0.00'}€
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Position {index + 1}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {kostenposten.length === 0 && (
        <Card className="shadow-md border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Euro className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
              Keine detaillierten Kostenposten verfügbar
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Die Kostenaufstellung konnte nicht automatisch analysiert werden.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}