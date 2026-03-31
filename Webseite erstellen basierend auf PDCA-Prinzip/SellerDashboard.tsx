import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Clock,
  AlertTriangle,
  Star,
  CheckCircle,
  Package,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function DraftCard({ gig }: { gig: any }) {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const publishGig = trpc.gigs.publish.useMutation({
    onSuccess: () => {
      toast.success("Gig veroeffentlicht!");
      utils.gigs.myGigs.invalidate();
      utils.gigs.getDrafts.invalidate();
    },
    onError: () => {
      toast.error("Fehler beim Veroeffentlichen");
    },
  });

  const deleteGig = trpc.gigs.delete.useMutation({
    onSuccess: () => {
      toast.success("Entwurf geloescht");
      utils.gigs.getDrafts.invalidate();
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast.error("Fehler beim Loeschen");
    },
  });

  return (
    <Card className="hover:shadow-md transition-shadow border-amber-200 bg-amber-50">
      <CardContent className="pt-6">
        <Badge className="mb-2 bg-amber-600">Entwurf</Badge>
        <h3 className="font-semibold text-slate-900 mb-2">{gig.title}</h3>
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {gig.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-blue-600">
            {(Number(gig.price) / 100).toFixed(2)}EUR
          </span>
          <Badge variant="outline">{gig.category}</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => publishGig.mutate({ id: gig.id })}
            disabled={publishGig.isPending}
          >
            Veroeffentlichen
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:bg-red-50"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Entwurf loeschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Bist du sicher, dass du den Entwurf "{gig.title}" loeschen moechtest?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3">
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteGig.mutate({ id: gig.id })}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteGig.isPending}
              >
                {deleteGig.isPending ? "Loeschen..." : "Entwurf loeschen"}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

function GigCard({ gig }: { gig: any }) {
  const [, setLocation] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const utils = trpc.useUtils();
  const deleteGig = trpc.gigs.delete.useMutation({
    onSuccess: () => {
      toast.success("Gig gelöscht");
      utils.gigs.myGigs.invalidate();
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast.error("Fehler beim Löschen");
    },
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <h3 className="font-semibold text-slate-900 mb-2">{gig.title}</h3>
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {gig.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-blue-600">
            {(Number(gig.price) / 100).toFixed(2)}€
          </span>
          <Badge variant="outline">{gig.category}</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => setLocation(`/gig/${gig.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Bearbeiten
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:bg-red-50"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gig löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Bist du sicher, dass du das Gig "{gig.title}" löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteGig.mutate({ id: gig.id })}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteGig.isPending}
            >
              {deleteGig.isPending ? "Lösche..." : "Gig löschen"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default function SellerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("published");

  const { data: orders = [], isLoading } = trpc.orders.mySales.useQuery();
  const { data: gigs = [] } = trpc.gigs.myGigs.useQuery();
  const { data: drafts = [] } = trpc.gigs.getDrafts.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-600 mb-4">Bitte melde dich an</p>
            <Button onClick={() => setLocation("/")}>Zur Startseite</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate metrics
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const onTimeRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100;
  const firstPassRate = 85;
  const disputeRate = 2;
  const avgRating = 4.8;

  // Kanban columns
  const kanbanColumns = [
    { id: "pending", title: "Neu", status: "pending", icon: Package },
    { id: "in_progress", title: "In Arbeit", status: "in_progress", icon: Clock },
    { id: "completed", title: "Abgeschlossen", status: "completed", icon: CheckCircle },
  ];

  const getOrdersByStatus = (status: string) => {
    return orders.filter((o) => o.status === status);
  };

  const getSLAWarning = (createdAt: Date | null) => {
    if (!createdAt) return null;
    const now = new Date();
    const hoursSinceCreated = (now.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceCreated > 24) {
      return <Badge className="bg-red-100 text-red-800">⚠️ Überfällig</Badge>;
    } else if (hoursSinceCreated > 18) {
      return <Badge className="bg-amber-100 text-amber-800">⏰ Bald fällig</Badge>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Verkäufer-Dashboard</h1>
            <p className="text-slate-600">Verwalte deine Gigs und Aufträge</p>
          </div>
          <Button onClick={() => setLocation("/create-gig")}>
            + Neues Gig erstellen
          </Button>
        </div>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">On-Time Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{onTimeRate}%</p>
                </div>
                <div className={`p-3 rounded-full ${onTimeRate >= 90 ? "bg-green-100" : "bg-amber-100"}`}>
                  <Clock className={`h-6 w-6 ${onTimeRate >= 90 ? "text-green-600" : "text-amber-600"}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">First-Pass Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{firstPassRate}%</p>
                </div>
                <div className={`p-3 rounded-full ${firstPassRate >= 80 ? "bg-green-100" : "bg-amber-100"}`}>
                  <CheckCircle className={`h-6 w-6 ${firstPassRate >= 80 ? "text-green-600" : "text-amber-600"}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Dispute Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{disputeRate}%</p>
                </div>
                <div className={`p-3 rounded-full ${disputeRate <= 5 ? "bg-green-100" : "bg-red-100"}`}>
                  <AlertTriangle className={`h-6 w-6 ${disputeRate <= 5 ? "text-green-600" : "text-red-600"}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Durchschn. Bewertung</p>
                  <p className="text-2xl font-bold text-slate-900">{avgRating}</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100">
                  <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Auftrags-Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {kanbanColumns.map((column) => {
                const columnOrders = getOrdersByStatus(column.status);
                return (
                  <div key={column.id} className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <column.icon className="h-4 w-4 text-slate-600" />
                      <h3 className="font-semibold text-slate-900">{column.title}</h3>
                      <Badge variant="outline" className="ml-auto">
                        {columnOrders.length}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {columnOrders.length === 0 ? (
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                          <p className="text-xs text-slate-500">Keine Aufträge</p>
                        </div>
                      ) : (
                        columnOrders.map((order) => (
                          <Card
                            key={order.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setLocation(`/order/${order.id}`)}
                          >
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                                    Auftrag #{order.id.slice(0, 8)}
                                  </p>
                                  {getSLAWarning(order.createdAt)}
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-slate-600">
                                  <span>{Number(order.totalPrice)}€</span>
                                  <span>
                                    {order.createdAt
                                      ? new Date(order.createdAt).toLocaleDateString("de-DE")
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Gigs Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Meine Gigs</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="published">Veroeffentlicht ({gigs.length})</TabsTrigger>
                <TabsTrigger value="drafts">Entwerfe ({drafts.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="published">
                {gigs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">Du hast noch keine veroeffentlichten Gigs</p>
                    <Button onClick={() => setLocation("/create-gig")}>
                      Erstes Gig erstellen
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {gigs.map((gig) => (
                      <GigCard key={gig.id} gig={gig} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="drafts">
                {drafts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">Du hast noch keine Entwerfe</p>
                    <Button onClick={() => setLocation("/create-gig")}>
                      Neues Gig als Entwurf erstellen
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {drafts.map((gig) => (
                      <DraftCard key={gig.id} gig={gig} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

