import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Phone, MapPin, Send, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SpotlightCard from '@/components/ui/SpotlightCard';
import DashboardAnimation from '@/components/animations/DashboardAnimation'; // Reuse subtle animation
import { useTranslation } from 'react-i18next';

export default function ContactPage() {
  const { t } = useTranslation();
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSent(true);
  };

  return (
    <div className="h-full w-full bg-transparent text-white relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0 opacity-30">
        <DashboardAnimation />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight font-heading">
            {t('contactPage.title').split(' & ')[0]} & <span className="text-blue-400">{t('contactPage.title').split(' & ')[1]}</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {t('contactPage.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <SpotlightCard className="p-8 border-blue-500/20" spotlightColor="rgba(59, 130, 246, 0.15)">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{t('contactPage.liveChat.title')}</h3>
                  <p className="text-slate-400 mb-4">
                    {t('contactPage.liveChat.desc')}
                  </p>
                  <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                    {t('contactPage.liveChat.button')} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-8 border-emerald-500/20" spotlightColor="rgba(16, 185, 129, 0.15)">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{t('contactPage.contact.title')}</h3>
                  <p className="text-slate-400 mb-1">info@mimitechai.com</p>
                  <p className="text-slate-400 mb-1">+49 1575 8805737</p>
                  <p className="text-slate-500 text-sm">{t('contactPage.contact.response')}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-8 border-purple-500/20" spotlightColor="rgba(168, 85, 247, 0.15)">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{t('contactPage.location.title')}</h3>
                  <p className="text-slate-400">
                    Lindenplatz 2<br />
                    75378 Bad Liebenzell<br />
                    {t('contactPage.location.country')}
                  </p>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SpotlightCard className="h-full p-8 border-white/10" spotlightColor="rgba(255, 255, 255, 0.1)">
              {isSent ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t('contactPage.form.successTitle')}</h3>
                  <p className="text-slate-400 mb-8">
                    {t('contactPage.form.successText')}
                  </p>
                  <Button onClick={() => setIsSent(false)} variant="outline">
                    {t('contactPage.form.newMsg')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-2xl font-bold text-white mb-6">{t('contactPage.form.title')}</h3>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">{t('contactPage.form.name')}</label>
                    <Input
                      required
                      placeholder={t('contactPage.form.namePlaceholder')}
                      className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 transition-colors"
                      value={formState.name}
                      onChange={e => setFormState({ ...formState, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">{t('contactPage.form.email')}</label>
                    <Input
                      required
                      type="email"
                      placeholder={t('contactPage.form.emailPlaceholder')}
                      className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 transition-colors"
                      value={formState.email}
                      onChange={e => setFormState({ ...formState, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">{t('contactPage.form.message')}</label>
                    <Textarea
                      required
                      placeholder={t('contactPage.form.messagePlaceholder')}
                      className="min-h-[150px] bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 transition-colors"
                      value={formState.message}
                      onChange={e => setFormState({ ...formState, message: e.target.value })}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('contactPage.form.submitting') : (
                      <>
                        {t('contactPage.form.submit')} <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
