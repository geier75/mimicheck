import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">← Zurück</Button>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Nutzungsbedingungen</h1>
          <p className="text-lg text-slate-600">
            Stand: Oktober 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-slate max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Geltungsbereich</h2>
            <p className="text-slate-700 mb-4">
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Plattform
              Flinkly und regeln das Vertragsverhältnis zwischen Flinkly und den Nutzern
              (Käufer und Verkäufer).
            </p>
            <p className="text-slate-700">
              Durch die Registrierung auf Flinkly erklären Sie sich mit diesen AGB einverstanden.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Leistungsbeschreibung</h2>
            <p className="text-slate-700 mb-4">
              Flinkly ist ein Online-Marktplatz für digitale Mikrodienstleistungen. Die Plattform
              ermöglicht es Verkäufern, ihre Dienstleistungen anzubieten, und Käufern, diese zu
              erwerben.
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Maximaler Preis pro Gig: 250€</li>
              <li>Fokus auf digitale Dienstleistungen</li>
              <li>Treuhand-Zahlungssystem</li>
              <li>Bewertungssystem für Transparenz</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Registrierung und Nutzerkonto</h2>
            <p className="text-slate-700 mb-4">
              Für die Nutzung von Flinkly ist eine Registrierung erforderlich. Sie verpflichten sich:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Wahrheitsgemäße und vollständige Angaben zu machen</li>
              <li>Ihre Zugangsdaten vertraulich zu behandeln</li>
              <li>Flinkly unverzüglich über unbefugte Zugriffe zu informieren</li>
              <li>Mindestens 18 Jahre alt zu sein</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Pflichten der Verkäufer</h2>
            <p className="text-slate-700 mb-4">
              Als Verkäufer verpflichten Sie sich:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Gigs wahrheitsgemäß und vollständig zu beschreiben</li>
              <li>Die vereinbarten Leistungen fristgerecht und in der beschriebenen Qualität zu erbringen</li>
              <li>Keine urheberrechtlich geschützten Inhalte ohne Erlaubnis zu verwenden</li>
              <li>Den maximalen Preis von 250€ pro Gig einzuhalten</li>
              <li>Professionell und respektvoll mit Käufern zu kommunizieren</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Pflichten der Käufer</h2>
            <p className="text-slate-700 mb-4">
              Als Käufer verpflichten Sie sich:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Klare und vollständige Anforderungen zu kommunizieren</li>
              <li>Bestellungen rechtzeitig zu bezahlen</li>
              <li>Gelieferte Arbeit innerhalb angemessener Zeit zu prüfen</li>
              <li>Konstruktives Feedback zu geben</li>
              <li>Das Treuhand-System nicht zu missbrauchen</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Zahlungsabwicklung</h2>
            <p className="text-slate-700 mb-4">
              Alle Zahlungen werden über unser Treuhand-System abgewickelt:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Käufer zahlen bei Bestellung</li>
              <li>Geld wird bei Flinkly verwahrt</li>
              <li>Freigabe erfolgt nach Abnahme durch den Käufer</li>
              <li>Auszahlung an Verkäufer innerhalb von 2-3 Werktagen</li>
              <li>Flinkly behält eine Provision von 10% ein</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Haftung</h2>
            <p className="text-slate-700 mb-4">
              Flinkly haftet nicht für:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2">
              <li>Die Qualität der angebotenen Dienstleistungen</li>
              <li>Streitigkeiten zwischen Käufern und Verkäufern</li>
              <li>Verluste durch technische Störungen (außer bei Vorsatz oder grober Fahrlässigkeit)</li>
              <li>Inhalte, die von Nutzern hochgeladen werden</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Streitbeilegung</h2>
            <p className="text-slate-700 mb-4">
              Bei Streitigkeiten zwischen Käufern und Verkäufern bietet Flinkly einen
              Mediationsprozess an. Beide Parteien können den Support kontaktieren, der den Fall
              prüft und eine Empfehlung ausspricht.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Kündigung</h2>
            <p className="text-slate-700 mb-4">
              Beide Parteien können ihr Nutzerkonto jederzeit kündigen. Laufende Aufträge müssen
              vor der Kündigung abgeschlossen werden. Flinkly behält sich das Recht vor, Konten
              bei Verstößen gegen diese AGB zu sperren.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Änderungen der AGB</h2>
            <p className="text-slate-700 mb-4">
              Flinkly behält sich das Recht vor, diese AGB jederzeit zu ändern. Nutzer werden
              über wesentliche Änderungen per E-Mail informiert. Die Fortsetzung der Nutzung nach
              Änderungen gilt als Zustimmung zu den neuen AGB.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Anwendbares Recht</h2>
            <p className="text-slate-700 mb-4">
              Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist Bad Liebenzell.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Impressum</h2>
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
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <p className="text-sm text-slate-600">
            <strong>Hinweis:</strong> Diese Nutzungsbedingungen dienen als Beispiel und sollten
            von einem Rechtsanwalt geprüft und an die spezifischen Anforderungen angepasst werden.
          </p>
        </div>
      </div>
    </div>
  );
}

