import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import Navbar from '@/components/Navbar';

interface Application {
  id: string;
  user_id: string;
  type: 'wohngeld' | 'kindergeld' | 'bafoeg' | 'elterngeld' | 'other';
  status: 'draft' | 'submitted' | 'processing' | 'approved' | 'rejected';
  title: string;
  description: string | null;
  estimated_amount: number | null;
  created_at: string;
  updated_at: string;
}

const statusColors = {
  draft: 'bg-gray-500',
  submitted: 'bg-blue-500',
  processing: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
};

const statusLabels = {
  draft: 'Entwurf',
  submitted: 'Eingereicht',
  processing: 'In Bearbeitung',
  approved: 'Bewilligt',
  rejected: 'Abgelehnt',
};

const typeLabels = {
  wohngeld: 'Wohngeld',
  kindergeld: 'Kindergeld',
  bafoeg: 'BAföG',
  elterngeld: 'Elterngeld',
  other: 'Sonstiges',
};

export default function SupabaseDashboard() {
  const { user, loading: authLoading, signOut } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/auth');
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setLocation('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = {
    total: applications.length,
    processing: applications.filter(a => a.status === 'processing').length,
    approved: applications.filter(a => a.status === 'approved').length,
    estimatedTotal: applications
      .filter(a => a.estimated_amount)
      .reduce((sum, a) => sum + (a.estimated_amount || 0), 0) / 100,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Meine Förderanträge</h1>
            <p className="text-muted-foreground mt-2">
              Willkommen zurück, {user.email}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/new">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Neuer Antrag
              </Button>
            </Link>
            <Button variant="outline" onClick={handleSignOut}>
              Abmelden
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Alle Anträge</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Bearbeitung</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processing}</div>
              <p className="text-xs text-muted-foreground">Werden geprüft</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bewilligt</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">Erfolgreich</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Geschätzte Förderung</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.estimatedTotal}€</div>
              <p className="text-xs text-muted-foreground">Pro Monat</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Alle Anträge</h2>

          {applications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Noch keine Anträge</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  Erstelle deinen ersten Förderantrag und lass die KI dir helfen, alle Felder korrekt auszufüllen.
                </p>
                <Link href="/dashboard/new">
                  <Button size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Ersten Antrag erstellen
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {applications.map((app) => (
                <Link key={app.id} href={`/dashboard/application/${app.id}`}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg">{app.title}</CardTitle>
                          <CardDescription>
                            {typeLabels[app.type]}
                          </CardDescription>
                        </div>
                        <Badge className={statusColors[app.status]}>
                          {statusLabels[app.status]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {app.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {app.description}
                        </p>
                      )}
                      {app.estimated_amount && (
                        <div className="flex items-center gap-2 text-sm mb-3">
                          <span className="text-muted-foreground">Geschätzt:</span>
                          <span className="font-semibold text-emerald-600">
                            {app.estimated_amount / 100}€/Monat
                          </span>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Erstellt: {new Date(app.created_at).toLocaleDateString('de-DE')}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
