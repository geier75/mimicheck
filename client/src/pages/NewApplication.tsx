import { useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

const applicationTypes = [
  { value: 'wohngeld', label: 'Wohngeld', description: 'Bis zu 3.600€/Jahr für Miete oder Eigentum' },
  { value: 'kindergeld', label: 'Kindergeld & Zuschlag', description: '250€/Kind + bis zu 292€ Zuschlag' },
  { value: 'bafoeg', label: 'BAföG', description: 'Bis zu 934€/Monat für Studium oder Ausbildung' },
  { value: 'elterngeld', label: 'Elterngeld', description: '65-100% Nettoeinkommen, bis 1.800€/Monat' },
  { value: 'other', label: 'Sonstiges', description: 'Andere Förderungen und Leistungen' },
] as const;

type ApplicationType = typeof applicationTypes[number]['value'];

export default function NewApplication() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<ApplicationType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation('/auth');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !title.trim()) return;

    setSubmitting(true);
    try {
      // Get the public.users.id for the current auth user
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (profileError || !profile) throw new Error('Benutzerprofil nicht gefunden');

      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: profile.id,
          type: selectedType,
          title: title.trim(),
          description: description.trim() || null,
          status: 'draft',
        });

      if (error) throw error;

      toast.success('Antrag erstellt', {
        description: 'Du kannst jetzt Dokumente hochladen.',
      });
      setLocation('/dashboard');
    } catch (err: any) {
      toast.error('Fehler beim Erstellen', {
        description: err?.message || 'Bitte versuche es erneut.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container py-12 max-w-2xl">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Dashboard
        </a>

        <h1 className="text-3xl font-bold tracking-tight mb-2">Neuer Förderantrag</h1>
        <p className="text-muted-foreground mb-8">
          Wähle die Art der Förderung und beschreibe deinen Antrag.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Art der Förderung</label>
            <div className="grid gap-3 sm:grid-cols-2">
              {applicationTypes.map((type) => (
                <Card
                  key={type.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedType === type.value
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setSelectedType(type.value);
                    if (!title) setTitle(`${type.label} Antrag`);
                  }}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{type.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Titel des Antrags
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Wohngeld Antrag 2026"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Beschreibung (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Zusätzliche Informationen zu deinem Antrag..."
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              rows={4}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={!selectedType || !title.trim() || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird erstellt...
                </>
              ) : (
                'Antrag erstellen'
              )}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => setLocation('/dashboard')}>
              Abbrechen
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
