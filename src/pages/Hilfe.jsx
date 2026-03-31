import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
    Search, 
    HelpCircle, 
    FileText, 
    MessageCircle, 
    Mail,
    Phone,
    Book,
    Video,
    ChevronDown,
    ChevronUp,
    ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const FAQItem = ({ question, answer, isOpen, onToggle }) => (
    <Card className="shadow-md border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80">
        <CardContent className="p-0">
            <button
                onClick={onToggle}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors duration-200"
            >
                <h3 className="font-semibold text-slate-800 dark:text-white pr-4">{question}</h3>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                )}
            </button>
            {isOpen && (
                <div className="px-6 pb-6 border-t border-slate-200/60 dark:border-slate-600/60">
                    <div className="pt-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                        {answer}
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
);

export default function Hilfe() {
    const [searchTerm, setSearchTerm] = useState('');
    const [openFAQ, setOpenFAQ] = useState(null);

    const faqs = [
        {
            question: "Wie lade ich eine Nebenkostenabrechnung hoch?",
            answer: "Gehen Sie auf 'Nebenkosten prüfen' und klicken Sie auf die Upload-Zone. Sie können PDF-Dateien oder Fotos (JPG, PNG) hochladen. Die KI analysiert automatisch alle Kostenposten und rechtlichen Aspekte."
        },
        {
            question: "Was kostet die Premium-Version?", 
            answer: "Premium kostet €14.99/Monat und bietet unbegrenzte Analysen, PDF-Reports, Musterbriefe und Priority-Support. Sie können jederzeit upgraden oder kündigen."
        },
        {
            question: "Wie kann ich gegen meine Nebenkostenabrechnung Widerspruch einlegen?",
            answer: "Nach der Analyse erhalten Sie einen detaillierten Bericht. Klicken Sie auf 'Widerspruch starten' - unser KI-Assistent erstellt rechtssichere Musterbriefe basierend auf den gefundenen Fehlern."
        },
        {
            question: "Welche Arten von Fehlern kann die KI erkennen?",
            answer: "Unsere KI prüft: Überhöhte Heizkosten, falsche Verteilerschlüssel, nicht umlagefähige Kosten, Formfehler, fehlende Belege und Fristüberschreitungen."
        },
        {
            question: "Ist meine Daten sicher?",
            answer: "Ja, alle Dokumente werden verschlüsselt übertragen und gespeichert. Wir sind DSGVO-konform und verkaufen keine Daten. Sie können Ihre Dokumente jederzeit löschen."
        },
        {
            question: "Kann ich staatliche Förderungen beantragen?",
            answer: "Ja! Unser Förder-Prüfradar analysiert Ihre Lebenssituation und findet automatisch alle Zuschüsse, die Ihnen zustehen - von Wohngeld bis Kindergeld."
        },
        {
            question: "Wie kontaktiere ich den Support?",
            answer: "Premium-Nutzer erhalten Priority-Support per E-Mail (support@staatshilfen.ai) oder über den KI-Assistenten. Free-User können die FAQ nutzen oder eine E-Mail senden."
        }
    ];

    const filteredFAQs = faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFAQToggle = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">Hilfe & Support</h1>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                    Häufige Fragen, Anleitungen und Kontaktmöglichkeiten
                </p>
            </div>

            {/* Search */}
            <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80">
                <CardContent className="p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Durchsuchen Sie häufige Fragen..."
                            className="pl-10 text-base py-3 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
                <Link to={createPageUrl('Assistent')}>
                    <Card className="shadow-lg border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white mb-2">KI-Assistent</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Sofortige Antworten auf Ihre Mietrecht-Fragen
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="shadow-lg border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-2">E-Mail Support</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Schreiben Sie uns bei komplexeren Problemen
                        </p>
                        <a 
                            href="mailto:support@staatshilfen.ai"
                            className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline"
                        >
                            support@staatshilfen.ai
                        </a>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Book className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-2">Rechtsleitfaden</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Umfassende Informationen zu Mietrecht
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* FAQs */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                    <HelpCircle className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    Häufig gestellte Fragen
                </h2>
                <div className="space-y-4">
                    {filteredFAQs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openFAQ === index}
                            onToggle={() => handleFAQToggle(index)}
                        />
                    ))}
                </div>
                
                {filteredFAQs.length === 0 && searchTerm && (
                    <Card className="shadow-md border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80">
                        <CardContent className="p-8 text-center">
                            <Search className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">
                                Keine Ergebnisse gefunden
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Versuchen Sie einen anderen Suchbegriff oder kontaktieren Sie unseren Support.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Contact Info */}
            <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/80 to-blue-50/80 dark:from-slate-800/80 dark:to-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-slate-800 dark:text-white">Weitere Hilfe benötigt?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-400">
                        Wenn Sie Ihre Antwort hier nicht finden, zögern Sie nicht uns zu kontaktieren. 
                        Unser Team hilft Ihnen gerne weiter.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Mail className="w-4 h-4 mr-2" />
                            E-Mail senden
                        </Button>
                        <Link to={createPageUrl('Assistent')}>
                            <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                KI-Assistent nutzen
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}