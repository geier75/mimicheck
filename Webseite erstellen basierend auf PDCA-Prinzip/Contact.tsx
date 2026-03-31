import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual form submission via tRPC
    toast.success("Nachricht gesendet! Wir melden uns in Kürze bei dir.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">← Zurück</Button>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Kontakt</h1>
          <p className="text-lg text-slate-600">
            Wir sind für dich da – schreib uns!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <Mail className="h-10 w-10 text-blue-600 mb-4" />
              <CardTitle>E-Mail Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Schreib uns eine E-Mail und wir antworten innerhalb von 24 Stunden.
              </p>
              <a href="mailto:support@flinkly.de" className="text-blue-600 hover:underline">
                support@flinkly.de
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-green-600 mb-4" />
              <CardTitle>Live Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Mo-Fr 9:00-18:00 Uhr stehen wir dir im Live Chat zur Verfügung.
              </p>
              <Button variant="outline" className="w-full">Chat starten</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <HelpCircle className="h-10 w-10 text-purple-600 mb-4" />
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Viele Antworten findest du bereits in unseren häufig gestellten Fragen.
              </p>
              <Link href="/faq">
                <Button variant="outline" className="w-full">Zum FAQ</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Kontaktformular</CardTitle>
              <p className="text-slate-600">
                Fülle das Formular aus und wir melden uns schnellstmöglich bei dir.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Dein Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="deine@email.de"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Betreff *</Label>
                  <Input
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Worum geht es?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Nachricht *</Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Beschreibe dein Anliegen..."
                    rows={6}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Nachricht senden
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Weitere Informationen</h2>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Geschäftszeiten</h3>
              <p className="text-sm text-slate-600">
                Montag - Freitag: 9:00 - 18:00 Uhr<br />
                Samstag - Sonntag: Geschlossen
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Antwortzeit</h3>
              <p className="text-sm text-slate-600">
                E-Mail: Innerhalb von 24 Stunden<br />
                Live Chat: Sofort (während Geschäftszeiten)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

