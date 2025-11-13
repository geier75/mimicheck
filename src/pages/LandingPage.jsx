import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import WebGLHero from '@/components/3d/WebGLHero';
import {
    ArrowRight,
    CheckCircle,
    Sparkles,
    Shield,
    Zap,
    Users,
    TrendingUp,
    Award,
    FileText,
    Brain,
    Target,
    Euro,
    Clock,
    Star,
    ChevronDown
} from 'lucide-react';

// PREMIUM HERO SECTION with Animated Background
const HeroSection = ({ onCTAClick }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <WebGLHero className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Subtle Gradient Overlay (over 3D background) */}
            <div className="absolute inset-0 -z-5 bg-gradient-to-br from-blue-900/10 via-transparent to-pink-900/10 dark:from-blue-950/20 dark:via-transparent dark:to-pink-950/20 pointer-events-none"></div>

            <div className="container mx-auto px-6 lg:px-8 py-20 lg:py-32">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Trust Badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            DSGVO-konform • Made in Germany
                        </span>
                    </div>

                    {/* Hero Headline */}
                    <h1 className={`text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-6 leading-tight humanistic-serif transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        Holen Sie sich, was{' '}
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                            Ihnen zusteht
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className={`text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        KI-gestützte Plattform findet <strong className="text-slate-900 dark:text-white">automatisch alle staatlichen Förderungen</strong> für die Sie berechtigt sind – und prüft Ihre Nebenkostenabrechnung auf Fehler.
                    </p>

                    {/* Social Proof Stats */}
                    <div className={`flex flex-wrap items-center justify-center gap-8 mb-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs font-bold">
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                <strong className="text-slate-900 dark:text-white">2.847+ Nutzer</strong> sparen durchschnittlich <strong className="text-green-600">€1.247/Jahr</strong>
                            </span>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <Button 
                            onClick={onCTAClick}
                            className="group relative px-8 py-6 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Kostenlos starten
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        </Button>

                        <Button 
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            variant="outline"
                            className="px-8 py-6 text-lg font-semibold rounded-2xl border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl text-slate-900 dark:text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Mehr erfahren
                            <ChevronDown className="w-5 h-5 ml-2" />
                        </Button>
                    </div>

                    {/* Trust Indicators */}
                    <div className={`mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Keine Kreditkarte erforderlich</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Kostenloser Basis-Check</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Jederzeit kündbar</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <ChevronDown className="w-8 h-8 text-slate-400" />
            </div>

            <style>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
            `}</style>
        </WebGLHero>
    );
};

// PREMIUM PROBLEM-SOLUTION SECTION
const ProblemSolutionSection = () => {
    const problems = [
        {
            icon: <FileText className="w-6 h-6 text-red-600" />,
            problem: "Nebenkostenabrechnungen sind kompliziert und oft fehlerhaft",
            solution: "KI-Analyse findet automatisch Fehler und berechnet Ihr Rückforderungspotential",
            stat: "87% der Abrechnungen enthalten Fehler"
        },
        {
            icon: <Euro className="w-6 h-6 text-amber-600" />,
            problem: "Staatliche Förderungen sind unübersichtlich und schwer zu finden",
            solution: "Intelligenter Förder-Radar prüft automatisch alle 180+ Leistungen für Sie",
            stat: "Durchschnittlich €1.247/Jahr ungenutzte Ansprüche"
        },
        {
            icon: <Clock className="w-6 h-6 text-blue-600" />,
            problem: "Anträge ausfüllen kostet Stunden und ist frustrierend",
            solution: "AI-Assistent füllt Formulare automatisch aus und unterstützt bei Widersprüchen",
            stat: "95% Zeitersparnis beim Ausfüllen"
        }
    ];

    return (
        <section id="problems" className="py-20 lg:py-32 bg-white dark:bg-slate-900">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white border-none text-sm font-bold">
                            DAS PROBLEM
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 humanistic-serif">
                            Sie verschenken Geld – ohne es zu wissen
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                            Tausende Euro an staatlichen Leistungen bleiben ungenutzt. Fehlerhafte Nebenkostenabrechnungen kosten Sie Jahr für Jahr Geld.
                        </p>
                    </div>

                    {/* Problem-Solution Cards */}
                    <div className="space-y-8">
                        {problems.map((item, index) => (
                            <Card key={index} className="border-none shadow-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                                <CardContent className="p-8 lg:p-10">
                                    <div className="grid md:grid-cols-2 gap-8 items-center">
                                        {/* Problem Side */}
                                        <div className="relative">
                                            <div className="absolute -left-4 top-0 w-1 h-full bg-red-500 rounded-full"></div>
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                                        {item.problem}
                                                    </h3>
                                                    <Badge variant="outline" className="border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                                                        {item.stat}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Solution Side */}
                                        <div className="relative">
                                            <div className="absolute -left-4 top-0 w-1 h-full bg-green-500 rounded-full"></div>
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
                                                        Unsere Lösung
                                                    </h4>
                                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                                        {item.solution}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// PREMIUM FEATURES SECTION with Icons
const FeaturesSection = () => {
    const features = [
        {
            icon: <Target className="w-8 h-8" />,
            title: "Förder-Prüfradar",
            description: "Intelligente KI analysiert Ihr Profil und findet automatisch alle 180+ staatlichen Leistungen für die Sie berechtigt sind.",
            benefits: ["Wohngeld", "Kindergeld", "Bürgergeld", "BAföG", "Energiehilfen", "Steuererleichterungen"],
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: <FileText className="w-8 h-8" />,
            title: "Nebenkosten-Knacker",
            description: "Laden Sie Ihre Abrechnung hoch – unsere KI prüft sie nach deutschem Mietrecht und findet Fehler automatisch.",
            benefits: ["Fehlerhafte Posten", "Unzulässige Kosten", "Falsche Umlagen", "Rückforderungspotential"],
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: <Brain className="w-8 h-8" />,
            title: "KI-Rechtsassistent",
            description: "Stellen Sie Fragen zu Mietrecht, Förderungen oder Widersprüchen – unser AI-Experte antwortet sofort.",
            benefits: ["24/7 verfügbar", "Musterbriefe", "Widerspruchs-Generator", "Rechtlich fundiert"],
            color: "from-amber-500 to-orange-500"
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Automatische Anträge",
            description: "PDFs automatisch ausfüllen mit Ihren Daten. Keine mühsame Handarbeit mehr – in Sekunden fertig.",
            benefits: ["Smart-Fill Technologie", "Fehlerprüfung", "DSGVO-konform", "Digitale Signatur"],
            color: "from-green-500 to-emerald-500"
        }
    ];

    return (
        <section id="features" className="py-20 lg:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none text-sm font-bold">
                            FEATURES
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 humanistic-serif">
                            Alles was Sie brauchen – in einer Plattform
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                            Modernste KI-Technologie trifft auf deutsches Rechtsverständnis. Entwickelt von Experten für Ihre finanzielle Sicherheit.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="border-none shadow-2xl bg-white dark:bg-slate-800 overflow-hidden group hover:scale-105 transition-all duration-300">
                                <CardContent className="p-8">
                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        {feature.icon}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 humanistic-serif">
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                        {feature.description}
                                    </p>

                                    {/* Benefits */}
                                    <div className="flex flex-wrap gap-2">
                                        {feature.benefits.map((benefit, i) => (
                                            <Badge key={i} variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                                                <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                                                {benefit}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// PREMIUM SOCIAL PROOF SECTION
const SocialProofSection = () => {
    const testimonials = [
        {
            name: "Sarah M.",
            role: "Mutter von 2 Kindern",
            avatar: "S",
            rating: 5,
            text: "Dank MiMiCheck habe ich €870 Wohngeld erhalten, von dem ich nicht wusste, dass mir das zusteht. Die App hat alles automatisch geprüft und den Antrag für mich ausgefüllt!",
            savings: "€870/Monat"
        },
        {
            name: "Michael K.",
            role: "Mieter in Berlin",
            avatar: "M",
            rating: 5,
            text: "Meine Nebenkostenabrechnung hatte 6 Fehler! Die KI-Analyse hat mir geholfen, €420 zurückzufordern. Der Widerspruchsbrief war in 2 Minuten fertig.",
            savings: "€420 zurückgefordert"
        },
        {
            name: "Ayşe T.",
            role: "Alleinerziehend",
            avatar: "A",
            rating: 5,
            text: "Als Alleinerziehende war ich überfordert mit all den Anträgen. Diese Plattform hat mir nicht nur Zeit gespart, sondern auch €1.200 mehr pro Jahr gebracht.",
            savings: "€1.200/Jahr"
        }
    ];

    const stats = [
        { value: "€3.6M+", label: "Rückforderungen erreicht", icon: <Euro className="w-6 h-6" /> },
        { value: "2.847+", label: "Zufriedene Nutzer", icon: <Users className="w-6 h-6" /> },
        { value: "97%", label: "Erfolgsquote", icon: <TrendingUp className="w-6 h-6" /> },
        { value: "4.9/5", label: "Bewertung", icon: <Star className="w-6 h-6" /> }
    ];

    return (
        <section className="py-20 lg:py-32 bg-white dark:bg-slate-900">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none text-sm font-bold">
                            ERFOLGSGESCHICHTEN
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 humanistic-serif">
                            Tausende sparen bereits – Sie auch?
                        </h2>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                        {stats.map((stat, index) => (
                            <Card key={index} className="border-none shadow-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 text-center p-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white mx-auto mb-4">
                                    {stat.icon}
                                </div>
                                <div className="text-3xl font-black text-slate-900 dark:text-white mb-2 humanistic-serif">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    {stat.label}
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Testimonials */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="border-none shadow-2xl bg-white dark:bg-slate-800 overflow-hidden hover:scale-105 transition-all duration-300">
                                <CardContent className="p-6">
                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>

                                    {/* Testimonial Text */}
                                    <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed italic">
                                        "{testimonial.text}"
                                    </p>

                                    {/* Savings Badge */}
                                    <Badge className="mb-4 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none font-bold">
                                        💰 {testimonial.savings}
                                    </Badge>

                                    {/* Author */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                            {testimonial.avatar}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900 dark:text-white">
                                                {testimonial.name}
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                {testimonial.role}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// PREMIUM PRICING SECTION
const PricingSection = ({ onCTAClick }) => {
    const plans = [
        {
            name: "Basis-Check",
            price: "Kostenlos",
            description: "Perfekt zum Ausprobieren",
            features: [
                "1x Förderprüfung (alle 3 Monate)",
                "1x Nebenkostenprüfung (alle 6 Monate)",
                "Basis KI-Assistent (5 Fragen/Tag)",
                "Ergebnisse nur anzeigen"
            ],
            cta: "Kostenlos starten",
            popular: false,
            color: "from-slate-500 to-slate-600"
        },
        {
            name: "Staatshilfen+",
            price: "€14.99",
            period: "/Monat",
            description: "Beste Wahl für die meisten Nutzer",
            features: [
                "Unbegrenzte Förderprüfungen",
                "Unbegrenzte Nebenkostenprüfungen",
                "Premium KI-Assistent",
                "PDF-Reports & Musterbriefe",
                "Automatische Antragsassistenz",
                "Widerspruchs-Generator"
            ],
            cta: "Jetzt upgraden",
            popular: true,
            color: "from-blue-500 to-purple-600"
        },
        {
            name: "Haushalt-Optimierer",
            price: "€29.99",
            period: "/Monat",
            description: "Für Familien und Power-User",
            features: [
                "Alle Features von Premium",
                "Familienmitglieder verwalten (bis 4)",
                "Rechtliche Erstberatung (1x/Monat)",
                "Steueroptimierungs-KI",
                "Persönlicher KI-Agent",
                "WhatsApp & Telefon-Support"
            ],
            cta: "Jetzt upgraden",
            popular: false,
            color: "from-purple-500 to-pink-600"
        }
    ];

    return (
        <section id="pricing" className="py-20 lg:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none text-sm font-bold">
                            PREISE
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 humanistic-serif">
                            Transparent. Fair. Ohne versteckte Kosten.
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                            Starten Sie kostenlos und upgraden Sie, wenn Sie mehr Funktionen brauchen. Jederzeit kündbar.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => (
                            <Card 
                                key={index} 
                                className={`border-none overflow-hidden ${
                                    plan.popular 
                                        ? 'shadow-3xl scale-105 ring-4 ring-blue-500/20' 
                                        : 'shadow-xl'
                                } bg-white dark:bg-slate-800 hover:scale-105 transition-all duration-300 relative`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-bold">
                                        ⭐ BELIEBTESTE WAHL
                                    </div>
                                )}
                                
                                <CardContent className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                                    {/* Plan Name */}
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                            {plan.name}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                                            {plan.description}
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black text-slate-900 dark:text-white humanistic-serif">
                                                {plan.price}
                                            </span>
                                            {plan.period && (
                                                <span className="text-slate-600 dark:text-slate-400">
                                                    {plan.period}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                <span className="text-slate-700 dark:text-slate-300 text-sm">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <Button 
                                        onClick={onCTAClick}
                                        className={`w-full py-6 text-lg font-bold rounded-xl transition-all duration-300 ${
                                            plan.popular
                                                ? `bg-gradient-to-r ${plan.color} text-white shadow-xl hover:shadow-2xl`
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                    >
                                        {plan.cta}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Money-Back Guarantee */}
                    <div className="mt-12 text-center">
                        <Badge className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 text-sm font-semibold">
                            <Shield className="w-4 h-4 mr-2 inline-block" />
                            30 Tage Geld-zurück-Garantie
                        </Badge>
                    </div>
                </div>
            </div>
        </section>
    );
};

