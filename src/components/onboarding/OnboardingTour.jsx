import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
    X, 
    ChevronRight, 
    User as UserIcon, 
    Radar, 
    FileText, 
    Sparkles,
    Target
} from "lucide-react";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const onboardingSteps = [
    {
        id: 1,
        title: "Willkommen bei MiMiCheck!",
        content: "Entdecken Sie alle staatlichen Leistungen, die Ihnen zustehen. Wir analysieren Ihre persönliche Situation und finden automatisch passende Förderungen für Sie.",
        icon: <Sparkles className="w-12 h-12 text-blue-600" />,
        bgGradient: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
    },
    {
        id: 2,
        title: "Ihre Lebenslage ist der Schlüssel",
        content: "Je genauer Sie Ihre persönlichen Daten eingeben (Einkommen, Familiensituation, Wohnsituation), desto präziser können wir Ihre Ansprüche berechnen.",
        icon: <UserIcon className="w-12 h-12 text-purple-600" />,
        bgGradient: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
    },
    {
        id: 3,
        title: "Zwei mächtige Werkzeuge",
        content: "Nutzen Sie unseren Förder-Prüfradar für eine Rundum-Analyse aller Sozialleistungen und laden Sie Nebenkostenabrechnungen zur rechtlichen Prüfung hoch.",
        icon: <div className="flex gap-2"><Radar className="w-6 h-6 text-green-600" /><FileText className="w-6 h-6 text-amber-600" /></div>,
        bgGradient: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
    },
    {
        id: 4,
        title: "Starten Sie jetzt!",
        content: "Vervollständigen Sie Ihr Profil in nur 2 Minuten und erhalten Sie sofort personalisierte Empfehlungen. Hunderte Euro an Förderungen warten auf Sie!",
        icon: <Target className="w-12 h-12 text-amber-600" />,
        bgGradient: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
        isLast: true
    }
];

export default function OnboardingTour({ isOpen, onComplete, onSkip }) {
    const [currentStep, setCurrentStep] = useState(1);
    const navigate = useNavigate();

    const handleNext = () => {
        if (currentStep < onboardingSteps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleComplete = async () => {
        try {
            // Mark onboarding as completed in user profile
            await User.updateMyUserData({ onboarding_completed: true });
            onComplete();
            // Navigate to Lebenslagen page
            navigate(createPageUrl("Lebenslagen"));
        } catch (error) {
            console.error("Failed to complete onboarding:", error);
        }
    };

    const handleSkip = async () => {
        try {
            // Mark onboarding as completed even when skipped
            await User.updateMyUserData({ onboarding_completed: true });
            onSkip();
        } catch (error) {
            console.error("Failed to skip onboarding:", error);
        }
    };

    const currentStepData = onboardingSteps.find(step => step.id === currentStep);
    
    return (
        <Dialog open={isOpen} onOpenChange={handleSkip}>
            <DialogContent className="max-w-2xl border-none shadow-2xl p-0 gap-0 bg-transparent">
                {/* Header with close button */}
                <div className="flex justify-between items-center p-4 lg:p-6 border-b border-white/10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            {onboardingSteps.map((step) => (
                                <div
                                    key={step.id}
                                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                        step.id <= currentStep ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            Schritt {currentStep} von {onboardingSteps.length}
                        </span>
                    </div>
                    <button
                        onClick={handleSkip}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main content */}
                <Card className={`border-none shadow-none bg-gradient-to-br ${currentStepData?.bgGradient} rounded-t-none`}>
                    <CardContent className="p-6 lg:p-8 text-center">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 lg:w-20 h-16 lg:h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                                {currentStepData?.icon}
                            </div>
                        </div>

                        {/* Title & Content */}
                        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-4">
                            {currentStepData?.title}
                        </h2>
                        <p className="text-base lg:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6 lg:mb-8 max-w-lg mx-auto">
                            {currentStepData?.content}
                        </p>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
                            {!currentStepData?.isLast ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handleSkip}
                                        className="px-4 lg:px-6 order-2 sm:order-1"
                                    >
                                        Tour überspringen
                                    </Button>
                                    <Button
                                        onClick={handleNext}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 lg:px-8 order-1 sm:order-2"
                                    >
                                        Weiter
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handleSkip}
                                        className="px-4 lg:px-6 order-2 sm:order-1"
                                    >
                                        Vielleicht später
                                    </Button>
                                    <Button
                                        onClick={handleComplete}
                                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 px-6 lg:px-8 py-3 text-base lg:text-lg font-semibold order-1 sm:order-2"
                                    >
                                        Jetzt Profil vervollständigen!
                                        <Target className="w-4 lg:w-5 h-4 lg:h-5 ml-2" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
}