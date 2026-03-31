import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Zap } from 'lucide-react';
import { User } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SubscriptionStatus({ showUpgradePrompt = true }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        User.me()
            .then(user => setUser(user))
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <Card className="border-none shadow-lg">
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </CardContent>
            </Card>
        );
    }

    if (!user) return null;

    const tierNames = {
        free: 'Basis-Check',
        premium: 'Staatshilfen+ Premium',
        pro: 'Haushalt-Optimierer Pro'
    };

    const tierName = tierNames[user.subscription_tier] || 'Basis-Check';
    const isFree = user.subscription_tier === 'free';

    return (
        <Card className="border-none shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6" />
                    Ihr Abonnement
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Aktueller Plan</p>
                        <Badge className="text-lg">{tierName}</Badge>
                    </div>
                </div>

                {isFree && showUpgradePrompt && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <Zap className="w-6 h-6 text-purple-600" />
                            <h4 className="font-bold text-purple-900 dark:text-purple-300">
                                Upgrade auf Premium
                            </h4>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-400 mb-4">
                            Unbegrenzte Prüfungen, PDF-Reports & Priority Support
                        </p>
                        <Link to={createPageUrl('Pricing')}>
                            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                                Ab €14.99/Monat upgraden
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}