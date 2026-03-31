import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CheckCircle,
  ChevronRight,
  FileText,
  DollarSign,
  Settings,
  Eye,
  Clock,
  Star,
  Loader2,
} from "lucide-react";

export default function CreateGig() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    deliveryDays: "3",
    imageUrl: "",
  });

  const createGigMutation = trpc.gigs.create.useMutation({
    onSuccess: (data) => {
      toast.success("✓ Gig erfolgreich erstellt!", {
        description: `Dein Gig "${formData.title}" wurde gespeichert.`,
        duration: 3000,
      });
      // Redirect nach 1.5s für visuelles Feedback
      setTimeout(() => {
        setLocation(`/seller-dashboard`);
      }, 1500);
    },
    onError: (error) => {
      toast.error("✗ Fehler beim Erstellen des Gigs", {
        description: error.message || "Bitte versuche es später erneut.",
        duration: 4000,
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-600 mb-4">Bitte melde dich an</p>
            <Button onClick={() => setLocation("/")}>Zur Startseite</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const steps = [
    { id: 1, title: "Grundlagen", icon: FileText },
    { id: 2, title: "Preisgestaltung", icon: DollarSign },
    { id: 3, title: "Details", icon: Settings },
  ];

  const categories = [
    "Design & Kreatives",
    "Programmierung & Tech",
    "Texte & Übersetzung",
    "Marketing & Social Media",
    "Video & Animation",
    "Musik & Audio",
    "Business & Beratung",
  ];

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.category;
      case 2:
        return formData.price && Number(formData.price) >= 10 && Number(formData.price) <= 250;
      case 3:
        return formData.deliveryDays;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    createGigMutation.mutate({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: Number(formData.price) * 100,
      deliveryDays: Number(formData.deliveryDays),
      imageUrl: formData.imageUrl || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <button onClick={() => setLocation("/seller-dashboard")} className="hover:text-blue-600">
            Verkäufer-Dashboard
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-900 font-medium">Neues Gig erstellen</span>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                        currentStep === step.id
                          ? "border-blue-600 bg-blue-600 text-white"
                          : isStepComplete(step.id)
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-slate-300 bg-white text-slate-400"
                      }`}
                    >
                      {isStepComplete(step.id) ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-6 w-6" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        currentStep === step.id
                          ? "text-blue-600"
                          : isStepComplete(step.id)
                          ? "text-green-600"
                          : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-4 ${
                        isStepComplete(step.id) ? "bg-green-600" : "bg-slate-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Grundlagen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">
                      Gig-Titel <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="z.B. Ich erstelle ein professionelles Logo für dein Startup"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      maxLength={80}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.title.length}/80 Zeichen
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">
                      Beschreibung <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Beschreibe dein Gig so detailliert wie möglich..."
                      rows={8}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Mindestens 20 Zeichen
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="category">
                      Kategorie <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wähle eine Kategorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setLocation("/seller-dashboard")}>
                      Abbrechen
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => setCurrentStep(2)}
                      disabled={!isStepComplete(1)}
                    >
                      Weiter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    Preisgestaltung
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="price">
                      Preis (€) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="150"
                      min="10"
                      max="250"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Micro-Gigs: 10€ - 250€
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Deine Einnahmen</h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="flex justify-between">
                        <span>Gig-Preis:</span>
                        <span className="font-semibold">{formData.price || "0"}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Flinkly-Gebühr (10%):</span>
                        <span className="font-semibold">
                          -{(Number(formData.price) * 0.1).toFixed(2)}€
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-base">
                        <span className="font-bold">Du erhältst:</span>
                        <span className="font-bold text-green-600">
                          {(Number(formData.price) * 0.9).toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Zurück
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => setCurrentStep(3)}
                      disabled={!isStepComplete(2)}
                    >
                      Weiter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="deliveryDays">
                      Lieferzeit (Tage) <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.deliveryDays}
                      onValueChange={(value) =>
                        setFormData({ ...formData, deliveryDays: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Tag (Express)</SelectItem>
                        <SelectItem value="2">2 Tage</SelectItem>
                        <SelectItem value="3">3 Tage</SelectItem>
                        <SelectItem value="5">5 Tage</SelectItem>
                        <SelectItem value="7">7 Tage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">Bild-URL (optional)</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Zurück
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleSubmit}
                      disabled={!isStepComplete(3) || createGigMutation.isPending}
                      size="lg"
                    >
                      {createGigMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wird erstellt...
                        </>
                      ) : (
                        "Gig veröffentlichen"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Eye className="h-4 w-4" />
                    Live-Vorschau
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="Gig preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  )}

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                      {formData.title || "Dein Gig-Titel"}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {formData.description || "Deine Beschreibung erscheint hier..."}
                    </p>
                  </div>

                  {formData.category && (
                    <Badge variant="outline">{formData.category}</Badge>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Preis</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formData.price || "0"}€
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>{formData.deliveryDays || "3"} Tage Lieferzeit</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span>Neu</span>
                    </div>
                  </div>

                  <Button className="w-full" disabled>
                    Jetzt buchen
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

