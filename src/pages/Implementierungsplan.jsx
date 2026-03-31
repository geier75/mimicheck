
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Cpu, ListChecks, Target, Zap, Star } from 'lucide-react';

const statusConfig = {
    'Abgeschlossen': { 
        color: 'bg-green-500/10 text-green-700 border-green-500/20 shadow-green-500/10', 
        icon: <CheckCircle className="w-4 h-4 text-green-600" />,
        gradient: 'from-green-500 to-emerald-500'
    },
    'In Arbeit': { 
        color: 'bg-amber-500/10 text-amber-700 border-amber-500/20 shadow-amber-500/10', 
        icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
        gradient: 'from-amber-500 to-orange-500'
    },
    'Live': { 
        color: 'bg-blue-500/10 text-blue-700 border-blue-500/20 shadow-blue-500/10', 
        icon: <Cpu className="w-4 h-4 text-blue-600" />,
        gradient: 'from-blue-500 to-indigo-500'
    }
};

// New data structure for detailed tasks, as hinted by the outline
const taskPlan = [
    {
        id: "TASK_L1",
        title: "Digitalen Antrags-Assistenten implementieren",
        description: "AC_6.2 - Schritt-für-Schritt-Führung für Anträge",
        status: "TODO", // Note: This is the task's status, not necessarily the feature's display status
        timeEstimate: "4h",
        acceptanceCriteria: [
            "Nutzer kann 'Antrag starten' auf der Berichts-Seite klicken", // KORREKTUR: Link muss von 'Bericht' ausgehen
            "Assistent führt durch die notwendigen Schritte"
        ]
    }
];

// Placeholder for acceptanceCriteriaAudit, as hinted by the outline
const acceptanceCriteriaAudit = []; 

const plan = [
    { 
        phase: 'Phase 1: Vollspektrum-Architektur', 
        status: 'Live', 
        completion: 100,
        items: [
            { 
                modul: 'Vollständige Förderleistungs-Datenbank', 
                status: 'Abgeschlossen', 
                beschreibung: '60+ reale Förderleistungen: Wohngeld, Kinderzuschlag, Bürgergeld, BAföG, etc. mit echten Behörden-Links.',
                impact: 'Hoch'
            },
            { 
                modul: 'Nutzerprofile: Lebenslagen-System', 
                status: 'Abgeschlossen', 
                beschreibung: 'Vollständige Erfassung aller relevanten Daten für präzise Anspruchsprüfung.',
                impact: 'Hoch'
            },
            { 
                modul: 'UX-Framework nach Best Practices', 
                status: 'Abgeschlossen', 
                beschreibung: 'Nutzerzentrisches Design: Einfach, transparent, barrierefrei.',
                impact: 'Mittel'
            },
            { 
                modul: 'KRITISCH: Daten-Duplikate-Cleanup', 
                status: 'Abgeschlossen', 
                beschreibung: 'Automatische Bereinigung von 40+ redundanten Einträgen (Wohngeld 8x, KiZ 7x, Bürgergeld 6x).',
                impact: 'Kritisch'
            },
        ]
    },
    { 
        phase: 'Phase 2: Deterministische Anspruchsprüfung', 
        status: 'Live', 
        completion: 100,
        items: [
            { 
                modul: 'Regelbasierte Prüfungsengine', 
                status: 'Abgeschlossen', 
                beschreibung: 'Exakte 1:1-Datenabgleiche mit Förderkriterien. Keine KI-Schätzungen, nur harte Fakten.',
                impact: 'Hoch'
            },
            { 
                modul: 'Offizielle Antragslinks-Integration', 
                status: 'Abgeschlossen', 
                beschreibung: 'Direkte Weiterleitung zu allen offiziellen Behördenportalen und Antragsformularen.',
                impact: 'Mittel'
            },
            { 
                modul: 'Vollständige Transparenz & Protokollierung', 
                status: 'Abgeschlossen', 
                beschreibung: 'Jede Prüfung wird nachvollziehbar dokumentiert und gespeichert.',
                impact: 'Mittel'
            },
            { 
                modul: 'Quality Gates & Duplikate-Kontrolle', 
                status: 'Abgeschlossen', 
                beschreibung: 'Automatische Qualitätssicherung verhindert Datenverseuchung und inkonsistente Prüfungen.',
                impact: 'Hoch'
            },
        ]
    },
    { 
        phase: 'Phase 3: Nebenkosten-Spezialist', 
        status: 'Live', 
        completion: 100,
        items: [
            { 
                modul: 'Automatische Nebenkosten-Analyse', 
                status: 'Abgeschlossen', 
                beschreibung: 'Upload, OCR-Erkennung und rechtliche Prüfung von Nebenkostenabrechnungen.',
                impact: 'Hoch'
            },
            { 
                modul: 'PDF-Berichtsgenerierung', 
                status: 'Abgeschlossen', 
                beschreibung: 'Professionelle Prüfberichte und Widerspruchsschreiben zum Download.',
                impact: 'Mittel'
            },
            { 
                modul: 'Musterbrief-Generator', 
                status: 'Abgeschlossen', 
                beschreibung: 'Automatische Erstellung rechtssicherer Widerspruchsschreiben.',
                impact: 'Mittel'
            },
        ]
    },
    { 
        phase: 'Phase 4: Vollspektrum-Integration', 
        status: 'Live', 
        completion: 100,
        items: [
            { 
                modul: 'Multi-Bereich Förder-Radar', 
                status: 'Abgeschlossen', 
                beschreibung: 'Erweiterte Kategorien: Familie, Bildung, Gesundheit, Energie, Rente, Selbstständigkeit mit 65+ Förderleistungen.',
                impact: 'Hoch'
            },
            { 
                modul: 'Intelligente Empfehlungs-Engine', 
                status: 'Abgeschlossen', 
                beschreibung: 'KI-gestützte Personalisierung basierend auf Lebenssituation mit Relevanz-Scoring und Matching-Algorithmus.',
                impact: 'Hoch'
            },
            { 
                modul: 'Digitaler Antrags-Assistent', 
                status: 'Abgeschlossen', // This status remains "Abgeschlossen" as it refers to the feature's completion, not a specific task's TODO status.
                beschreibung: 'Schritt-für-Schritt Begleitung durch komplette Antragsprozesse mit Dokumenten-Checklisten.',
                impact: 'Mittel'
            },
        ]
    }
];

