import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { User } from "@/api/entities";
import { Abrechnung } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Plus,
    Euro,
    Clock,
    Activity,
    Sparkles,
    ShieldCheck
} from "lucide-react";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import TypingHeadline from "@/components/ui/TypingHeadline";
import MagneticButton from "@/components/ui/MagneticButton";
import FlowDiagram3D from "@/components/3d/FlowDiagram3D";
import DashboardAnimation from "@/components/animations/DashboardAnimation";
import SpotlightCard from "@/components/ui/SpotlightCard";

gsap.registerPlugin(ScrollTrigger);

import { useTranslation } from 'react-i18next';

export default function Dashboard() {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [abrechnungen, setAbrechnungen] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const heroRef = useRef(null);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const currentUser = await User.me();
            setUser(currentUser);

            const userAbrechnungen = await Abrechnung.list("-created_date", 10);
            setAbrechnungen(userAbrechnungen);
        } catch (error) {
            console.error("Fehler beim Laden:", error);
            setError("Dashboard konnte nicht geladen werden. Bitte überprüfen Sie Ihre Internetverbindung.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // GSAP ScrollTrigger for Hero Section
    useEffect(() => {
        if (!heroRef.current) return;

        gsap.to(".hero-content", {
            y: 50,
            opacity: 0.7,
            scrollTrigger: {
                trigger: heroRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true,
            },
        });

        gsap.fromTo(".stats-card",
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: ".stats-grid",
                    start: "top 80%",
                },
            }
        );

        return () => ScrollTrigger.getAll().forEach(t => t.kill());
    }, [isLoading]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('dashboard.greeting.morning', 'Guten Morgen');
        if (hour < 18) return t('dashboard.greeting.day', 'Guten Tag');
        return t('dashboard.greeting.evening', 'Guten Abend');
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'abgeschlossen':
                return <CheckCircle className="w-4 h-4 text-emerald-400" />;
            case 'in_bearbeitung':
                return <Clock className="w-4 h-4 text-blue-400 animate-spin" />;
            case 'fehler':
                return <AlertCircle className="w-4 h-4 text-red-400" />;
            default:
                return <Clock className="w-4 h-4 text-slate-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'abgeschlossen':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'in_bearbeitung':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'fehler':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            default:
                return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'abgeschlossen': return t('dashboard.status.completed', 'Abgeschlossen');
            case 'in_bearbeitung': return t('dashboard.status.processing', 'In Bearbeitung');
            case 'wartend': return t('dashboard.status.pending', 'Wartend');
            case 'fehler': return t('dashboard.status.error', 'Fehler');
            default: return status;
        }
    };

    if (isLoading) {
        return (
            <div className="h-full w-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <DashboardAnimation />
                </div>
                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-bold text-white mb-2">Dashboard wird geladen</h2>
                    <p className="text-slate-400">Ihre Daten werden sicher entschlüsselt...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <ErrorState message={error} onRetry={loadData} fullScreen />;
    }

    return (
        <div className="h-full w-full bg-transparent text-white relative">
            {/* Background Animation - Same style as Upload */}
            <div className="absolute inset-0 z-0">
                <Suspense fallback={<div className="w-full h-full bg-slate-950" />}>
                    <DashboardAnimation />
                </Suspense>
            </div>

            {/* Hero Section */}
            <section ref={heroRef} className="relative pt-20 pb-32 overflow-hidden">
                <div className="hero-content relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Pre-Headline Badge - Upload Style */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{t('dashboard.hero.secure', 'Sicher & Verschlüsselt')}</span>
                        </div>

                        {/* Hero Headline with Typing Effect */}
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 font-heading">
                            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                                <TypingHeadline />
                            </span>
                            <br />
                            <span className="text-white">{t('dashboard.hero.easy', 'leicht gemacht')}</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-8">
                            {getGreeting()}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}.<br />
                            {t('dashboard.hero.subtitle', 'MiMiCheck analysiert Ihre Dokumente mit KI.')}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                            <MagneticButton
                                onClick={() => navigate(createPageUrl("Upload"))}
                                data-cursor-text={t('dashboard.hero.ctaUpload', 'Upload starten')}
                                className="px-8 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition-all duration-300"
                            >
                                <Plus className="w-5 h-5 mr-2 inline" />
                                {t('dashboard.hero.ctaUpload', 'Neue Abrechnung')}
                            </MagneticButton>
                            <MagneticButton
                                onClick={() => navigate(createPageUrl("Antraege"))}
                                data-cursor-text={t('dashboard.hero.ctaAntraege', 'Anträge ansehen')}
                                className="px-8 py-4 rounded-2xl font-semibold border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 text-white"
                            >
                                <FileText className="w-5 h-5 mr-2 inline" />
                                {t('dashboard.hero.ctaAntraege', 'Meine Anträge')}
                            </MagneticButton>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Flow Diagram */}
            <section className="relative z-10 mb-20">
                <FlowDiagram3D />
            </section>

            {/* Stats Grid with Spotlight Cards - Upload Style (Double Layer) */}
            <section className="stats-grid relative z-10 max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Quick Stats Cards */}
                    <motion.div className="stats-card">
                        <SpotlightCard className="h-full p-1 border-white/10 overflow-hidden" spotlightColor="rgba(59, 130, 246, 0.15)">
                            <div className="bg-slate-900/50 rounded-xl p-6 h-full backdrop-blur-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl">
                                        <FileText className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <span className="text-xs font-mono text-blue-300 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                                        {t('dashboard.stats.total', 'GESAMT')}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-4xl font-bold text-white mb-1">
                                        {abrechnungen.length}
                                    </h3>
                                    <p className="text-slate-400">{t('dashboard.stats.abrechnungen', 'Abrechnungen')}</p>
                                </div>
                            </div>
                        </SpotlightCard>
                    </motion.div>

                    <motion.div className="stats-card">
                        <SpotlightCard className="h-full p-1 border-white/10 overflow-hidden" spotlightColor="rgba(168, 85, 247, 0.15)">
                            <div className="bg-slate-900/50 rounded-xl p-6 h-full backdrop-blur-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-purple-500/10 rounded-xl">
                                        <Activity className="w-8 h-8 text-purple-400" />
                                    </div>
                                    <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                                        {t('dashboard.stats.active', 'AKTIV')}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-4xl font-bold text-white mb-1">
                                        {abrechnungen.filter(a => a.status === 'in_bearbeitung').length}
                                    </h3>
                                    <p className="text-slate-400">{t('dashboard.stats.processing', 'In Bearbeitung')}</p>
                                </div>
                            </div>
                        </SpotlightCard>
                    </motion.div>

                    <motion.div className="stats-card">
                        <SpotlightCard className="h-full p-1 border-white/10 overflow-hidden" spotlightColor="rgba(16, 185, 129, 0.15)">
                            <div className="bg-slate-900/50 rounded-xl p-6 h-full backdrop-blur-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                                        <Euro className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                        {t('dashboard.stats.potential', 'POTENZIAL')}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-4xl font-bold text-white mb-1">
                                        ~2.500€
                                    </h3>
                                    <p className="text-slate-400">{t('dashboard.stats.savings', 'Ø Ersparnis/Jahr')}</p>
                                </div>
                            </div>
                        </SpotlightCard>
                    </motion.div>
                </div>
            </section>

            {/* Recent Activity - Upload Style */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white font-heading">{t('dashboard.activity.title', 'Letzte Aktivitäten')}</h2>
                    <Button variant="ghost" onClick={() => navigate(createPageUrl("Abrechnungen"))} className="text-slate-400 hover:text-white">
                        {t('dashboard.activity.viewAll', 'Alle anzeigen')} <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-4">
                    {abrechnungen.length === 0 ? (
                        <SpotlightCard className="p-1 border-white/10 overflow-hidden" spotlightColor="rgba(255, 255, 255, 0.05)">
                            <div className="bg-slate-900/50 rounded-xl p-12 text-center backdrop-blur-sm">
                                <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <p className="text-xl font-medium text-white mb-2">{t('dashboard.activity.emptyTitle', 'Noch keine Abrechnungen')}</p>
                                <p className="text-sm text-slate-400 mb-6">
                                    {t('dashboard.activity.emptyText', 'Starten Sie jetzt und lassen Sie uns Ihre Dokumente analysieren!')}
                                </p>
                                <Button onClick={() => navigate(createPageUrl("Upload"))} className="bg-blue-600 hover:bg-blue-500 text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('dashboard.activity.createFirst', 'Erste Abrechnung erstellen')}
                                </Button>
                            </div>
                        </SpotlightCard>
                    ) : (
                        abrechnungen.slice(0, 5).map((abrechnung) => (
                            <motion.div
                                key={abrechnung.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.005 }}
                                transition={{ duration: 0.2 }}
                            >
                                <SpotlightCard
                                    className="cursor-pointer group p-1 border-white/10 overflow-hidden"
                                    spotlightColor="rgba(59, 130, 246, 0.1)"
                                >
                                    <div
                                        className="bg-slate-900/50 rounded-xl p-6 backdrop-blur-sm flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                                        onClick={() => navigate(createPageUrl("Bericht", { id: abrechnung.id }))}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${abrechnung.status === 'abgeschlossen' ? 'bg-emerald-500/10' :
                                                abrechnung.status === 'in_bearbeitung' ? 'bg-blue-500/10' :
                                                    'bg-slate-800'
                                                }`}>
                                                {getStatusIcon(abrechnung.status)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                    {abrechnung.filename || `Abrechnung ${abrechnung.id.slice(0, 8)}`}
                                                </h3>
                                                <p className="text-sm text-slate-400">
                                                    {abrechnung.created_at && format(new Date(abrechnung.created_at), 'dd. MMMM yyyy', { locale: de })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge className={`${getStatusColor(abrechnung.status)} border bg-transparent`}>
                                                {getStatusText(abrechnung.status)}
                                            </Badge>
                                            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </SpotlightCard>
                            </motion.div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}