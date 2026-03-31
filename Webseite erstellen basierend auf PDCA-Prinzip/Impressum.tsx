import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Impressum() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">← Zurück</Button>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Impressum</h1>
          <p className="text-lg text-slate-600">
            Angaben gemäß § 5 TMG
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-slate max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Anbieter</h2>
            <div className="bg-slate-50 p-6 rounded-lg text-slate-700">
              <p className="font-semibold text-lg mb-2">MiMi Tech Ai UG (haftungsbeschränkt)</p>
              <p>Lindenplatz 23</p>
              <p>75378 Bad Liebenzell</p>
              <p>Deutschland</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Kontakt</h2>
            <div className="space-y-2 text-slate-700">
              <p>
                <strong>E-Mail:</strong>{" "}
                <a href="mailto:info@mimitechai.com" className="text-blue-600 hover:underline">
                  info@mimitechai.com
                </a>
              </p>
              <p>
                <strong>Telefon:</strong>{" "}
                <a href="tel:+4915758805737" className="text-blue-600 hover:underline">
                  +49 1575 8805737
                </a>
              </p>
              <p>
                <strong>Website:</strong>{" "}
                <a
                  href="https://www.mimitechai.com"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.mimitechai.com
                </a>
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Vertretungsberechtigte Geschäftsführung</h2>
            <p className="text-slate-700">
              Geschäftsführer: [Name des Geschäftsführers]
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Registereintrag</h2>
            <div className="space-y-2 text-slate-700">
              <p>
                <strong>Registergericht:</strong> [Amtsgericht]
              </p>
              <p>
                <strong>Registernummer:</strong> [HRB-Nummer]
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Umsatzsteuer-ID</h2>
            <p className="text-slate-700">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
              <strong>[USt-IdNr.]</strong>
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Verantwortlich für den Inhalt</h2>
            <p className="text-slate-700">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:<br />
              <strong>[Name]</strong><br />
              Lindenplatz 23<br />
              75378 Bad Liebenzell
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">EU-Streitschlichtung</h2>
            <p className="text-slate-700 mb-4">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
            </p>
            <p className="text-slate-700">
              <a
                href="https://ec.europa.eu/consumers/odr/"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="text-slate-700 mt-4">
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Verbraucherstreitbeilegung</h2>
            <p className="text-slate-700">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Haftung für Inhalte</h2>
            <p className="text-slate-700 mb-4">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen.
            </p>
            <p className="text-slate-700">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
              allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
              erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
              Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend
              entfernen.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Haftung für Links</h2>
            <p className="text-slate-700 mb-4">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
              übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
              Betreiber der Seiten verantwortlich.
            </p>
            <p className="text-slate-700">
              Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
              überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
              Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
              Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Urheberrecht</h2>
            <p className="text-slate-700 mb-4">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
              dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
              der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
              Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
            <p className="text-slate-700">
              Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch
              gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden
              die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
              gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden,
              bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
              werden wir derartige Inhalte umgehend entfernen.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <p className="text-sm text-slate-600">
            <strong>Hinweis:</strong> Bitte ergänzen Sie die fehlenden Angaben (Geschäftsführer,
            Registernummer, USt-IdNr.) entsprechend Ihrer tatsächlichen Unternehmensdaten.
          </p>
        </div>
      </div>
    </div>
  );
}

