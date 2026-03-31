import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Star, Zap, Shield, Users, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Hero Section - BOLD & LARGE */}
      <section className="container mx-auto px-4 py-32 text-center bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-7xl font-black text-slate-900 mb-8 leading-tight">
            Kleine Gigs, <span className="text-blue-600">große Wirkung</span>
          </h1>
          <p className="text-2xl text-slate-700 mb-12 leading-relaxed max-w-3xl mx-auto">
            Dein Marktplatz für schnelle, kreative & digitale Mikrodienstleistungen in der DACH-Region. Vertrauen, Einfachheit, Rechtssicherheit.
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95">
                🚀 Jetzt starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 rounded-xl border-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50 transition-all duration-200">
                Gigs entdecken
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem & Solution - LARGER TEXT */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-5xl font-black mb-10">Das Problem</h2>
              <div className="space-y-6 text-lg text-slate-200 leading-relaxed">
                <p>
                  <strong className="text-white text-xl">Kleine Unternehmen & Start-ups</strong> benötigen oft schnell digitale Unterstützung, haben aber weder Budget noch Zeit für Agenturen.
                </p>
                <p>
                  <strong className="text-white text-xl">Talentierte Kreative</strong> suchen nach flexiblen Möglichkeiten, ihre Fähigkeiten nebenbei zu monetarisieren.
                </p>
                <p>
                  Bestehende globale Plattformen sind unpersönlich, komplex und nicht auf lokale rechtliche Gegebenheiten (DSGVO, Steuern) ausgelegt.
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-5xl font-black mb-10">Die Lösung: Flinkly</h2>
              <div className="space-y-6 text-lg text-slate-200 leading-relaxed">
                <p>
                  Ein hyper-fokussierter Online-Marktplatz, der den An- und Verkauf von digitalen Mikrodienstleistungen radikal vereinfacht.
                </p>
                <p>
                  Wir bringen lokale Nachfrage und lokales Talent auf einer vertrauenswürdigen, benutzerfreundlichen und rechtssicheren Plattform zusammen.
                </p>
                <p className="font-bold text-blue-300 text-xl border-l-4 border-blue-400 pl-4">
                  Jedem die Möglichkeit geben, digitale Aufgaben schnell erledigen zu lassen und jedem Talent einen unkomplizierten Weg zu Nebeneinkommen zu bieten.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - BOLD CARDS WITH HOVER */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-5xl font-black text-center text-slate-900 mb-20">Warum Flinkly?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 border-slate-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-white pb-6">
              <div className="h-16 w-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Micro-Gigs</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg text-slate-700 leading-relaxed">
                Kleine, standardisierte Dienstleistungen (max. 250€) für schnelle Abwicklung und klare Erwartungen.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:border-green-500 hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardHeader className="bg-gradient-to-br from-green-50 to-white pb-6">
              <div className="h-16 w-16 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">DSGVO-konform</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg text-slate-700 leading-relaxed">
                Hosting und Datenverarbeitung nach europäischen Standards. Rechtliche Hilfestellungen zur Kleingewerberegelung.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:border-purple-500 hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardHeader className="bg-gradient-to-br from-purple-50 to-white pb-6">
              <div className="h-16 w-16 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Lokalisiert für DACH</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg text-slate-700 leading-relaxed">
                Integration von Klarna/Sofort, TWINT, SEPA. Speziell für Deutschland, Österreich und die Schweiz.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:border-orange-500 hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardHeader className="bg-gradient-to-br from-orange-50 to-white pb-6">
              <div className="h-16 w-16 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Intuitive UX</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg text-slate-700 leading-relaxed">
                Extrem einfacher Prozess von der Suche über die Beauftragung bis zur Abnahme in wenigen Klicks.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:border-yellow-500 hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardHeader className="bg-gradient-to-br from-yellow-50 to-white pb-6">
              <div className="h-16 w-16 bg-yellow-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Transparentes Bewertungssystem</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg text-slate-700 leading-relaxed">
                Vertrauen durch ehrliche Bewertungen und Treuhand-Zahlungssystem. Geld wird erst bei Projektabschluss freigegeben.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:border-red-500 hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardHeader className="bg-gradient-to-br from-red-50 to-white pb-6">
              <div className="h-16 w-16 bg-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Für Wachstum gemacht</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg text-slate-700 leading-relaxed">
                Skalierbar von einzelnen Freelancern bis zu kleinen Agenturen. Flexibel für Ihre Bedürfnisse.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Target Market - LARGER TEXT */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-black text-center text-slate-900 mb-20">Für wen ist Flinkly?</h2>
          <div className="grid md:grid-cols-2 gap-16">
            <div className="bg-white p-10 rounded-2xl border-2 border-blue-200 shadow-lg">
              <h3 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <span className="text-4xl">👥</span> Kunden (Käufer)
              </h3>
              <ul className="space-y-5 text-lg text-slate-700">
                <li className="flex gap-4 items-start">
                  <CheckCircle className="h-7 w-7 text-green-600 flex-shrink-0 mt-1" />
                  <span className="font-semibold">Start-ups & Kleinunternehmen</span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircle className="h-7 w-7 text-green-600 flex-shrink-0 mt-1" />
                  <span className="font-semibold">Soloselbstständige & Influencer</span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircle className="h-7 w-7 text-green-600 flex-shrink-0 mt-1" />
                  <span className="font-semibold">Marketing-Teams in KMUs</span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircle className="h-7 w-7 text-green-600 flex-shrink-0 mt-1" />
                  <span className="font-semibold">Privatpersonen für kleine digitale Aufgaben</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-10 rounded-2xl border-2 border-purple-200 shadow-lg">
              <h3 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <span className="text-4xl">⭐</span> Anbieter (Macher)
              </h3>
              <ul className="space-y-5 text-lg text-slate-700">
                <li className="flex gap-4 items-start">
                  <CheckCircle className="h-7 w-7 text-green-600 flex-shrink-0 mt-1" />
                  <span className="font-semibold">Studierende kreativer & digitaler Fächer</span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircle className="h-7 w-7 text-green-600 flex-shrink-0 mt-1" />
                  <span className="font-semibold">Berufstätige mit digitalen Skills</span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircle className="h-7 w-7 text-green-600 flex-shrink-0 mt-1" />
                  <span className="font-semibold">Eltern in Elternzeit mit flexibler Zeiteinteilung</span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircle className="h-7 w-7 text-green-600 flex-shrink-0 mt-1" />
                  <span className="font-semibold">Jeder mit nachweisbarem digitalen Talent</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - BOLD */}
      <section className="container mx-auto px-4 py-24 text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl my-12 text-white">
        <h2 className="text-5xl font-black mb-8">Warum jetzt?</h2>
        <p className="text-xl text-blue-50 max-w-3xl mx-auto mb-12 leading-relaxed">
          Der Trend zur flexiblen Arbeit ("Side Hustle") ist ungebrochen und die Digitalisierung des Mittelstands beschleunigt sich. Die Nachfrage nach schnellen, budgetfreundlichen digitalen Dienstleistungen ist höher denn je. Flinkly bedient diesen Bedarf mit einem lokal angepassten und vertrauenswürdigen Modell.
        </p>
        <a href={getLoginUrl()}>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-12 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 font-bold">
            ✨ Jetzt kostenlos registrieren
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-black text-xl mb-6">Flinkly</h3>
              <p className="text-slate-300 text-base leading-relaxed">
                Der Marktplatz für digitale Mikrodienstleistungen in der DACH-Region.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Für Käufer</h4>
              <ul className="space-y-3 text-base text-slate-300">
                <li><Link href="/marketplace" className="hover:text-white font-semibold transition-colors">Gigs durchsuchen</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white font-semibold transition-colors">Wie es funktioniert</Link></li>
                <li><Link href="/faq" className="hover:text-white font-semibold transition-colors">Sicherheit</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Für Verkäufer</h4>
              <ul className="space-y-3 text-base text-slate-300">
                <li><Link href="/create-gig" className="hover:text-white font-semibold transition-colors">Gig erstellen</Link></li>
                <li><Link href="/dashboard" className="hover:text-white font-semibold transition-colors">Verdienen</Link></li>
                <li><Link href="/faq" className="hover:text-white font-semibold transition-colors">Ressourcen</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Unternehmen</h4>
              <ul className="space-y-3 text-base text-slate-300">
                <li><Link href="/about" className="hover:text-white font-semibold transition-colors">Über uns</Link></li>
                <li><Link href="/contact" className="hover:text-white font-semibold transition-colors">Kontakt</Link></li>
                <li><Link href="/privacy" className="hover:text-white font-semibold transition-colors">Datenschutz</Link></li>
                <li><Link href="/terms" className="hover:text-white font-semibold transition-colors">AGB</Link></li>
                <li><Link href="/impressum" className="hover:text-white font-semibold transition-colors">Impressum</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-slate-400 text-base">
            © 2025 Flinkly by <a href="https://www.mimitechai.com" className="hover:text-white font-semibold transition-colors" target="_blank" rel="noopener noreferrer">MiMi Tech Ai UG</a>. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
}

