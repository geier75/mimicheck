import { useState, useEffect, useRef } from 'react';
import { Abrechnung } from '@/api/entities';
import { User } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, User as UserIcon, Loader2, Download, Check, AlertTriangle } from 'lucide-react';

export default function DigitalerAntragsAssistent({ abrechnungId, onFinish }) {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [agentState, setAgentState] = useState('initial');
    const [context, setContext] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const scrollToBottom = () => {
            // Defer scroll to after React has committed DOM changes
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 0);
        };
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const loadContext = async () => {
            try {
                const [abrechnungData, userData] = await Promise.all([
                    Abrechnung.get(abrechnungId),
                    User.me()
                ]);
                setContext({ abrechnung: abrechnungData, user: userData });
                addMessage('agent', `Hallo ${userData.full_name}! Ich helfe Ihnen jetzt, Widerspruch gegen die Nebenkostenabrechnung für das Objekt ${abrechnungData.objekt_adresse} einzulegen.`, 'text');
                addMessage('agent', `Ihre bei uns hinterlegten Daten sind:
- Name: ${userData.full_name}
- Adresse: ${userData.lebenssituation?.plz || 'Keine PLZ hinterlegt'}

Sind diese Angaben korrekt und sollen für den Widerspruch verwendet werden?`, 'confirmation_request', { nextState: 'confirm_objection_points' });
                setIsLoading(false);
            } catch (error) {
                addMessage('agent', 'Ein Fehler ist aufgetreten. Ich konnte die notwendigen Daten nicht laden.', 'error');
                setIsLoading(false);
            }
        };
        loadContext();
    }, [abrechnungId]);

    const addMessage = (sender, content, type = 'text', data = {}) => {
        setMessages(prev => [...prev, { sender, content, type, data }]);
    };

    const handleUserResponse = (response) => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.type !== 'confirmation_request') return;

        addMessage('user', response, 'text');
        
        if (response === 'Ja') {
            setAgentState(lastMessage.data.nextState);
            runAgentTurn(lastMessage.data.nextState);
        } else {
            addMessage('agent', 'Bitte korrigieren Sie Ihre Daten unter "Meine Lebenslage" und starten Sie den Assistenten erneut.', 'error');
        }
    };

    const runAgentTurn = async (currentState) => {
        switch (currentState) {
            case 'confirm_objection_points': {
                const fehler = context.abrechnung.analyse_ergebnis.fehler.map(f => `- ${f.kategorie} (${f.betrag.toFixed(2)}€)`).join('\n');
                addMessage('agent', `Folgende Widerspruchspunkte habe ich aus dem Prüfbericht identifiziert:
${fehler}
Sollen diese Punkte im Widerspruch aufgeführt werden?`, 'confirmation_request', { nextState: 'request_iban' });
                break;
            }
            case 'request_iban': {
                 addMessage('agent', `Um die Rückerstattung zu erhalten, benötigt die Hausverwaltung Ihre Bankverbindung. Bitte geben Sie Ihre IBAN an.`, 'input_iban');
                 break;
            }
            case 'generate_letter': {
                setIsLoading(true);
                addMessage('agent', `Vielen Dank. Ich formuliere jetzt den Widerspruchsbrief für Sie. Dies kann einen Moment dauern...`, 'loading');

                const prompt = `
                Erstelle ein formelles, rechtssicheres Widerspruchsschreiben für eine Nebenkostenabrechnung.
                Absender:
                ${context.user.full_name}, ${context.user.lebenssituation.plz}

                Empfänger:
                ${context.abrechnung.verwalter}

                Betreff:
                Widerspruch gegen die Nebenkostenabrechnung für ${context.abrechnung.abrechnungszeitraum}, Objekt: ${context.abrechnung.objekt_adresse}

                Inhalt:
                - Höfliche Einleitung und Bezugnahme auf die erhaltene Abrechnung.
                - Auflistung der Widerspruchspunkte mit Beträgen: ${JSON.stringify(context.abrechnung.analyse_ergebnis.fehler)}
                - Berufung auf § 556 BGB.
                - Aufforderung zur Korrektur und Erstattung des Differenzbetrags von ${context.abrechnung.rueckforderung_potential.toFixed(2)}€ auf die IBAN: ${context.iban}.
                - Fristsetzung von 4 Wochen.
                - Formeller Gruß.
                `;

                try {
                    const letter = await InvokeLLM({ prompt });
                    addMessage('agent', 'Hier ist der Entwurf Ihres Widerspruchs:', 'text');
                    addMessage('agent', letter, 'document');
                    addMessage('agent', 'Bitte prüfen Sie den Entwurf. Wenn alles korrekt ist, können Sie das Dokument herunterladen.', 'final_action');
                    setIsLoading(false);
                } catch(e) {
                    addMessage('agent', 'Es gab einen Fehler bei der Erstellung des Dokuments.', 'error');
                    setIsLoading(false);
                }
                break;
            }
        }
    };
    
    const handleIbanSubmit = (e) => {
        e.preventDefault();
        const iban = e.target.iban.value;
        if(iban) {
            setContext(prev => ({ ...prev, iban }));
            addMessage('user', `Meine IBAN ist: ${iban}`, 'text');
            setAgentState('generate_letter');
            runAgentTurn('generate_letter');
        }
    };
    
    const downloadDocument = () => {
        const documentMessage = messages.find(m => m.type === 'document');
        if (documentMessage) {
            // Create a text file download instead of PDF for now
            const element = document.createElement('a');
            const file = new Blob([documentMessage.content], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = `Widerspruch_${context.abrechnung.abrechnungszeitraum}.txt`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            
            // Update status
            Abrechnung.update(abrechnungId, { widerspruchs_status: 'abgeschlossen' });
            addMessage('agent', 'Dokument wurde heruntergeladen. Der Prozess ist nun abgeschlossen.', 'final');
        }
    };

    return (
        <Card className="shadow-2xl border-purple-200/50">
            <CardContent className="p-0">
                <div ref={messagesEndRef} className="p-6 h-[60vh] overflow-y-auto space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'agent' && <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0"><Bot className="w-6 h-6 text-white" /></div>}
                            <div className={`p-4 rounded-2xl max-w-xl ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
                                {msg.type === 'loading' ? 
                                    <div className="flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> <span>{msg.content}</span></div> :
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                }
                                {msg.type === 'confirmation_request' && (
                                    <div className="mt-4 flex gap-2">
                                        <Button size="sm" onClick={() => handleUserResponse('Ja')}>Ja, korrekt</Button>
                                        <Button size="sm" variant="outline" onClick={() => handleUserResponse('Nein')}>Nein, korrigieren</Button>
                                    </div>
                                )}
                                 {msg.type === 'input_iban' && (
                                    <form onSubmit={handleIbanSubmit} className="mt-4 flex gap-2">
                                        <input name="iban" placeholder="Ihre IBAN" className="p-2 rounded border" />
                                        <Button size="sm" type="submit">Bestätigen</Button>
                                    </form>
                                )}
                                {msg.type === 'final_action' && (
                                    <div className="mt-4">
                                        <Button onClick={downloadDocument}><Download className="w-4 h-4 mr-2" /> Dokument herunterladen</Button>
                                    </div>
                                )}
                                {msg.type === 'final' && (
                                    <div className="mt-4 flex items-center gap-2 text-green-600 font-semibold">
                                        <Check className="w-4 h-4" /> Prozess abgeschlossen.
                                    </div>
                                )}
                                {msg.type === 'error' && (
                                    <div className="mt-4 flex items-center gap-2 text-red-600 font-semibold">
                                        <AlertTriangle className="w-4 h-4" /> {msg.content}
                                    </div>
                                )}
                            </div>
                            {msg.sender === 'user' && <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0"><UserIcon className="w-6 h-6 text-slate-600" /></div>}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}