import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MessageSquare, CreditCard, CheckCircle, Star, Shield } from "lucide-react";
import { Link } from "wouter";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">← Zurück</Button>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Wie funktioniert Flinkly?</h1>
          <p className="text-lg text-slate-600">
            In wenigen Schritten zum perfekten Gig
          </p>
        </div>
      </div>

      {/* For Buyers */}
      <div className="container mx-auto px-4 py-16">
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Für Käufer</h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Finde schnell und einfach die perfekte digitale Dienstleistung
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>1. Suchen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Durchsuche unseren Marketplace nach der passenden Dienstleistung oder nutze die Filter
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>2. Kontaktieren</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Schreibe dem Anbieter eine Nachricht mit deinen Anforderungen
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>3. Bestellen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Bezahle sicher über unser Treuhand-System – Geld wird erst bei Abnahme freigegeben
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle>4. Erhalten</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Erhalte dein Ergebnis, prüfe es und gib das Geld frei – fertig!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* For Sellers */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Für Verkäufer</h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Monetarisiere deine Fähigkeiten und verdiene flexibel
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Star className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>1. Gig erstellen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Erstelle ein Gig mit Beschreibung, Preis (max. 250€) und Lieferzeit
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>2. Anfragen erhalten</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Käufer kontaktieren dich und du klärst die Details
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>3. Liefern</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Erledige die Arbeit innerhalb der vereinbarten Lieferzeit
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle>4. Bezahlt werden</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Nach Abnahme wird das Geld automatisch an dich ausgezahlt
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Safety Features */}
        <div className="bg-blue-50 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Sicherheit steht an erster Stelle</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Treuhand-System</h3>
                <p className="text-sm text-slate-600">
                  Dein Geld wird erst freigegeben, wenn du mit dem Ergebnis zufrieden bist
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">DSGVO-konform</h3>
                <p className="text-sm text-slate-600">
                  Alle Daten werden nach europäischen Datenschutzstandards verarbeitet
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Bewertungssystem</h3>
                <p className="text-sm text-slate-600">
                  Transparente Bewertungen helfen dir, die besten Anbieter zu finden
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Bereit loszulegen?</h2>
          <p className="text-slate-600 mb-8">Starte jetzt und entdecke die Möglichkeiten!</p>
          <div className="flex gap-4 justify-center">
            <Link href="/marketplace">
              <Button size="lg">Gigs durchsuchen</Button>
            </Link>
            <Link href="/create-gig">
              <Button size="lg" variant="outline">Gig erstellen</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

