import React from 'react';
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calculator, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function BerichtHeader({ abrechnung }) {
  return (
    <header className="mb-12">
      <div className="flex justify-between items-start border-b-4 border-slate-800 dark:border-slate-200 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">
            Prüfbericht Nebenkostenabrechnung
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Abrechnungsjahr: {abrechnung.abrechnungszeitraum}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 rounded-lg flex items-center justify-center">
              <Calculator className="w-7 h-7" />
            </div>
            <div className="font-bold text-lg text-slate-800 dark:text-white">
              Nebenkosten-Knacker
            </div>
          </div>
          <Link to={createPageUrl(`AntragAssistent?flow=widerspruch&abrechnungId=${abrechnung.id}`)}>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <FileText className="w-4 h-4 mr-2" />
              Widerspruch starten
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white mb-2">Mietobjekt</h3>
          <p className="text-slate-700 dark:text-slate-200">{abrechnung.objekt_adresse}</p>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white mb-2">Hausverwaltung</h3>
          <p className="text-slate-700 dark:text-slate-200">{abrechnung.verwalter}</p>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white mb-2">Analyse-Datum</h3>
          <p className="text-slate-700 dark:text-slate-200">{abrechnung.analyse_ergebnis.geprueft_am ? format(new Date(abrechnung.analyse_ergebnis.geprueft_am), "dd. MMMM yyyy", { locale: de }) : 'N/A'}</p>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white mb-2">Dokument</h3>
          <p className="text-slate-700 dark:text-slate-200">{abrechnung.titel}</p>
        </div>
      </div>
    </header>
  );
}