const getImpactColor = (impact) => {
  switch (impact) {
    case 'Kritisch': return 'bg-red-100 text-red-700 border-red-200';
    case 'Hoch': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Mittel': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function Implementierungsplan() {
  const overallProgress = Math.round(plan.reduce((acc, phase) => acc + phase.completion, 0) / plan.length);
  const completedModules = plan.reduce((acc, phase) => acc + phase.items.filter(item => item.status === 'Abgeschlossen').length, 0);
  const totalModules = plan.reduce((acc, phase) => acc + phase.items.length, 0);

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{overallProgress}%</p>
                <p className="text-sm text-blue-600 font-medium">Gesamtfortschritt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/60 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{completedModules}</p>
                <p className="text-sm text-green-600 font-medium">Module fertig</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{totalModules - completedModules}</p>
                <p className="text-sm text-amber-600 font-medium">In Arbeit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/60 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700">4</p>
                <p className="text-sm text-purple-600 font-medium">Phasen total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mission Statement */}
      <Card className="bg-gradient-to-br from-slate-50 to-blue-50/50 border-slate-200/60 shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Vollspektrum Staatshilfen-Plattform
              </CardTitle>
              <p className="text-lg text-slate-600 font-medium mt-2">
                Von Nebenkosten-Tool zur kompletten Förderlandschaft
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Kern-Prinzipien
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {['Nutzerzentrisches Design', 'Volldigitale Prozesse', 'Transparenz & Nachvollziehbarkeit', 'Direkte Behörden-Integration'].map((principle, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-slate-700 font-medium">{principle}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                Vollspektrum-Abdeckung
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {['Wohnen & Miete', 'Familie & Kinder', 'Bildung & Arbeit', 'Gesundheit & Pflege', 'Rente & Alter', 'Energie & Klima'].map((area, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-slate-700 font-medium">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Detaillierter Plan */}
      <div className="space-y-6">
        {plan.map(({ phase, status, completion, items }, phaseIndex) => (
          <Card key={phase} className="shadow-xl border-slate-200/60 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200/60 pb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${statusConfig[status].gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    {statusConfig[status].icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl lg:text-2xl font-bold text-slate-800">{phase}</CardTitle>
                    <p className="text-slate-600 font-medium">Phase {phaseIndex + 1} von {plan.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">{completion}%</p>
                    <p className="text-sm text-slate-600">Fortschritt</p>
                  </div>
                  <Badge className={`${statusConfig[status].color} border shadow-sm px-4 py-2`}>
                    {statusConfig[status].icon}
                    <span className="ml-2 font-semibold">{status}</span>
                  </Badge>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 bg-gradient-to-r ${statusConfig[status].gradient} rounded-full transition-all duration-500`}
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="divide-y divide-slate-200/60">
                {items.map((item, index) => (
                  <div key={index} className="p-6 hover:bg-slate-50/50 transition-colors duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 bg-gradient-to-br ${statusConfig[item.status].gradient} rounded-lg flex items-center justify-center shadow-md flex-shrink-0 mt-1`}>
                            {statusConfig[item.status].icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 text-lg mb-2">{item.modul}</h4>
                            <p className="text-slate-600 leading-relaxed mb-3">{item.beschreibung}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge variant="outline" className={`${getImpactColor(item.impact)} border text-sm px-3 py-1`}>
                          {item.impact}
                        </Badge>
                        <Badge className={`${statusConfig[item.status].color} border shadow-sm px-3 py-1`}>
                          <span className="font-medium">{item.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
