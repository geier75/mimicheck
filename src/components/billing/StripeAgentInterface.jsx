import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { agentSDK } from "@/agents.js";
import { User } from "@/api/entities";
import { Loader2, Bot, Send, CreditCard, CheckCircle } from 'lucide-react';

/**
 * STRIPE AGENT INTERFACE
 * Ermöglicht Nutzern direkten Chat mit dem Stripe Billing Agent
 */
export default function StripeAgentInterface() {
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);

    // Initialisiere Conversation beim Component Mount
    React.useEffect(() => {
        const init = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);

                // Erstelle neue Conversation mit Stripe Agent
                const newConv = await agentSDK.createConversation({
                    agent_name: "stripe_billing_agent",
                    metadata: {
                        name: "Billing Chat",
                        description: "Stripe Subscription Management"
                    }
                });

                setConversation(newConv);
                setMessages(newConv.messages || []);

                // Subscribe to updates
                const unsubscribe = agentSDK.subscribeToConversation(newConv.id, (data) => {
                    setMessages(data.messages);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error('Failed to initialize agent conversation:', error);
            }
        };

        init();
    }, []);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !conversation) return;

        setIsLoading(true);
        try {
            await agentSDK.addMessage(conversation, {
                role: 'user',
                content: inputMessage
            });

            setInputMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Quick Action Buttons
    const quickActions = [
        {
            label: "Auf Premium upgraden",
            message: "Ich möchte auf Premium upgraden. Was sind die Vorteile und wie funktioniert das?"
        },
        {
            label: "Auf Pro upgraden",
            message: "Ich interessiere mich für den Pro Plan. Welche Zusatz-Features bekomme ich?"
        },
        {
            label: "Abo verwalten",
            message: "Ich möchte mein Abonnement verwalten (ändern oder kündigen)"
        },
        {
            label: "Aktuellen Status prüfen",
            message: "Welchen Plan habe ich aktuell und bis wann läuft er?"
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <CreditCard className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                                Billing Assistent
                            </CardTitle>
                            <p className="text-slate-600 dark:text-slate-300">
                                KI-Agent für Abo-Verwaltung & Upgrades
                            </p>
                        </div>
                        {user && (
                            <Badge className="ml-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none px-4 py-2">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {user.subscription_tier === 'premium' ? 'Premium' : user.subscription_tier === 'pro' ? 'Pro' : 'Free'}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Quick Actions */}
            <Card className="border-none shadow-xl">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Schnellaktionen</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                        {quickActions.map((action, idx) => (
                            <Button
                                key={idx}
                                variant="outline"
                                className="justify-start h-auto py-3 text-left"
                                onClick={() => setInputMessage(action.message)}
                            >
                                <span className="text-sm">{action.label}</span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Chat Messages */}
            <Card className="border-none shadow-xl">
                <CardContent className="p-6">
                    <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                        {messages.length === 0 && (
                            <div className="text-center py-12">
                                <Bot className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                                <p className="text-slate-600 dark:text-slate-400">
                                    Stellen Sie eine Frage oder wählen Sie eine Schnellaktion
                                </p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl ${
                                    msg.role === 'user'
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                }`}>
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl">
                                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="flex gap-2">
                        <Input
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Frage zum Abo oder Upgrade..."
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={isLoading || !inputMessage.trim()}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}