// PREMIUM FINAL CTA SECTION
const FinalCTASection = ({ onCTAClick }) => {
    return (
        <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 humanistic-serif">
                        Bereit, Ihr Geld zurückzuholen?
                    </h2>
                    <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                        Über <strong>2.800 Nutzer</strong> sparen bereits durchschnittlich <strong>€1.247 pro Jahr</strong>. 
                        Starten Sie jetzt kostenlos und entdecken Sie, was Ihnen zusteht!
                    </p>

                    <Button 
                        onClick={onCTAClick}
                        className="group px-8 py-6 text-xl font-bold rounded-2xl bg-white text-blue-600 hover:bg-slate-50 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                    >
                        <span className="flex items-center gap-2">
                            Jetzt kostenlos starten
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Button>

                    <p className="mt-6 text-white/80 text-sm">
                        ✓ Keine Kreditkarte erforderlich  •  ✓ Jederzeit kündbar  •  ✓ DSGVO-konform
                    </p>
                </div>
            </div>
        </section>
    );
};

// MAIN LANDING PAGE COMPONENT
export default function LandingPage() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in
        User.me()
            .then(currentUser => {
                setUser(currentUser);
                // If user is logged in, redirect to dashboard
                navigate(createPageUrl('Dashboard'));
            })
            .catch(() => {
                // User not logged in, stay on landing page
                setUser(null);
            });
    }, [navigate]);

    const handleCTAClick = () => {
        if (user) {
            navigate(createPageUrl('Dashboard'));
        } else {
            User.login(); // Trigger base44 Google OAuth
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900">
            <HeroSection onCTAClick={handleCTAClick} />
            <ProblemSolutionSection />
            <FeaturesSection />
            <SocialProofSection />
            <PricingSection onCTAClick={handleCTAClick} />
            <FinalCTASection onCTAClick={handleCTAClick} />
        </div>
    );
}