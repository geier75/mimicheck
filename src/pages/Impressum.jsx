import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Impressum() {
    const { t } = useTranslation();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">{t('impressumPage.title')}</h1>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                    {t('impressumPage.subtitle')}
                </p>
            </div>

            <Card className="border-none shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Building2 className="w-6 h-6 text-blue-600" />
                        {t('impressumPage.provider')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">{t('impressumPage.company')}</h3>
                            <p className="text-slate-600 dark:text-slate-300">
                                MiMi Tech Ai UG (haftungsbeschränkt)<br />
                                Vertreten durch: Michael Bemler (Geschäftsführer)<br />
                                Lindenplatz 2<br />
                                75378 Bad Liebenzell<br />
                                Deutschland
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {t('impressumPage.contact')}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300">
                                E-Mail: info@mimitechai.com<br />
                                Telefon: +49 1575 8805737<br />
                                Website: www.mimitechai.com
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-200/60">
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">{t('impressumPage.responsible')}</h3>
                            <p className="text-slate-600 dark:text-slate-300">
                                Michael Bemler<br />
                                Lindenplatz 2<br />
                                75378 Bad Liebenzell
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">{t('impressumPage.register')}</h3>
                            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
                                {t('impressumPage.registerText')}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
                <CardHeader>
                    <CardTitle>{t('impressumPage.disclaimer.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-2">{t('impressumPage.disclaimer.contentTitle')}</h4>
                        <p>
                            {t('impressumPage.disclaimer.content')}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-2">{t('impressumPage.disclaimer.legalTitle')}</h4>
                        <p>
                            {t('impressumPage.disclaimer.legal')}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}