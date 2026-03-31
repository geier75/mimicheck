import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  cta: string;
  action?: () => void;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Willkommen bei Flinkly! 👋",
    description: "Der Marktplatz für schnelle, kreative & digitale Mikrodienstleistungen in der DACH-Region.",
    icon: "🚀",
    cta: "Weiter",
  },
  {
    id: 2,
    title: "Gigs durchsuchen",
    description: "Finde digitale Dienstleistungen von talentierten Freelancern. Nutze Filter nach Kategorie, Preis & Bewertung.",
    icon: "🔍",
    cta: "Zum Marketplace",
  },
  {
    id: 3,
    title: "Sicher beauftragen",
    description: "Zahle mit Klarna, SEPA oder Kreditkarte. Dein Geld ist geschützt durch unser Escrow-System bis zur Abnahme.",
    icon: "🔒",
    cta: "Zum Checkout",
  },
  {
    id: 4,
    title: "Gigs anbieten",
    description: "Du hast Skills? Verdiene mit Flinkly! Erstelle dein erstes Gig und erreiche Tausende Kunden.",
    icon: "⭐",
    cta: "Gig erstellen",
  },
];

interface OnboardingProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has already seen onboarding
    const hasSeenOnboarding = localStorage.getItem("flinkly_onboarding_seen");
    if (hasSeenOnboarding) {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) return null;

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("flinkly_onboarding_seen", "true");
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem("flinkly_onboarding_seen", "true");
    setIsVisible(false);
    onSkip?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex-1">
            <CardTitle className="text-2xl">{step.icon}</CardTitle>
          </div>
          <button
            onClick={handleSkip}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {step.title}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Step Counter */}
          <div className="text-sm text-slate-500 text-center">
            Schritt {currentStep + 1} von {onboardingSteps.length}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>

            <Button
              onClick={handleNext}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLastStep ? "Fertig" : "Weiter"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Skip Link */}
          <button
            onClick={handleSkip}
            className="w-full text-center text-sm text-slate-500 hover:text-slate-700 transition"
          >
            Überspringen
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

