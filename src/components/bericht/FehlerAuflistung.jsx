import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Scale } from "lucide-react";

export default function FehlerAuflistung({ analyseErgebnis, rueckforderung }) {
  const fehler = analyseErgebnis?.fehler || [];
  
  if (fehler.length === 0) {
    return (
      <section className="my-10">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 border-b-2 border-slate-200 dark:border-slate-600 pb-2">
          Ergebnis der Prüfung
        </h2>
        <Card className="shadow-md bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6 text-center">
            <div className="text-green-800 dark:text-green-200 text-lg font-semibold">
              ✅ Keine gravierenden Fehler gefunden
            </div>
            <p className="text-green-700 dark:text-green-300 mt-2">
              Ihre Nebenkostenabrechnung entspricht den gesetzlichen Vorgaben.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="my-10">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 border-b-2 border-slate-200 dark:border-slate-600 pb-2">
        Detaillierte Auflistung der Auffälligkeiten
      </h2>
      
      {rueckforderung > 0 && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
          <div className="text-xl font-bold text-green-800 dark:text-green-200">
            💰 Geschätztes Rückforderungspotential: {rueckforderung.toFixed(2)} €
          </div>
          <p className="text-green-700 dark:text-green-300 text-sm mt-1">
            Basierend auf den gefundenen Fehlern können Sie voraussichtlich diesen Betrag zurückfordern.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {fehler.map((item, index) => (
          <Card key={index} className="shadow-md bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {item.kategorie}
              </CardTitle>
              <div className="text-xl font-bold text-red-700 dark:text-red-300">
                {(item.betrag || 0).toFixed(2)} €
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-200 mb-3">{item.beschreibung}</p>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 inline-flex items-center gap-2 p-2 rounded-md">
                <Scale className="w-3 h-3"/>
                <span>Rechtsgrundlage: {item.rechtsgrundlage}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}