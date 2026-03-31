import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '@/components/UserProfileContext';
import { generateAIProfileContext } from '@/utils/aiProfileHelper';

export default function AIChatAssistant({ isOpen: externalIsOpen, onClose }) {
    const { t } = useTranslation();
    const { user } = useUserProfile();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);

    // Sync with external control
    useEffect(() => {
        if (externalIsOpen !== undefined) {
            setIsOpen(externalIsOpen);
        }
    }, [externalIsOpen]);

    useEffect(() => {
        const welcomeMessage = user
            ? t('chat.initial', `Hallo ${user.vorname || ''}! 👋\n\nIch bin dein persönlicher Antrags-Assistent. Ich kann:\n\n📋 **Anträge für dich ausfüllen** (Wohngeld, Bürgergeld, etc.)\n🔍 **Dein Profil analysieren** und fehlende Infos finden\n💡 **Fragen beantworten** zu Förderungen\n\nWas möchtest du tun?`)
            : t('chat.initialNoUser', 'Hallo! 👋\nBitte vervollständige dein Profil, damit ich dir helfen kann.');

        setMessages([
            { role: 'assistant', content: welcomeMessage }
        ]);
    }, [t, user]);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Generate profile context for AI
            const profileContext = generateAIProfileContext(user);

            // Enhanced system prompt with profile awareness
            const systemPrompt = `Du bist ein KI-Assistent für deutsche Behördenanträge und Förderungen.

**WICHTIG**: Der User hat ein Profil hochgeladen. Nutze diese Daten, um Formulare auszufüllen:

${profileContext}

**Deine Fähigkeiten**:
1. **Anträge ausfüllen**: Wenn der User einen Antrag hochlädt (PDF), fülle ihn mit den Profildaten aus
2. **Fehlende Daten identifizieren**: Zeige an, welche Felder noch fehlen
3. **Förderungen empfehlen**: Basierend auf dem Profil

**Antwort-Style**:
- Kurz und präzise
- Nutze Emojis sparsam  
- Wenn Profildaten fehlen: Frage gezielt nur nach den fehlenden Feldern
- Wenn alles da ist: Bestätige und biete an, den Antrag auszufüllen

Antworte auf Deutsch.`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || 'DEIN_KEY_HIER_FALLS_LOKAL'}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...messages,
                        userMessage
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 401) {
                    throw new Error(t('chat.configError', 'API-Key fehlt oder ist ungültig. Bitte prüfe deine .env Datei (VITE_OPENAI_API_KEY).'));
                }
                throw new Error(errorData.error?.message || `API Fehler: ${response.status}`);
            }

            const data = await response.json();
            const aiMessage = { role: 'assistant', content: data.choices[0].message.content };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error('Chat Error:', error);
            let errorMessage = t('chat.error', 'Entschuldigung, ich habe gerade Verbindungsprobleme.');

            if (error.message.includes('API-Key')) {
                errorMessage = t('chat.configError', '⚠️ Konfigurationsfehler: Der OpenAI API-Key fehlt oder ist ungültig.');
            }

            setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-16 right-0 w-[350px] md:w-[400px] h-[500px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">{t('chat.title', 'Bürokratie-Lotse')}</h3>
                                    <p className="text-xs text-blue-300 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        {t('chat.online', 'Online')}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => {
                                setIsOpen(false);
                                onClose?.();
                            }} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-white/5">
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10 bg-slate-800/30">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="flex gap-2"
                            >
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={t('chat.placeholder', 'Frag mich etwas...')}
                                    className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus:ring-blue-500"
                                />
                                <Button type="submit" disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-500">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-lg transition-colors ${isOpen ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'
                    }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </motion.button>
        </div>
    );
}
