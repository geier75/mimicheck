import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Database, Bot, Cookie } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Datenschutz() {
    const { t } = useTranslation();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">{t('datenschutzPage.title')}</h1>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                    {t('datenschutzPage.subtitle')}
                </p>
            </div>

            <Card className="border-none shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-green-600" />
                        {t('datenschutzPage.security.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600 dark:text-slate-300">
                        {t('datenschutzPage.security.text')}
                    </p>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg">
                            <Database className="w-5 h-5 text-blue-600" />
                            {t('datenschutzPage.collection.title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 dark:text-slate-300 space-y-3">
                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-white">{t('datenschutzPage.collection.google.title')}</h4>
                            <p>{t('datenschutzPage.collection.google.text')}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-white">{t('datenschutzPage.collection.profile.title')}</h4>
                            <p>{t('datenschutzPage.collection.profile.text')}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-white">{t('datenschutzPage.collection.docs.title')}</h4>
                            <p>{t('datenschutzPage.collection.docs.text')}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg">
                            <Bot className="w-5 h-5 text-purple-600" />
                            {t('datenschutzPage.ai.title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 dark:text-slate-300 space-y-3">
                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-white">{t('datenschutzPage.ai.purpose.title')}</h4>
                            <p>{t('datenschutzPage.ai.purpose.text')}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-white">{t('datenschutzPage.ai.anon.title')}</h4>
                            <p>{t('datenschutzPage.ai.anon.text')}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-white">{t('datenschutzPage.ai.noShare.title')}</h4>
                            <p>{t('datenschutzPage.ai.noShare.text')}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl">
                <CardHeader>
                    <CardTitle>{t('datenschutzPage.rights.title')}</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6 text-sm">
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-2">{t('datenschutzPage.rights.info.title')}</h4>
                        <p className="text-slate-600 dark:text-slate-300">
                            {t('datenschutzPage.rights.info.text')}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-2">{t('datenschutzPage.rights.delete.title')}</h4>
                        <p className="text-slate-600 dark:text-slate-300">
                            {t('datenschutzPage.rights.delete.text')}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-2">{t('datenschutzPage.rights.revoke.title')}</h4>
                        <p className="text-slate-600 dark:text-slate-300">
                            {t('datenschutzPage.rights.revoke.text')}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardContent className="p-6">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">{t('datenschutzPage.contact.title')}</h3>
                    <p className="text-slate-600 dark:text-slate-300">
                        {t('datenschutzPage.contact.text')} <br />
                        <strong>datenschutz@staatshilfen.ai</strong>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}