import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Nachricht gesendet!', {
        description: 'Wir melden uns schnellstmöglich bei dir.'
      });
      
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Fehler beim Senden', {
        description: 'Bitte versuche es später erneut.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 md:pt-32 pb-16 md:pb-24">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Kontakt
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Hast du Fragen oder benötigst Unterstützung? Wir sind für dich da.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-card rounded-2xl p-8 border border-border">
                <h2 className="text-2xl font-bold mb-6">Schreib uns</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Dein Name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      E-Mail
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="deine@email.de"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Betreff
                    </label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Worum geht es?"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Nachricht
                    </label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Deine Nachricht..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      'Wird gesendet...'
                    ) : (
                      <>
                        <Send className="mr-2 w-4 h-4" />
                        Nachricht senden
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-8">
                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h2 className="text-2xl font-bold mb-6">Kontaktinformationen</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">E-Mail</h3>
                        <a href="mailto:support@mimicheck.ai" className="text-muted-foreground hover:text-primary">
                          support@mimicheck.ai
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Telefon</h3>
                        <a href="tel:+4912345678" className="text-muted-foreground hover:text-primary">
                          +49 (0) 123 456 78
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Adresse</h3>
                        <p className="text-muted-foreground">
                          MiMiCheck GmbH<br />
                          Musterstraße 123<br />
                          12345 Musterstadt
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20">
                  <h3 className="font-semibold mb-3">Öffnungszeiten Support</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Montag - Freitag</span>
                      <span className="font-medium">9:00 - 18:00 Uhr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Samstag</span>
                      <span className="font-medium">10:00 - 14:00 Uhr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sonntag</span>
                      <span className="font-medium">Geschlossen</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
