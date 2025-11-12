import Navbar from '@/components/Navbar';
import { Link } from 'wouter';

export default function AGB() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2>1. Geltungsbereich</h2>
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen der MiMi Tech Ai UG (haftungsbeschränkt), Lindenplatz 23, 75378 Bad Liebenzell (nachfolgend "Anbieter") und dem Nutzer (nachfolgend "Kunde") über die Nutzung der Plattform MiMiCheck.
            </p>

            <h2>2. Vertragsgegenstand</h2>
            <p>
              MiMiCheck ist eine digitale Plattform zur Unterstützung bei der Beantragung von Förderungen und Leistungen. Die Plattform nutzt KI-Systeme zur Analyse von Dokumenten und zum automatischen Ausfüllen von Antragsformularen.
            </p>
            <p>
              Der Anbieter stellt folgende Leistungen bereit:
            </p>
            <ul>
              <li>Upload und Analyse von Dokumenten (Abrechnungen, Nachweise)</li>
              <li>Identifikation passender Förderungen und Leistungen</li>
              <li>Automatisches Vorausfüllen von Antragsformularen</li>
              <li>Überprüfung und Freigabe durch qualifizierte Mitarbeiter</li>
              <li>Unterstützung bei der Einreichung von Anträgen</li>
            </ul>

            <h2>3. Vertragsschluss und Registrierung</h2>
            <p>
              Der Vertrag kommt durch die Registrierung des Kunden auf der Plattform MiMiCheck zustande. Mit der Registrierung akzeptiert der Kunde diese AGB.
            </p>
            <p>
              Der Kunde ist verpflichtet, bei der Registrierung wahrheitsgemäße und vollständige Angaben zu machen. Änderungen der Daten sind dem Anbieter unverzüglich mitzuteilen.
            </p>

            <h2>4. Leistungsumfang und Nutzung</h2>
            <p>
              Der Anbieter stellt die Plattform in der jeweils aktuellen Version zur Verfügung. Der Kunde hat keinen Anspruch auf eine bestimmte Funktionalität oder Verfügbarkeit.
            </p>
            <p>
              Der Anbieter behält sich das Recht vor, die Plattform jederzeit zu ändern, zu erweitern oder einzuschränken, soweit dies für den Kunden zumutbar ist.
            </p>

            <h2>5. KI-Systeme und Haftung</h2>
            <p>
              Die Plattform nutzt KI-Systeme zur Analyse und Verarbeitung von Dokumenten. Der Anbieter weist darauf hin, dass:
            </p>
            <ul>
              <li>KI-Systeme Fehler machen können</li>
              <li>Alle KI-Vorschläge von qualifizierten Mitarbeitern überprüft werden</li>
              <li>Der Kunde die finale Verantwortung für die Richtigkeit der Angaben trägt</li>
              <li>Der Kunde alle Vorschläge vor der Einreichung prüfen muss</li>
            </ul>
            <p>
              Der Anbieter haftet nicht für Schäden, die durch fehlerhafte KI-Vorschläge entstehen, sofern diese vom Kunden nicht geprüft wurden.
            </p>

            <h2>6. Pflichten des Kunden</h2>
            <p>
              Der Kunde verpflichtet sich:
            </p>
            <ul>
              <li>Die Plattform nur für rechtmäßige Zwecke zu nutzen</li>
              <li>Wahrheitsgemäße und vollständige Angaben zu machen</li>
              <li>Hochgeladene Dokumente auf Richtigkeit zu prüfen</li>
              <li>KI-generierte Vorschläge vor der Einreichung zu überprüfen</li>
              <li>Seine Zugangsdaten geheim zu halten</li>
              <li>Den Anbieter unverzüglich über Missbrauch zu informieren</li>
            </ul>

            <h2>7. Datenschutz und Vertraulichkeit</h2>
            <p>
              Der Anbieter verpflichtet sich, alle personenbezogenen Daten des Kunden gemäß den geltenden Datenschutzbestimmungen (DSGVO) zu verarbeiten. Weitere Informationen finden Sie in unserer <Link href="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</Link>.
            </p>
            <p>
              Der Anbieter behandelt alle hochgeladenen Dokumente und Informationen vertraulich und gibt diese nicht an Dritte weiter, sofern dies nicht zur Erfüllung des Vertragszwecks erforderlich ist.
            </p>

            <h2>8. Vergütung und Zahlungsbedingungen</h2>
            <p>
              Die Nutzung der Plattform kann kostenlos oder kostenpflichtig sein. Die jeweils gültigen Preise werden auf der Plattform angezeigt.
            </p>
            <p>
              Zahlungen sind im Voraus fällig. Der Anbieter behält sich das Recht vor, die Nutzung bei Zahlungsverzug zu sperren.
            </p>

            <h2>9. Laufzeit und Kündigung</h2>
            <p>
              Der Vertrag wird auf unbestimmte Zeit geschlossen. Beide Parteien können den Vertrag jederzeit mit einer Frist von 14 Tagen kündigen.
            </p>
            <p>
              Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. Ein wichtiger Grund liegt insbesondere vor bei:
            </p>
            <ul>
              <li>Verstoß gegen diese AGB</li>
              <li>Missbrauch der Plattform</li>
              <li>Zahlungsverzug von mehr als 30 Tagen</li>
            </ul>

            <h2>10. Haftung</h2>
            <p>
              Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit.
            </p>
            <p>
              Für leichte Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten). In diesem Fall ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt.
            </p>
            <p>
              Die Haftung nach dem Produkthaftungsgesetz bleibt unberührt.
            </p>

            <h2>11. Gewährleistung</h2>
            <p>
              Der Anbieter gewährleistet, dass die Plattform im Wesentlichen die beschriebenen Funktionen erfüllt. Kleinere Abweichungen oder Fehler, die die Nutzung nicht wesentlich beeinträchtigen, begründen keine Gewährleistungsansprüche.
            </p>
            <p>
              Der Anbieter ist berechtigt, Mängel durch Nachbesserung oder Ersatzlieferung zu beheben. Schlägt die Nacherfüllung fehl, kann der Kunde nach seiner Wahl Minderung verlangen oder vom Vertrag zurücktreten.
            </p>

            <h2>12. EU AI Act Konformität</h2>
            <p>
              Der Anbieter verpflichtet sich, die Anforderungen des EU AI Act (Verordnung (EU) 2024/1689) einzuhalten. Insbesondere:
            </p>
            <ul>
              <li>Transparente Information über den Einsatz von KI-Systemen</li>
              <li>Menschliche Aufsicht bei allen KI-Entscheidungen</li>
              <li>Dokumentation und Nachvollziehbarkeit von KI-Vorschlägen</li>
              <li>Risikoklassifizierung als "Limited Risk AI"</li>
              <li>Regelmäßige Überprüfung und Verbesserung der KI-Systeme</li>
            </ul>

            <h2>13. Änderungen der AGB</h2>
            <p>
              Der Anbieter behält sich das Recht vor, diese AGB jederzeit zu ändern. Änderungen werden dem Kunden per E-Mail mitgeteilt. Widerspricht der Kunde nicht innerhalb von 14 Tagen, gelten die geänderten AGB als akzeptiert.
            </p>

            <h2>14. Schlussbestimmungen</h2>
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
            </p>
            <p>
              Gerichtsstand für alle Streitigkeiten aus diesem Vertrag ist, soweit gesetzlich zulässig, der Sitz des Anbieters.
            </p>
            <p>
              Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
            </p>

            <h2>15. Kontakt</h2>
            <p>
              Bei Fragen zu diesen AGB wenden Sie sich bitte an:
            </p>
            <p>
              <strong>MiMi Tech Ai UG (haftungsbeschränkt)</strong><br />
              Lindenplatz 23<br />
              75378 Bad Liebenzell<br />
              Deutschland
            </p>
            <p>
              E-Mail: <a href="mailto:info@mimitechai.com">info@mimitechai.com</a><br />
              Telefon: <a href="tel:+4915758805737">+49 1575 8805737</a>
            </p>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Stand: November 2025
              </p>
              <Link href="/" className="text-primary hover:underline mt-4 inline-block">
                ← Zurück zur Startseite
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
