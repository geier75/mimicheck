import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";

export default function FAQ() {
  const faqs = [
    {
      category: "Allgemein",
      questions: [
        {
          q: "Was ist Flinkly?",
          a: "Flinkly ist ein Marktplatz für digitale Mikrodienstleistungen in der DACH-Region. Wir verbinden Käufer mit talentierten Anbietern für kleine, klar definierte Aufgaben bis maximal 250€."
        },
        {
          q: "Für wen ist Flinkly geeignet?",
          a: "Flinkly ist perfekt für Start-ups, Kleinunternehmen, Soloselbstständige und Privatpersonen, die schnelle digitale Unterstützung benötigen. Auf der Anbieterseite richtet sich Flinkly an Studierende, Kreative und alle mit digitalen Fähigkeiten."
        },
        {
          q: "Warum max. 250€?",
          a: "Wir fokussieren uns bewusst auf kleine, überschaubare Aufgaben. Das macht die Zusammenarbeit einfacher, schneller und reduziert das Risiko für beide Seiten."
        }
      ]
    },
    {
      category: "Für Käufer",
      questions: [
        {
          q: "Wie finde ich den richtigen Anbieter?",
          a: "Nutze unsere Suchfunktion und Filter im Marketplace. Du kannst nach Kategorie, Preis, Bewertung und Lieferzeit filtern. Schau dir die Profile und Bewertungen der Anbieter an."
        },
        {
          q: "Wie funktioniert die Bezahlung?",
          a: "Wir nutzen ein Treuhand-System: Du bezahlst bei der Bestellung, aber das Geld wird erst freigegeben, wenn du das Ergebnis geprüft und akzeptiert hast. So bist du geschützt."
        },
        {
          q: "Was passiert, wenn ich nicht zufrieden bin?",
          a: "Du kannst Nachbesserungen anfordern oder im Streitfall unseren Support kontaktieren. Das Geld wird erst freigegeben, wenn du zufrieden bist."
        },
        {
          q: "Welche Zahlungsmethoden werden akzeptiert?",
          a: "Wir akzeptieren lokale Zahlungsmethoden wie Klarna/Sofort, TWINT, SEPA-Lastschrift und Kreditkarten."
        }
      ]
    },
    {
      category: "Für Verkäufer",
      questions: [
        {
          q: "Wie erstelle ich ein Gig?",
          a: "Melde dich an, gehe zu 'Gig erstellen' und fülle das Formular aus: Titel, Beschreibung, Kategorie, Preis und Lieferzeit. Füge ein ansprechendes Bild hinzu und veröffentliche dein Gig."
        },
        {
          q: "Wie viel kann ich verdienen?",
          a: "Du legst deinen Preis selbst fest (bis max. 250€ pro Gig). Flinkly behält eine kleine Provision ein, der Rest geht an dich."
        },
        {
          q: "Wann erhalte ich mein Geld?",
          a: "Das Geld wird automatisch ausgezahlt, sobald der Käufer das Ergebnis akzeptiert hat. Die Auszahlung erfolgt innerhalb von 2-3 Werktagen."
        },
        {
          q: "Muss ich ein Gewerbe anmelden?",
          a: "Das hängt von deinem Land und deinem Einkommen ab. Wir bieten Guides zur Kleingewerberegelung in Deutschland, Österreich und der Schweiz. Bitte informiere dich bei deinem lokalen Finanzamt."
        },
        {
          q: "Kann ich mehrere Gigs anbieten?",
          a: "Ja! Du kannst so viele Gigs erstellen, wie du möchtest. Jedes Gig sollte eine klar definierte Dienstleistung beschreiben."
        }
      ]
    },
    {
      category: "Sicherheit & Datenschutz",
      questions: [
        {
          q: "Ist meine Zahlung sicher?",
          a: "Ja, wir nutzen ein Treuhand-System. Das Geld wird erst freigegeben, wenn beide Seiten zufrieden sind. Alle Zahlungen werden verschlüsselt übertragen."
        },
        {
          q: "Wie werden meine Daten geschützt?",
          a: "Wir sind DSGVO-konform und hosten alle Daten in Europa. Deine persönlichen Daten werden niemals an Dritte weitergegeben."
        },
        {
          q: "Was passiert bei Streitigkeiten?",
          a: "Unser Support-Team hilft bei Streitigkeiten. Wir prüfen den Fall und treffen eine faire Entscheidung basierend auf den Vereinbarungen und Nachweisen."
        }
      ]
    },
    {
      category: "Technisches",
      questions: [
        {
          q: "Welche Kategorien gibt es?",
          a: "Wir bieten Gigs in den Kategorien: Design, Schreiben, Marketing, Entwicklung, Video, Audio und Sonstiges."
        },
        {
          q: "Kann ich mein Gig bearbeiten?",
          a: "Ja, du kannst deine Gigs jederzeit im Dashboard bearbeiten oder deaktivieren."
        },
        {
          q: "Wie funktioniert das Bewertungssystem?",
          a: "Nach Abschluss einer Bestellung können beide Seiten eine Bewertung (1-5 Sterne) und einen Kommentar hinterlassen. Diese Bewertungen sind öffentlich sichtbar."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">← Zurück</Button>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Häufig gestellte Fragen</h1>
          <p className="text-lg text-slate-600">
            Alles, was du über Flinkly wissen musst
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {faqs.map((category, idx) => (
          <div key={idx} className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{category.category}</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {category.questions.map((faq, qIdx) => (
                <AccordionItem key={qIdx} value={`${idx}-${qIdx}`} className="bg-white rounded-lg border border-slate-200">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <span className="text-left font-semibold text-slate-900">{faq.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-slate-600">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="bg-blue-50 rounded-lg p-8 text-center mt-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Noch Fragen?</h2>
          <p className="text-slate-600 mb-6">
            Unser Support-Team hilft dir gerne weiter!
          </p>
          <Link href="/contact">
            <Button size="lg">Kontakt aufnehmen</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

