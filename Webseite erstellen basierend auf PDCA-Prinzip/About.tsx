import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Heart, Shield } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">← Zurück</Button>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Über Flinkly</h1>
          <p className="text-lg text-slate-600">
            Der Marktplatz für digitale Mikrodienstleistungen in der DACH-Region
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Unsere Mission</h2>
          <p className="text-lg text-slate-700 leading-relaxed">
            Flinkly wurde gegründet, um die Lücke zwischen talentierten Kreativen und
            Unternehmen zu schließen, die schnelle, unkomplizierte digitale Unterstützung
            benötigen. Wir glauben an faire Bezahlung, Transparenz und die Kraft der
            lokalen Community.
          </p>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Target className="h-10 w-10 text-blue-600 mb-4" />
              <CardTitle>Fokussiert</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Wir konzentrieren uns auf kleine, klar definierte Aufgaben bis max. 250€
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-green-600 mb-4" />
              <CardTitle>Sicher</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Treuhand-Zahlungssystem und DSGVO-konforme Datenverarbeitung
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-purple-600 mb-4" />
              <CardTitle>Lokal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Speziell für die DACH-Region mit lokalen Zahlungsmethoden
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="h-10 w-10 text-red-600 mb-4" />
              <CardTitle>Fair</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Transparente Preise und faire Konditionen für alle Beteiligten
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Story */}
        <div className="bg-white rounded-lg p-8 mb-16 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Unsere Geschichte</h2>
          <div className="space-y-4 text-slate-700">
            <p>
              Flinkly entstand aus der Erkenntnis, dass viele kleine Unternehmen und
              Start-ups schnelle digitale Unterstützung benötigen, aber die großen
              internationalen Plattformen oft zu komplex, unpersönlich und rechtlich
              unsicher sind.
            </p>
            <p>
              Gleichzeitig suchten talentierte Kreative und Studierende nach flexiblen
              Möglichkeiten, ihre Fähigkeiten zu monetarisieren – ohne sich in
              komplizierten Verträgen oder undurchsichtigen Gebührenstrukturen zu verlieren.
            </p>
            <p>
              Mit Flinkly haben wir eine Plattform geschaffen, die beide Seiten verbindet:
              einfach, transparent und speziell auf die Bedürfnisse der DACH-Region
              zugeschnitten.
            </p>
          </div>
        </div>

        {/* Team */}
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Unser Team</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-8">
            Wir sind ein kleines, engagiertes Team aus Deutschland, das an die Kraft der
            digitalen Zusammenarbeit glaubt. Unser Ziel ist es, Flinkly zur ersten Anlaufstelle
            für digitale Mikrodienstleistungen in der DACH-Region zu machen.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Bereit, Teil von Flinkly zu werden?</h2>
          <p className="text-lg mb-8 opacity-90">
            Egal ob du Dienstleistungen anbietest oder suchst – starte jetzt!
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/marketplace">
              <Button size="lg" variant="secondary">
                Gigs durchsuchen
              </Button>
            </Link>
            <Link href="/create-gig">
              <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-slate-100">
                Gig erstellen
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

