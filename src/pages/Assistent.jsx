import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { 
    Bot, 
    Send, 
    Loader2, 
    User as UserIcon,
    Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message, isBot }) => {
    // Sicherheits-Check: Stelle sicher dass message ein String ist
    const messageText = typeof message === 'string' ? message : 
                       typeof message === 'object' ? (message?.content || message?.text || JSON.stringify(message)) :
                       String(message || '');
    
    return (
        <div className={`flex gap-4 ${isBot ? '' : 'flex-row-reverse'} mb-6`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                isBot 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600' 
                    : 'bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-400 dark:to-slate-500'
            }`}>
                {isBot ? (
                    <Bot className="w-5 h-5 text-white" />
                ) : (
                    <UserIcon className="w-5 h-5 text-white dark:text-slate-800" />
                )}
            </div>
            
            <div className={`max-w-3xl px-6 py-4 rounded-2xl shadow-md ${
                isBot 
                    ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-bl-md' 
                    : 'bg-blue-600 dark:bg-blue-700 text-white rounded-br-md'
            }`}>
                {isBot ? (
                    <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
                        <ReactMarkdown 
                            components={{
                                p: ({children}) => <p className="mb-3 last:mb-0 leading-relaxed text-slate-800 dark:text-slate-200">{children}</p>,
                                ul: ({children}) => <ul className="mb-3 ml-4 space-y-1 text-slate-800 dark:text-slate-200">{children}</ul>,
                                li: ({children}) => <li className="text-slate-700 dark:text-slate-300">{children}</li>,
                                strong: ({children}) => <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>,
                                h3: ({children}) => <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 mt-4">{children}</h3>
                            }}
                        >
                            {messageText}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <p className="text-white leading-relaxed">{messageText}</p>
                )}
            </div>
        </div>
    );
};

export default function Assistent() {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [dailyQuestions, setDailyQuestions] = useState(0);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        User.me().then(user => {
            setUser(user);
            setDailyQuestions(user.subscription_tier === 'free' ? 3 : 0);
        }).catch(console.error);

        // Begrüßungsnachricht
        setMessages([{
            text: `👋 Hallo! Ich bin Ihr persönlicher Mietrechts-Assistent. 

Ich helfe Ihnen bei:
• **Nebenkostenabrechnung prüfen** - Finden Sie Fehler und Einsparpotentiale
• **Mietrecht verstehen** - Ihre Rechte und Pflichten als Mieter
• **Widersprüche formulieren** - Professionelle Musterbriefe
• **Staatliche Hilfen** - Welche Zuschüsse stehen Ihnen zu?

**Stellen Sie mir einfach eine Frage!** 🚀`,
            isBot: true
        }]);
    }, []);

    useEffect(() => {
        if (messages.length > 1) {
            // Defer scroll to after React has committed DOM changes
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 0);
        }
    }, [messages]);

    const handleSubmit = async (question = inputText) => {
        if ((!question.trim() && !inputText.trim()) || isLoading) return;
        
        const userQuestion = question || inputText;
        const isFreeUser = user?.subscription_tier === 'free';
        
        if (isFreeUser && dailyQuestions >= 5) {
            alert('Sie haben das Tageslimit von 5 Fragen erreicht. Upgraden Sie auf Premium für unbegrenzte Fragen!');
            return;
        }

        setMessages(prev => [...prev, { text: userQuestion, isBot: false }]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await InvokeLLM({
                prompt: `Du bist ein Experte für deutsches Mietrecht und Nebenkostenabrechnungen. 
                
**Nutzerfrage:** "${userQuestion}"

**Kontext:** Der Nutzer hat ein ${user?.subscription_tier || 'free'} Abonnement.

**Antwort-Stil:**
- Freundlich und verständlich
- Konkrete, umsetzbare Tipps  
- Bei rechtlichen Fragen: Verweis auf Rechtsanwalt für finale Beratung
- Strukturiert mit Aufzählungen oder Schritten
- Deutsch verwenden

Antworte hilfreich und kompetent auf die Frage.`
            });

            // Extract text from response (handles both object and string)
            const responseText = typeof response === 'string' ? response : (response?.content || response?.text || String(response));
            setMessages(prev => [...prev, { text: responseText, isBot: true }]);
            
            if (isFreeUser) {
                setDailyQuestions(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { 
                text: 'Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Frage. Bitte versuchen Sie es erneut.', 
                isBot: true 
            }]);
        }
        
        setIsLoading(false);
    };

    const remainingQuestions = user?.subscription_tier === 'free' ? Math.max(0, 5 - dailyQuestions) : '∞';

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <Card className="border-none shadow-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                            <Bot className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
                        KI-Rechtsassistent
                    </CardTitle>
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        Ihr persönlicher Experte für Mietrecht, Nebenkostenabrechnungen und staatliche Förderungen
                    </p>
                    
                    {/* Usage Counter */}
                    <div className="flex justify-center mt-6">
                        <Badge className={`px-6 py-2 text-base ${
                            user?.subscription_tier === 'free' 
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
                        }`}>
                            {user?.subscription_tier === 'free' ? (
                                <>📊 Noch {remainingQuestions} Fragen heute</>
                            ) : (
                                <>⭐ Unbegrenzte Premium-Fragen</>
                            )}
                        </Badge>
                    </div>

                    {/* Upgrade Prompt for Free Users */}
                    {user?.subscription_tier === 'free' && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/60 dark:border-purple-800/60 max-w-lg mx-auto">
                            <div className="flex items-center gap-2 mb-2 justify-center">
                                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <h4 className="font-bold text-purple-800 dark:text-purple-200">Premium Features</h4>
                            </div>
                            <p className="text-sm text-purple-700 dark:text-purple-300 mb-3 text-center">
                                Unbegrenzte Fragen + Widerspruchs-Generator + Musterbriefe
                            </p>
                            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm py-2 rounded-xl">
                                Ab €14.99 upgraden
                            </Button>
                        </div>
                    )}
                </CardHeader>
            </Card>

            {/* Chat Interface - Full Width */}
            <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-0">
                    {/* Messages */}
                    <div className="h-[600px] overflow-y-auto p-6 space-y-4">
                        {messages.map((message, index) => (
                            <MessageBubble 
                                key={index} 
                                message={message.text} 
                                isBot={message.isBot} 
                            />
                        ))}
                        
                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex gap-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-6 py-4 rounded-2xl rounded-bl-md shadow-md">
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Denke nach...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-slate-200 dark:border-slate-600 p-6">
                        <div className="flex gap-4">
                            <Input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                                placeholder="Stellen Sie mir eine Frage zu Mietrecht oder Nebenkosten..."
                                disabled={isLoading}
                                className="text-base py-3 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400"
                            />
                            <Button 
                                onClick={() => handleSubmit()}
                                disabled={isLoading || !inputText.trim()}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}