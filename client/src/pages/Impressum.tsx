import Navbar from '@/components/Navbar';
import { Link } from 'wouter';

export default function Impressum() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Impressum</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2>Angaben gemäß § 5 TMG</h2>
            
            <h3>Anbieter</h3>
            <p>
              <strong>MiMi Tech Ai UG (haftungsbeschränkt)</strong><br />
              Lindenplatz 23<br />
              75378 Bad Liebenzell<br />
              Deutschland
            </p>

            <h3>Kontakt</h3>
            <p>
              <strong>E-Mail:</strong> <a href="mailto:info@mimitechai.com">info@mimitechai.com</a><br />
              <strong>Telefon:</strong> <a href="tel:+4915758805737">+49 1575 8805737</a><br />
              <strong>Website:</strong> <a href="https://www.mimitechai.com" target="_blank" rel="noopener noreferrer">www.mimitechai.com</a>
            </p>

            <h3>Rechtliche Angaben</h3>
            <p>
              <strong>Vertretungsberechtigte Person:</strong><br />
              Michael Bemler (Geschäftsführer)
            </p>

            <p>
              <strong>Registereintrag:</strong><br />
              Registergericht: Amtsgericht Stuttgart<br />
              Rechtsform: UG (haftungsbeschränkt)
            </p>

            <p>
              <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br />
              Michael Bemler<br />
              Lindenplatz 23<br />
              75378 Bad Liebenzell
            </p>

            <h2>Haftungsausschluss</h2>

            <h3>Haftung für Inhalte</h3>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>

            <h3>Haftung für Links</h3>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
            <p>
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>

            <h3>Urheberrecht</h3>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
            <p>
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
            </p>

            <div className="mt-12 pt-8 border-t border-border">
              <Link href="/" className="text-primary hover:underline">
                ← Zurück zur Startseite
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
