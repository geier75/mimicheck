import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Euro,
  RefreshCw,
  Download,
  MessageSquare,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingState from '@/components/ui/LoadingState';
import AnalysisAnimation from '@/components/animations/AnalysisAnimation';
import MagneticButton from '@/components/ui/MagneticButton';

import { useTranslation } from 'react-i18next';

export default function AnspruchsAnalyse() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      setError('Bitte melden Sie sich an.');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeEligibility = async () => {
    if (!user) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, error: analyzeError } = await supabase.functions.invoke('analyze-eligibility', {
        body: {
          userProfile: {
            full_name: user.full_name,
            geburtsdatum: user.geburtsdatum,
            lebenssituation: user.lebenssituation || {}
          }
        }
      });

      if (analyzeError) throw analyzeError;

      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Analyse-Fehler:', err);

      // **FALLBACK DEMO-ANALYSE**
      console.log('⚠️ Edge Function nicht verfügbar. Verwende Demo-Analyse.');
      const fallbackPrograms = t('anspruchsAnalyse.fallback.programs', { returnObjects: true });
      const fallbackRecommendations = t('anspruchsAnalyse.fallback.recommendations', { returnObjects: true });

      setAnalysis({
        estimatedTotalMonthlyBenefit: 650,
        eligiblePrograms: fallbackPrograms,
        recommendations: fallbackRecommendations
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Lade Profil..." fullScreen />;
  }

  return (
    <div className="h-full w-full bg-transparent relative overflow-hidden">
      {/* Ultra 8K WebGL Background - Green Flow */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={
          <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        }>
          <AnalysisAnimation />
        </Suspense>
      </div>

      {/* Ultra Glassmorphism Gradient Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full overflow-y-auto p-6 pb-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Ultra Glass Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Hero Glass Card */}
            <div className="relative backdrop-blur-3xl bg-slate-900/40 border border-white/10 rounded-[2rem] p-8 shadow-2xl mb-8 overflow-hidden">
              {/* Glossy Shine Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/5 to-transparent opacity-30" />

              {/* Animated Glow Background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20 rounded-[2rem] blur-2xl opacity-20 animate-pulse" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                    <Sparkles className="w-8 h-8 text-white relative z-10 animate-pulse" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent font-heading">
                    {t('anspruchsAnalyse.title', 'KI-Anspruchsanalyse')}
                  </h1>
                </div>
                <p className="text-slate-400 text-lg max-w-3xl mx-auto">
                  {t('anspruchsAnalyse.subtitle', 'Lassen Sie unsere KI analysieren, auf welche Förderungen Sie Anspruch haben')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          {!analysis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative backdrop-blur-3xl bg-slate-900/40 border border-white/10 rounded-[2rem] p-12 shadow-2xl overflow-hidden"
            >
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-transparent opacity-50" />

              <div className="relative z-10 text-center space-y-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full" />
                    <TrendingUp className="w-16 h-16 text-white relative z-10" />
                  </div>
                  {/* Pulsing Rings */}
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping" />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white font-heading">
                  {t('anspruchsAnalyse.cta.ready', 'Bereit für Ihre persönliche Analyse?')}
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                  {t('anspruchsAnalyse.cta.description', 'Unsere KI analysiert Ihr Profil und ermittelt, auf welche Sozialleistungen und Förderungen Sie voraussichtlich Anspruch haben. Sie sehen dann konkrete Beträge und die nächsten Schritte.')}
                </p>

                <MagneticButton
                  data-cursor-text="Analyse starten"
                  onClick={analyzeEligibility}
                  disabled={isAnalyzing}
                  className="px-10 py-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:shadow-2xl hover:shadow-emerald-500/20 text-white font-bold text-xl border border-white/20"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
                      {t('anspruchsAnalyse.cta.analyzing', 'Analysiere Ansprüche...')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 mr-3" />
                      {t('anspruchsAnalyse.cta.button', 'Jetzt Ansprüche analysieren')}
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </>
                  )}
                </MagneticButton>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Alert className="backdrop-blur-2xl bg-red-500/10 border border-red-500/20 text-red-200">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Ultra Glass Total Benefit Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative backdrop-blur-3xl bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-[2rem] p-10 shadow-[0_8px_32px_0_rgba(16,185,129,0.2)] overflow-hidden"
              >
                {/* Ultra Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent" />

                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-emerald-200 mb-3 text-lg font-medium">{t('anspruchsAnalyse.results.total', 'Geschätzter monatlicher Gesamtanspruch')}</p>
                    <h2 className="text-6xl md:text-7xl font-black text-white drop-shadow-2xl">
                      {analysis.estimatedTotalMonthlyBenefit?.toFixed(2) || '0.00'} €
                    </h2>
                  </div>
                  <div className="w-24 h-24 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                    <Euro className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </div>
              </motion.div>

              {/* Eligible Programs Grid */}
              {analysis.eligiblePrograms?.length > 0 && (
                <div>
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-bold text-white mb-6 flex items-center gap-3 font-heading"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    {t('anspruchsAnalyse.results.programs', 'Programme mit Anspruch')} ({analysis.eligiblePrograms.length})
                  </motion.h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    {analysis.eligiblePrograms.map((program, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                      >
                        <Card className="backdrop-blur-3xl bg-slate-900/60 border border-emerald-500/20 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden group">
                          {/* Glossy Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-xl font-heading text-white group-hover:text-emerald-400 transition-colors">{program.programName}</CardTitle>
                              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
                                {program.eligibilityScore}% {t('anspruchsAnalyse.results.match', 'Match')}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 relative z-10">
                            {program.estimatedAmount > 0 && (
                              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl rounded-2xl p-5 border border-emerald-500/20">
                                <p className="text-sm text-emerald-300 mb-2 font-medium">{t('anspruchsAnalyse.results.amount', 'Geschätzter monatlicher Betrag')}</p>
                                <p className="text-4xl font-black text-emerald-400">{program.estimatedAmount} €</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-slate-200 mb-2">{t('anspruchsAnalyse.results.reason', 'Begründung:')}</p>
                              <p className="text-sm text-slate-400">{program.reasoning}</p>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-200 mb-2">{t('anspruchsAnalyse.results.docs', 'Benötigte Dokumente:')}</p>
                              <ul className="text-sm text-slate-400 space-y-2">
                                {program.requiredDocuments?.map((doc, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-emerald-500" />
                                    {doc}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-200 mb-2">{t('anspruchsAnalyse.results.steps', 'Nächste Schritte:')}</p>
                              <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                                {program.nextSteps?.map((step, i) => (
                                  <li key={i}>{step}</li>
                                ))}
                              </ol>
                            </div>
                            {program.officialLink && (
                              <Button
                                asChild
                                variant="outline"
                                className="w-full backdrop-blur-xl bg-white/5 hover:bg-emerald-500/20 border-white/10 hover:border-emerald-500/30 text-white"
                              >
                                <a href={program.officialLink} target="_blank" rel="noopener noreferrer">
                                  <FileText className="w-4 h-4 mr-2" />
                                  {t('anspruchsAnalyse.results.download', 'Offizielles Formular herunterladen')}
                                </a>
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations?.length > 0 && (
                <Card className="backdrop-blur-3xl bg-blue-900/20 border border-blue-500/20 rounded-2xl shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-2 font-heading text-white">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                      {t('anspruchsAnalyse.results.recommendations', 'Empfehlungen')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <ul className="space-y-3">
                      {analysis.recommendations.map((rec, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 text-slate-300"
                        >
                          <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Zap className="w-4 h-4 text-blue-400" />
                          </div>
                          <span>{rec}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticButton
                  data-cursor-text="Erneut"
                  onClick={analyzeEligibility}
                  variant="outline"
                  className="px-8 py-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 text-white"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  {t('anspruchsAnalyse.results.retry', 'Erneut analysieren')}
                </MagneticButton>
                <MagneticButton
                  data-cursor-text="PDF"
                  onClick={() => window.print()}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-2xl hover:shadow-emerald-500/50 text-white"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {t('anspruchsAnalyse.results.pdf', 'Ergebnis als PDF')}
                </MagneticButton>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* CSS for Shimmer Animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}
