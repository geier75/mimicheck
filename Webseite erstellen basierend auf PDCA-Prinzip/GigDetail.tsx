import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Star,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Shield,
  MessageSquare,
  ChevronRight,
  Package,
  X,
} from "lucide-react";
import { useState } from "react";

export default function GigDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [showBriefingPreview, setShowBriefingPreview] = useState(false);

  const { data: gig, isLoading } = trpc.gigs.getById.useQuery({ id: id! });
  const { data: reviews } = trpc.reviews.getGigReviews.useQuery({ gigId: id! });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-600 mb-4">Gig nicht gefunden</p>
            <Button onClick={() => setLocation("/marketplace")}>
              Zurück zum Marktplatz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const deliverables = [
    "3 Design-Entwürfe",
    "Vektorformat (AI, EPS, SVG)",
    "Quelldateien",
    "Unbegrenzte Revisionen",
  ];

  const notIncluded = [
    "Visitenkarten-Design",
    "Social Media Assets",
    "Markenrichtlinien",
    "3D-Mockups",
  ];

  const metrics = {
    onTimeRate: 94,
    firstPassRate: 87,
    disputeRate: 3,
  };

  const getMetricVariant = (value: number, type: "rate" | "dispute") => {
    if (type === "dispute") {
      if (value < 5) return { color: "text-green-600 bg-green-50", label: "Sehr gut" };
      if (value < 10) return { color: "text-amber-600 bg-amber-50", label: "Gut" };
      return { color: "text-red-600 bg-red-50", label: "Achtung" };
    }
    if (value >= 90) return { color: "text-green-600 bg-green-50", label: "Exzellent" };
    if (value >= 75) return { color: "text-amber-600 bg-amber-50", label: "Gut" };
    return { color: "text-red-600 bg-red-50", label: "Verbesserungswürdig" };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <button onClick={() => setLocation("/marketplace")} className="hover:text-blue-600">
            Marktplatz
          </button>
          <ChevronRight className="h-4 w-4" />
          <button onClick={() => setLocation(`/marketplace?category=${gig.category}`)} className="hover:text-blue-600">
            {gig.category}
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-900 font-medium truncate">{gig.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <span className="text-6xl font-bold text-blue-600/20">
                  {gig.title.charAt(0)}
                </span>
              </div>
            </Card>

            {/* Title & Price (Mobile) */}
            <div className="lg:hidden">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{gig.title}</h1>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-600" />
                  <span className="text-slate-900 font-semibold">{gig.deliveryDays} Tage Lieferzeit</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">{Number(gig.price)}€</div>
              </div>
            </div>

            {/* Trust Metrics - NOW AT TOP */}
            <Card className="border-2 border-green-200 bg-green-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Shield className="h-5 w-5 text-green-600" />
                  Vertrauens-Metriken
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${getMetricVariant(metrics.onTimeRate, "rate").color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-semibold">On-time Rate</span>
                    </div>
                    <p className="text-3xl font-bold mb-1">{metrics.onTimeRate}%</p>
                    <p className="text-sm opacity-75">{getMetricVariant(metrics.onTimeRate, "rate").label}</p>
                  </div>

                  <div className={`p-4 rounded-lg ${getMetricVariant(metrics.firstPassRate, "rate").color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">First-Pass Rate</span>
                    </div>
                    <p className="text-3xl font-bold mb-1">{metrics.firstPassRate}%</p>
                    <p className="text-sm opacity-75">{getMetricVariant(metrics.firstPassRate, "rate").label}</p>
                  </div>

                  <div className={`p-4 rounded-lg ${getMetricVariant(metrics.disputeRate, "dispute").color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-semibold">Dispute Rate</span>
                    </div>
                    <p className="text-3xl font-bold mb-1">{metrics.disputeRate}%</p>
                    <p className="text-sm opacity-75">{getMetricVariant(metrics.disputeRate, "dispute").label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Beschreibung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-line">{gig.description}</p>
              </CardContent>
            </Card>

            {/* What You Get */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  Was du bekommst
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {deliverables.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Not Included */}
            <Card className="border-amber-200 bg-amber-50/50 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <X className="h-5 w-5 text-amber-600" />
                  Nicht enthalten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {notIncluded.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <X className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-amber-900">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Briefing Preview */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Briefing-Felder (Vorschau)</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowBriefingPreview(!showBriefingPreview)}
                >
                  {showBriefingPreview ? "Ausblenden" : "Anzeigen"}
                </Button>
                {showBriefingPreview && (
                  <div className="mt-4 space-y-3 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">Projektname *</p>
                      <p className="text-sm text-slate-600">z.B. "Startup Logo für Tech-Firma"</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">Beschreibung *</p>
                      <p className="text-sm text-slate-600">Detaillierte Projektbeschreibung</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">Zielgruppe</p>
                      <p className="text-sm text-slate-600">Wer ist deine Zielgruppe?</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">Farbpräferenzen</p>
                      <p className="text-sm text-slate-600">Bevorzugte Farben oder Farbschema</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">Referenzen</p>
                      <p className="text-sm text-slate-600">Datei-Upload (optional)</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Bewertungen</span>
                  {gig.averageRating && (
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <span className="text-2xl font-bold">{Number(gig.averageRating).toFixed(1)}</span>
                      <span className="text-slate-600">({gig.completedOrders || 0})</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-slate-200 pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-slate-600">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString("de-DE") : ""}
                          </span>
                        </div>
                        <p className="text-slate-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-4">Noch keine Bewertungen</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar (Sticky on Desktop) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Order Card */}
              <Card className="border-2 border-blue-600">
                <CardContent className="pt-6 space-y-4">
                  {/* Desktop Title & Price */}
                  <div className="hidden lg:block">
                    <h1 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2">
                      {gig.title}
                    </h1>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-bold text-blue-600">
                        {Number(gig.price)}€
                      </span>
                      <span className="text-slate-600">Fixpreis</span>
                    </div>
                  </div>

                  {/* Delivery */}
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="h-5 w-5" />
                    <span className="font-semibold">{gig.deliveryDays} Tage Lieferzeit</span>
                  </div>

                  {/* Revisions */}
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle className="h-5 w-5" />
                    <span>Revisionen inklusive</span>
                  </div>

                  <Separator />

                  {/* CTAs */}
                  <Button
                    size="lg"
                    className="w-full text-lg h-14"
                    onClick={() => setLocation(`/checkout/${gig.id}`)}
                  >
                    In 3 Klicks beauftragen
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => setLocation("/messages")}
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Frage stellen
                  </Button>

                  {/* DSGVO Notice */}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-blue-900 mb-1">
                          DSGVO-konform
                        </p>
                        <p className="text-xs text-blue-800">
                          Bei personenbezogenen Daten wird automatisch eine AVV erstellt.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Über den Verkäufer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                      V
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Verkäufer</p>
                      <Badge className="bg-blue-600 text-white text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verifiziert
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Abgeschlossene Aufträge</span>
                      <span className="font-semibold">{gig.completedOrders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Durchschn. Bewertung</span>
                      <span className="font-semibold">
                        {gig.averageRating ? Number(gig.averageRating).toFixed(1) : "N/A"} ⭐
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-600">Fixpreis</p>
            <p className="text-2xl font-bold text-blue-600">{Number(gig.price)}€</p>
          </div>
          <Button
            size="lg"
            className="flex-1"
            onClick={() => setLocation(`/checkout/${gig.id}`)}
          >
            Jetzt beauftragen
          </Button>
        </div>
      </div>
    </div>
  );
}

