import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Upload,
    Brain,
    Target,
    Zap,
    ArrowRight
} from "lucide-react";

const quickActions = [
    {
        title: "Nebenkostenabrechnung prüfen",
        description: "Laden Sie Ihre Abrechnung hoch für eine automatische Analyse",
        icon: Upload,
        link: "Upload",
        color: "from-blue-500 to-cyan-500",
        bgColor: "from-blue-50 to-cyan-50"
    },
    {
        title: "KI-Assistent fragen",
        description: "Stellen Sie Fragen zu Ihren Rechten als Mieter",
        icon: Brain,
        link: "Assistent",
        color: "from-purple-500 to-indigo-500",
        bgColor: "from-purple-50 to-indigo-50"
    },
    {
        title: "Förder-Prüfradar",
        description: "Entdecken Sie alle staatlichen Leistungen, die Ihnen zustehen",
        icon: Target,
        link: "FoerderPruefradar",
        color: "from-emerald-500 to-green-500",
        bgColor: "from-emerald-50 to-green-50"
    }
];

export default function QuickActions() {
    return (
        <Card className="border-none shadow-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl glass-morphism">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 humanistic-serif">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    Schnellaktionen
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {quickActions.map((action, index) => (
                    <div key={index} 
                         className={`p-6 rounded-2xl bg-gradient-to-br ${action.bgColor} border border-white/20 hover:shadow-lg transition-all duration-300 card-3d group`}>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                        <action.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 dark:text-white text-lg humanistic-serif">
                                        {action.title}
                                    </h3>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                    {action.description}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex justify-end">
                            <Link to={createPageUrl(action.link)}>
                                <Button className={`bg-gradient-to-r ${action.color} hover:shadow-xl text-white border-none px-6 py-2 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300 group-hover:translate-x-1`}>
                                    Los geht's
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}