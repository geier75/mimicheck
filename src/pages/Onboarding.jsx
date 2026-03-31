import React, { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useUserProfile } from '@/components/UserProfileContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, ArrowRight, ArrowLeft, User, Home, Shield } from 'lucide-react';
import Scene3D from '@/components/3d/Scene3D';
import { useTranslation, Trans } from 'react-i18next';

export default function Onboarding() {
  const { t } = useTranslation();
  const { updateUserProfile, isLoading: profileLoading } = useUserProfile();
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const titleRef = useRef(null);

  // Step 1 fields
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [geburtsdatum, setGeburtsdatum] = useState('');

  // Step 2 fields
  const [wohnart, setWohnart] = useState('');

  // Step 3 fields
  const [zustimmung, setZustimmung] = useState(false);

  const totalSteps = 3;

  const step1RequiredCount = useMemo(() => {
    let c = 0;
    if (vorname.trim()) c++;
    if (nachname.trim()) c++;
    if (geburtsdatum.trim()) c++;
    return c;
  }, [vorname, nachname, geburtsdatum]);

  const canNext = useMemo(() => {
    if (step === 1) return step1RequiredCount === 3;
    if (step === 2) return !!wohnart;
    if (step === 3) return !!zustimmung;
    return false;
  }, [step, step1RequiredCount, wohnart, zustimmung]);

  const selectWohnartRef = useRef(null);

  useEffect(() => {
    if (step === 2 && selectWohnartRef.current) {
      selectWohnartRef.current.focus();
    }
  }, [step]);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  async function handleNext() {
    try {
      setError(null);
      if (step === 1) {
        await updateUserProfile({
          full_name: `${vorname} ${nachname}`.trim(),
          geburtsdatum,
        });
        setStep(2);
        return;
      }
      if (step === 2) {
        await updateUserProfile({ wohnart });
        setStep(3);
        return;
      }
      if (step === 3) {
        await updateUserProfile({
          full_name: `${vorname} ${nachname}`.trim(),
          geburtsdatum,
          wohnart,
          zustimmung,
          profile_completeness: 100,
          onboarding_completed_at: new Date().toISOString(),
        });
        window.location.assign('/Dashboard');
        return;
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err.message || t('onboardingPage.error'));
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground font-medium">{t('onboardingPage.loading')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-background to-muted" />}>
          <Scene3D />
        </Suspense>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full max-w-4xl px-4 py-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6 text-white" data-testid="premium-icon" />
            </div>
            <h1 ref={titleRef} tabIndex={-1} className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-teal-500 to-emerald-400 bg-clip-text text-transparent font-heading">
              {t('onboardingPage.welcome')}
            </h1>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-3 mb-4" role="progressbar" aria-valuenow={step} aria-valuemin="1" aria-valuemax="3">
            {[1, 2, 3].map((s) => (
              <motion.div
                key={s}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: s * 0.1 }}
                className="flex items-center gap-2"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${s < step ? 'bg-primary text-primary-foreground' :
                  s === step ? 'bg-gradient-to-br from-primary to-teal-600 text-white ring-4 ring-primary/20' :
                    'bg-muted text-muted-foreground'
                  }`}>
                  {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-1 rounded-full ${s < step ? 'bg-primary' : 'bg-muted'
                    }`} />
                )}
              </motion.div>
            ))}
          </div>
          <p className="text-muted-foreground" data-testid="progress-steps">
            {t('onboardingPage.step', { current: step, total: totalSteps })}
          </p>
        </motion.header>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-destructive/10 border-2 border-destructive/20 text-destructive px-6 py-4 rounded-2xl shadow-lg backdrop-blur-md"
            >
              <p className="font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.section
              key="step-1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-card/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden group"
            >
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground font-heading">{t('onboardingPage.steps.basics.title')}</h2>
              </div>
              <div className="grid gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="vorname" className="text-sm font-semibold text-muted-foreground">
                    {t('onboardingPage.steps.basics.firstName')}
                  </label>
                  <input
                    id="vorname"
                    data-testid="input-vorname"
                    type="text"
                    value={vorname}
                    onChange={(e) => setVorname(e.target.value)}
                    className="border-2 border-border rounded-xl px-4 py-3 bg-background/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground placeholder:text-muted-foreground/50"
                    placeholder={t('onboardingPage.steps.basics.placeholderName')}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="nachname" className="text-sm font-semibold text-muted-foreground">
                    {t('onboardingPage.steps.basics.lastName')}
                  </label>
                  <input
                    id="nachname"
                    data-testid="input-nachname"
                    type="text"
                    value={nachname}
                    onChange={(e) => setNachname(e.target.value)}
                    className="border-2 border-border rounded-xl px-4 py-3 bg-background/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground placeholder:text-muted-foreground/50"
                    placeholder={t('onboardingPage.steps.basics.placeholderLastName')}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="geburtsdatum" className="text-sm font-semibold text-muted-foreground">
                    {t('onboardingPage.steps.basics.birthDate')}
                  </label>
                  <input
                    id="geburtsdatum"
                    data-testid="input-geburtsdatum"
                    type="date"
                    value={geburtsdatum}
                    onChange={(e) => setGeburtsdatum(e.target.value)}
                    className="border-2 border-border rounded-xl px-4 py-3 bg-background/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground"
                  />
                </div>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(step1RequiredCount / 3) * 100}%` }}
                className="h-2 bg-gradient-to-r from-primary to-teal-500 rounded-full mt-6"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {t('onboardingPage.steps.basics.progress', { count: step1RequiredCount })}
              </p>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section
              key="step-2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-card/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden group"
            >
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground font-heading">{t('onboardingPage.steps.living.title')}</h2>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="wohnart" className="text-sm font-semibold text-muted-foreground">
                  {t('onboardingPage.steps.living.type')}
                </label>
                <select
                  id="wohnart"
                  data-testid="select-wohnart"
                  ref={selectWohnartRef}
                  value={wohnart}
                  onChange={(e) => setWohnart(e.target.value)}
                  className="border-2 border-border rounded-xl px-4 py-3 bg-background/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground"
                >
                  <option value="">{t('onboardingPage.steps.living.select')}</option>
                  <option value="miete">{t('onboardingPage.steps.living.rent')}</option>
                  <option value="eigentum">{t('onboardingPage.steps.living.own')}</option>
                </select>
              </div>
            </motion.section>
          )}

          {step === 3 && (
            <motion.section
              key="step-3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-card/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden group"
            >
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground font-heading">{t('onboardingPage.steps.consent.title')}</h2>
              </div>
              <label className="flex items-start gap-4 p-4 border-2 border-border rounded-xl hover:border-primary transition-all cursor-pointer group bg-background/50">
                <input
                  type="checkbox"
                  data-testid="checkbox-datenschutz"
                  checked={zustimmung}
                  onChange={(e) => setZustimmung(e.target.checked)}
                  className="mt-1 w-5 h-5 text-primary rounded focus:ring-primary"
                />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  <Trans i18nKey="onboardingPage.steps.consent.text">
                    Ich akzeptiere die <a href="/datenschutz" className="text-primary hover:underline">Datenschutzbedingungen</a> und stimme der Verarbeitung meiner Daten gemäß DSGVO zu.
                  </Trans>
                </span>
              </label>
            </motion.section>
          )}
        </AnimatePresence>

        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between gap-4 mt-8"
        >
          {step > 1 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              data-testid="btn-prev"
              data-cursor-text={t('onboardingPage.buttons.back')}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="px-6 py-3 rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm text-foreground font-semibold flex items-center gap-2 hover:border-primary transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('onboardingPage.buttons.back')}
            </motion.button>
          ) : (
            <div />
          )}
          <motion.button
            whileHover={{ scale: canNext ? 1.02 : 1 }}
            whileTap={{ scale: canNext ? 0.98 : 1 }}
            type="button"
            data-testid="btn-next"
            data-cursor-text={step === 3 ? t('onboardingPage.buttons.finish') : t('onboardingPage.buttons.next')}
            onClick={handleNext}
            disabled={!canNext}
            className={`px-8 py-4 rounded-2xl font-semibold text-white flex items-center gap-2 transition-all shadow-lg ${canNext
              ? 'bg-gradient-to-r from-primary to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-2xl hover:shadow-primary/50'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
          >
            {step === 3 ? t('onboardingPage.buttons.finish') : t('onboardingPage.buttons.next')}
            {step < 3 && <ArrowRight className="w-5 h-5" />}
            {step === 3 && <CheckCircle2 className="w-5 h-5" />}
          </motion.button>
        </motion.footer>
      </div>
    </div>
  );
}
