import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, UserCheck, ShieldOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AGB() {
    const { t } = useTranslation();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">{t('agbPage.title')}</h1>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                    {t('agbPage.subtitle')}
                </p>
            </div>

            <Card className="border-none shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                        {t('agbPage.scope.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-600 dark:text-slate-300 space-y-2">
                    <p>{t('agbPage.scope.content1')}</p>
                    <p>{t('agbPage.scope.content2')}</p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <UserCheck className="w-6 h-6 text-green-600" />
                        {t('agbPage.duties.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-600 dark:text-slate-300 space-y-2">
                    <p>{t('agbPage.duties.content1')}</p>
                    <p>{t('agbPage.duties.content2')}</p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <ShieldOff className="w-6 h-6 text-red-600" />
                        {t('agbPage.liability.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-600 dark:text-slate-300 space-y-2">
                    <p>{t('agbPage.liability.content1')}</p>
                    <p>{t('agbPage.liability.content2')}</p>
                </CardContent>
            </Card>
        </div>
    );
}