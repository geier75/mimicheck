import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";

const statusColors = {
  draft: "bg-gray-500",
  submitted: "bg-blue-500",
  processing: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
};

const statusLabels = {
  draft: "Entwurf",
  submitted: "Eingereicht",
  processing: "In Bearbeitung",
  approved: "Bewilligt",
  rejected: "Abgelehnt",
};

const typeLabels = {
  wohngeld: "Wohngeld",
  kindergeld: "Kindergeld",
  bafoeg: "BAföG",
  elterngeld: "Elterngeld",
  other: "Sonstiges",
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { data: applications, isLoading } = trpc.applications.list.useQuery(undefined, {
    enabled: !!user,
  });

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meine Förderanträge</h1>
            <p className="text-muted-foreground mt-2">
              Verwalte deine Anträge für Wohngeld, Kindergeld, BAföG und mehr
            </p>
          </div>
          <Link href="/dashboard/new">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Neuer Antrag
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Alle Anträge</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Bearbeitung</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications?.filter(a => a.status === "processing").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Werden geprüft</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bewilligt</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications?.filter(a => a.status === "approved").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Erfolgreich</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Geschätzte Förderung</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(applications
                  ?.filter(a => a.estimatedAmount)
                  .reduce((sum, a) => sum + (a.estimatedAmount || 0), 0) || 0) / 100}€
              </div>
              <p className="text-xs text-muted-foreground">Pro Monat</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Alle Anträge</h2>
          
          {!applications || applications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Noch keine Anträge</h3>
                <p className="text-muted-foreground mb-4 text-center max-w-md">
                  Erstelle deinen ersten Förderantrag und lass die KI dir helfen, alle Felder korrekt auszufüllen.
                </p>
                <Link href="/dashboard/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Ersten Antrag erstellen
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {applications.map((app) => (
                <Link key={app.id} href={`/dashboard/application/${app.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg">{app.title}</CardTitle>
                          <CardDescription>
                            {typeLabels[app.type as keyof typeof typeLabels]}
                          </CardDescription>
                        </div>
                        <Badge className={statusColors[app.status as keyof typeof statusColors]}>
                          {statusLabels[app.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {app.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {app.description}
                        </p>
                      )}
                      {app.estimatedAmount && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Geschätzt:</span>
                          <span className="font-semibold text-emerald-600">
                            {app.estimatedAmount / 100}€/Monat
                          </span>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-3">
                        Erstellt: {new Date(app.createdAt).toLocaleDateString("de-DE")}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
