import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '@/components/UserProfileContext.jsx';
import { supabase } from '@/api/supabaseClient';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AnalysisAnimation from "@/components/animations/AnalysisAnimation";
import SpotlightCard from "@/components/ui/SpotlightCard";
import {
    FileText,
    Euro,
    Baby,
    Home,
    GraduationCap,
    Heart,
    Search,
    ArrowRight,
    AlertCircle,
    ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CATEGORY_STYLES = {
    'social': { icon: Euro, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    'family': { icon: Baby, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
    'housing': { icon: Home, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    'education': { icon: GraduationCap, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    'retirement': { icon: Heart, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    'health': { icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
};

export default function Antraege() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { userProfile } = useUserProfile();
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadRecommendations();
    }, [userProfile, t]); // Reload when language changes

    const loadRecommendations = async () => {
        // Simulate loading delay for smoother UX
        await new Promise(resolve => setTimeout(resolve, 800));

        if (!userProfile) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.functions.invoke('analyze-eligibility', {
                body: { userProfile }
            });

            if (error) throw error;
            setRecommendations(data);
        } catch (err) {
            console.error('Fehler beim Laden der Empfehlungen:', err);
            console.log('⚠️ Edge Function nicht verfügbar. Verwende Demo-Daten.');

            // Robust Fallback Data with Translations
            setRecommendations({
                programs: [
                    {
                        id: 'wohngeld',
                        name: t('antraegePage.fallback.wohngeld.name'),
                        category: 'housing',
                        description: t('antraegePage.fallback.wohngeld.desc'),
                        confidence: 85,
                        estimatedAmount: '~150€',
                        processingTime: '3-6 ' + (t('months') || 'Monate'), // Simple fallback if months not defined globally
                        downloadUrl: 'https://www.bmas.de/SharedDocs/Downloads/DE/Formulare/wohngeldantrag.pdf',
                        requiredDocuments: ['Mietvertrag', 'Einkommensnachweise', 'Personalausweis']
                    },
                    {
                        id: 'kindergeld',
                        name: t('antraegePage.fallback.kindergeld.name'),
                        category: 'family',
                        description: t('antraegePage.fallback.kindergeld.desc'),
                        confidence: 90,
                        estimatedAmount: '~250€',
                        processingTime: '1-2 ' + (t('months') || 'Monate'),
                        downloadUrl: 'https://www.arbeitsagentur.de/datei/kindergeld_ba013095.pdf',
                        requiredDocuments: ['Geburtsurkunde', 'Steuer-ID']
                    },
                    {
                        id: 'buergergeld',
                        name: t('antraegePage.fallback.buergergeld.name'),
                        category: 'social',
                        description: t('antraegePage.fallback.buergergeld.desc'),
                        confidence: 75,
                        estimatedAmount: '~563€',
                        processingTime: '1-3 ' + (t('months') || 'Monate'),
                        downloadUrl: 'https://www.arbeitsagentur.de/datei/antrag-buergergeld_ba032632.pdf',
                        requiredDocuments: ['Kontoauszüge', 'Mietbescheinigung', 'Ausweis']
                    },
                    {
                        id: 'bafoeg',
                        name: t('antraegePage.fallback.bafoeg.name'),
                        category: 'education',
                        description: t('antraegePage.fallback.bafoeg.desc'),
                        confidence: 60,
                        estimatedAmount: '~450€',
                        processingTime: '2-4 ' + (t('months') || 'Monate'),
                        downloadUrl: 'https://www.bafög.de/de/antragstellung-302.php',
                        requiredDocuments: ['Immatrikulationsbescheinigung', 'Einkommensnachweise Eltern']
                    }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredPrograms = recommendations?.programs.filter(program => {
        const matchesCategory = selectedCategory === 'all' || program.category === selectedCategory;
        const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            program.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    }) || [];

    return (
        <div className="h-full w-full bg-transparent text-white relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 z-0">
                <AnalysisAnimation />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
                {/* Header */}
                <div className="mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight font-heading">
                            {t('antraegePage.title').split(' ')[0]} <span className="text-emerald-400">{t('antraegePage.title').split(' ').slice(1).join(' ')}</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            {t('antraegePage.subtitle')}
                        </p>
                    </motion.div>
                </div>

                {/* No Profile Warning */}
                {!loading && !userProfile && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl mx-auto mb-12"
                    >
                        <SpotlightCard className="p-8 text-center border-orange-500/30" spotlightColor="rgba(249, 115, 22, 0.15)">
                            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-2 text-white">{t('antraegePage.noProfile.title')}</h3>
                            <p className="text-slate-400 mb-6">
                                {t('antraegePage.noProfile.text')}
                            </p>
                            <Button
                                onClick={() => navigate('/onboarding')}
                                className="bg-orange-600 hover:bg-orange-500 text-white"
                            >
                                {t('antraegePage.noProfile.button')}
                                <ChevronRight className="ml-2 w-4 h-4" />
                            </Button>
                        </SpotlightCard>
                    </motion.div>
                )}

                {/* Search & Filter */}
                <div className="mb-12 space-y-6">
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder={t('antraegePage.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-6 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all backdrop-blur-sm"
                        />
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === 'all'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            {t('antraegePage.filter.all')}
                        </button>
                        {Object.keys(CATEGORY_STYLES).map(categoryId => (
                            <button
                                key={categoryId}
                                onClick={() => setSelectedCategory(categoryId)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === categoryId
                                    ? 'bg-white text-slate-900'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                    }`}
                            >
                                {t(`antraegePage.categories.${categoryId}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredPrograms.map((program, index) => {
                                const categoryStyle = CATEGORY_STYLES[program.category] || { icon: FileText, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
                                const Icon = categoryStyle.icon;

                                return (
                                    <motion.div
                                        key={program.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <SpotlightCard className="h-full flex flex-col p-6 group cursor-pointer border-white/10" spotlightColor="rgba(16, 185, 129, 0.15)">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 rounded-xl ${categoryStyle.bg} ${categoryStyle.color}`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <Badge variant="outline" className={`${categoryStyle.border} ${categoryStyle.color} bg-transparent`}>
                                                    {program.confidence}% {t('antraegePage.card.match')}
                                                </Badge>
                                            </div>

                                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                                                {program.name}
                                            </h3>
                                            <p className="text-slate-400 text-sm mb-6 flex-1 leading-relaxed">
                                                {program.description}
                                            </p>

                                            <div className="space-y-4 mt-auto">
                                                <div className="flex items-center justify-between text-sm border-t border-white/5 pt-4">
                                                    <span className="text-slate-500">{t('antraegePage.card.amount')}</span>
                                                    <span className="text-emerald-400 font-mono font-bold">{program.estimatedAmount}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-500">{t('antraegePage.card.duration')}</span>
                                                    <span className="text-white">{program.processingTime}</span>
                                                </div>

                                                <Button
                                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all mt-4"
                                                    onClick={() => navigate(`/pdf-autofill?form=${program.id}`)}
                                                >
                                                    {t('antraegePage.card.button')}
                                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </SpotlightCard>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
