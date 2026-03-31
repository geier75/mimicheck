import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Bot, 
    Zap, 
    Brain, 
    Target, 
    Shield, 
    Sparkles,
    ArrowRight,
    CheckCircle,
    Clock,
    Lightbulb
} from "lucide-react";

// Agentic AI Konzepte als interaktive Komponente
const agenticFeatures = [
    {
        id: 'scout',
        title: 'Proaktiver Förder-Scout',
        description: 'KI überwacht 24/7 neue Förderungen und benachrichtigt Sie automatisch',
        icon: <Target className="w-6 h-6" />,
        status: 'coming_soon',
        benefit: 'Nie wieder Förderungen verpassen',
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'autobot',
        title: 'Autonomer Antrags-Bot',
        description: 'Formulare werden automatisch ausgefüllt und eingereicht',
        icon: <Bot className="w-6 h-6" />,
        status: 'development',
        benefit: 'Anträge in 2 Minuten statt 2 Stunden',
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 'legal',
        title: 'KI-Rechtsbeistand',
        description: 'Automatische Widersprüche mit 85% Erfolgsquote',
        icon: <Shield className="w-6 h-6" />,
        status: 'beta',
        benefit: 'Professionelle Rechtsberatung für alle',
        color: 'from-emerald-500 to-teal-500'
    },
    {
        id: 'optimizer',
        title: 'Finanz-Optimierungs-Agent',
        description: 'Kontinuierliche Optimierung Ihrer gesamten Haushaltssituation',
        icon: <Zap className="w-6 h-6" />,
        status: 'concept',
        benefit: 'Bis zu 500€ mehr pro Monat',
        color: 'from-amber-500 to-orange-500'
    },
    {
        id: 'conversational',
        title: 'Conversational Klaus 2.0',
        description: 'Natürlicher Dialog-Agent für komplexe Beratungsgespräche',
        icon: <Brain className="w-6 h-6" />,
        status: 'active',
        benefit: '24/7 Expertenberatung verfügbar',
        color: 'from-indigo-500 to-purple-500'
    },
    {
        id: 'predictive',
        title: 'Life-Event Predictor',
        description: 'KI erkennt Lebensveränderungen und bereitet Förderungen vor',
        icon: <Sparkles className="w-6 h-6" />,
        status: 'research',
        benefit: 'Proaktive Vorbereitung auf Lebensereignisse',
        color: 'from-rose-500 to-pink-500'
    }
];

const getStatusInfo = (status) => {
    switch (status) {
        case 'active':
            return { label: 'Aktiv', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" /> };
        case 'beta':
            return { label: 'Beta', color: 'bg-blue-100 text-blue-800', icon: <Zap className="w-3 h-3" /> };
        case 'development':
            return { label: 'In Entwicklung', color: 'bg-purple-100 text-purple-800', icon: <Clock className="w-3 h-3" /> };
        case 'coming_soon':
            return { label: 'Bald verfügbar', color: 'bg-amber-100 text-amber-800', icon: <Clock className="w-3 h-3" /> };
        case 'concept':
            return { label: 'Konzept', color: 'bg-slate-100 text-slate-800', icon: <Lightbulb className="w-3 h-3" /> };
        case 'research':
            return { label: 'Forschung', color: 'bg-cyan-100 text-cyan-800', icon: <Brain className="w-3 h-3" /> };
        default:
            return { label: 'Unbekannt', color: 'bg-gray-100 text-gray-800', icon: null };
    }
};

export default function AgenticAIFeatures() {
    const [selectedFeature, setSelectedFeature] = useState(null);

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    🤖 Agentic AI - Die Zukunft der Staatshilfen
                </h2>
                <p className="text-lg text-slate-600 mt-2">
                    KI-Agenten, die autonom in Ihrem Namen handeln und optimieren
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agenticFeatures.map((feature) => {
                    const statusInfo = getStatusInfo(feature.status);
                    return (
                        <Card 
                            key={feature.id}
                            className={`cursor-pointer hover:shadow-xl transition-all duration-300 border-none bg-gradient-to-br ${feature.color} opacity-90 hover:opacity-100`}
                            onClick={() => setSelectedFeature(feature)}
                        >
                            <CardHeader className="text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {feature.icon}
                                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                                    </div>
                                    <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                                        {statusInfo.icon}
                                        {statusInfo.label}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="text-white">
                                <p className="text-sm opacity-90 mb-3">{feature.description}</p>
                                <div className="bg-white/20 rounded-lg p-3">
                                    <p className="font-semibold text-sm">💡 {feature.benefit}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Feature Detail Modal */}
            {selectedFeature && (
                <Card className="mt-8 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl text-purple-800 flex items-center gap-3">
                                {selectedFeature.icon}
                                {selectedFeature.title}
                            </CardTitle>
                            <Button 
                                variant="outline" 
                                onClick={() => setSelectedFeature(null)}
                                className="border-purple-300"
                            >
                                Schließen
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-white p-6 rounded-xl">
                            <h4 className="font-bold text-purple-800 mb-3">🎯 Was macht diese KI?</h4>
                            <p className="text-slate-700">{selectedFeature.description}</p>
                            
                            <h4 className="font-bold text-green-800 mt-6 mb-3">✅ Ihr Nutzen</h4>
                            <p className="text-green-700 font-medium">{selectedFeature.benefit}</p>

                            {selectedFeature.status === 'beta' && (
                                <div className="mt-6">
                                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                                        <Zap className="w-4 h-4 mr-2" />
                                        Beta-Test teilnehmen
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold text-indigo-800 mb-3">🚀 Die Revolution beginnt jetzt</h3>
                    <p className="text-indigo-700 mb-4">
                        Diese Agentic AI-Features machen uns zur ersten vollautonomen Staatshilfen-Plattform Deutschlands.
                        Seien Sie dabei, wenn KI-Agenten die Art, wie wir staatliche Leistungen beantragen, für immer verändern.
                    </p>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        <Bot className="w-4 h-4 mr-2" />
                        Frühzugang sichern
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}