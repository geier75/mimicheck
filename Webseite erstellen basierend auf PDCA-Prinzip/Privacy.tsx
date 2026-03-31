import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">← Zurück</Button>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Datenschutzerklärung</h1>
          <p className="text-lg text-slate-600">
            Stand: Oktober 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-slate max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Verantwortlicher</h2>
            <p className="text-slate-700 mb-4">
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
            </p>
            <div className="bg-slate-50 p-4 rounded-lg text-slate-700">
              <strong>MiMi Tech Ai UG (haftungsbeschränkt)</strong><br />
              Lindenplatz 23<br />
              75378 Bad Liebenzell<br />
              Deutschland<br />
              <br />
              E-Mail: <a href="mailto:info@mimitechai.com" className="text-blue-600 hover:underline">info@mimitechai.com</a><br />
              Telefon: <a href="tel:+4915758805737" className="text-blue-600 hover:underline">+49 1575 8805737</a><br />
              Website: <a href="https://www.mimitechai.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.mimitechai.com</a>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Erhebung und Speicherung personenbezogener Daten</h2>
            <p className="text-slate-700 mb-4">
              Wir erheben und verarbeiten folgende personenbezogene Daten:
            </p>
            
            <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">2.1 Bei der Registrierung</h3>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Name</li>
              <li>E-Mail-Adresse</li>
              <li>Passwort (verschlüsselt)</li>
              <li>Profilbild (optional)</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">2.2 Bei der Nutzung der Plattform</h3>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
              <li>Gig-Beschreibungen und hochgeladene Dateien</li>
              <li>Nachrichten zwischen Nutzern</li>
              <li>Bestellhistorie</li>
              <li>Bewertungen und Kommentare</li>
              <li>Zahlungsinformationen (werden von unserem Zahlungsdienstleister verarbeitet)</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">2.3 Automatisch erfasste Daten</h3>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>IP-Adresse</li>
              <li>Browser-Typ und -Version</li>
              <li>Betriebssystem</li>
              <li>Zugriffszeitpunkt</li>
              <li>Besuchte Seiten</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Zweck der Datenverarbeitung</h2>
            <p className="text-slate-700 mb-4">
              Wir verwenden Ihre Daten für folgende Zwecke:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Bereitstellung und Betrieb der Plattform</li>
              <li>Abwicklung von Transaktionen</li>
              <li>Kommunikation mit Nutzern</li>
              <li>Verbesserung unserer Dienstleistungen</li>
              <li>Betrugsprävention und Sicherheit</li>
              <li>Erfüllung rechtlicher Verpflichtungen</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Rechtsgrundlage</h2>
            <p className="text-slate-700 mb-4">
              Die Verarbeitung Ihrer Daten erfolgt auf Grundlage von:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li><strong>Art. 6 Abs. 1 lit. b DSGVO:</strong> Vertragserfüllung</li>
              <li><strong>Art. 6 Abs. 1 lit. a DSGVO:</strong> Einwilligung</li>
              <li><strong>Art. 6 Abs. 1 lit. f DSGVO:</strong> Berechtigte Interessen</li>
              <li><strong>Art. 6 Abs. 1 lit. c DSGVO:</strong> Rechtliche Verpflichtungen</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Weitergabe von Daten</h2>
            <p className="text-slate-700 mb-4">
              Wir geben Ihre Daten nur in folgenden Fällen weiter:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>An andere Nutzer (z.B. Name und Profilbild bei Transaktionen)</li>
              <li>An Zahlungsdienstleister (nur notwendige Zahlungsinformationen)</li>
              <li>An Hosting-Provider (Server in der EU)</li>
              <li>Bei rechtlichen Verpflichtungen (z.B. Strafverfolgung)</li>
            </ul>
            <p className="text-slate-700 mt-4">
              <strong>Wichtig:</strong> Wir verkaufen Ihre Daten niemals an Dritte!
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Speicherdauer</h2>
            <p className="text-slate-700 mb-4">
              Wir speichern Ihre Daten nur so lange, wie es für die jeweiligen Zwecke erforderlich ist:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Kontodaten: Bis zur Löschung des Kontos</li>
              <li>Transaktionsdaten: 10 Jahre (steuerrechtliche Aufbewahrungspflicht)</li>
              <li>Nachrichten: Bis zur Löschung durch den Nutzer</li>
              <li>Log-Dateien: 90 Tage</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Cookies</h2>
            <p className="text-slate-700 mb-4">
              Unsere Website verwendet Cookies. Wir unterscheiden zwischen:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li><strong>Notwendige Cookies:</strong> Für den Betrieb der Website erforderlich (z.B. Session-Cookies)</li>
              <li><strong>Funktionale Cookies:</strong> Für erweiterte Funktionen (z.B. Spracheinstellungen)</li>
              <li><strong>Analytische Cookies:</strong> Zur Verbesserung der Website (nur mit Ihrer Einwilligung)</li>
            </ul>
            <p className="text-slate-700 mt-4">
              Sie können Cookies in Ihren Browser-Einstellungen verwalten.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Ihre Rechte</h2>
            <p className="text-slate-700 mb-4">
              Sie haben folgende Rechte bezüglich Ihrer Daten:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li><strong>Auskunftsrecht:</strong> Sie können Auskunft über Ihre gespeicherten Daten verlangen</li>
              <li><strong>Berichtigungsrecht:</strong> Sie können falsche Daten korrigieren lassen</li>
              <li><strong>Löschungsrecht:</strong> Sie können die Löschung Ihrer Daten verlangen</li>
              <li><strong>Einschränkungsrecht:</strong> Sie können die Verarbeitung einschränken lassen</li>
              <li><strong>Widerspruchsrecht:</strong> Sie können der Verarbeitung widersprechen</li>
              <li><strong>Datenübertragbarkeit:</strong> Sie können Ihre Daten in einem gängigen Format erhalten</li>
              <li><strong>Beschwerderecht:</strong> Sie können sich bei einer Aufsichtsbehörde beschweren</li>
            </ul>
            <p className="text-slate-700 mt-4">
              Kontaktieren Sie uns unter <a href="mailto:info@mimitechai.com" className="text-blue-600 hover:underline">info@mimitechai.com</a> zur Ausübung Ihrer Rechte.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Datensicherheit</h2>
            <p className="text-slate-700 mb-4">
              Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>SSL/TLS-Verschlüsselung für alle Datenübertragungen</li>
              <li>Verschlüsselte Speicherung von Passwörtern</li>
              <li>Regelmäßige Sicherheitsupdates</li>
              <li>Zugriffsbeschränkungen für Mitarbeiter</li>
              <li>Regelmäßige Backups</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Änderungen der Datenschutzerklärung</h2>
            <p className="text-slate-700">
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte
              Rechtslagen oder Änderungen unserer Dienstleistungen anzupassen. Die aktuelle
              Datenschutzerklärung ist stets auf unserer Website verfügbar.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <p className="text-sm text-slate-600">
            <strong>Hinweis:</strong> Diese Datenschutzerklärung dient als Beispiel und sollte
            von einem Datenschutzbeauftragten oder Rechtsanwalt geprüft und an die spezifischen
            Anforderungen Ihres Unternehmens angepasst werden.
          </p>
        </div>
      </div>
    </div>
  );
}

