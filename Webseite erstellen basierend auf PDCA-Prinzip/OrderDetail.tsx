import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  FileText,
  Upload,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function OrderDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [revisionRequest, setRevisionRequest] = useState("");

  const { data: order, isLoading } = trpc.orders.getById.useQuery({ id: id! });

  const acceptDeliveryMutation = trpc.orders.acceptDelivery.useMutation({
    onSuccess: () => {
      toast.success("Lieferung akzeptiert!");
    },
  });

  const requestRevisionMutation = trpc.orders.requestRevision.useMutation({
    onSuccess: () => {
      toast.success("Revision angefordert!");
      setRevisionRequest("");
    },
  });

  const openDisputeMutation = trpc.orders.openDispute.useMutation({
    onSuccess: () => {
      toast.success("Streitfall eröffnet!");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-600 mb-4">Auftrag nicht gefunden</p>
            <Button onClick={() => setLocation("/dashboard")}>
              Zurück zum Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string | null) => {
    const statusConfig = {
      pending: { label: "Ausstehend", color: "bg-amber-100 text-amber-800" },
      in_progress: { label: "In Arbeit", color: "bg-blue-100 text-blue-800" },
      in_review: { label: "Vorschau", color: "bg-purple-100 text-purple-800" },
      revision: { label: "Revision", color: "bg-orange-100 text-orange-800" },
      completed: { label: "Abgeschlossen", color: "bg-green-100 text-green-800" },
      disputed: { label: "Streitfall", color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const timeline = [
    {
      id: 1,
      title: "Auftrag erstellt",
      description: "Briefing eingereicht",
      timestamp: order.createdAt,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      id: 2,
      title: "In Bearbeitung",
      description: "Verkäufer hat begonnen",
      timestamp: order.createdAt,
      icon: Clock,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <button onClick={() => setLocation("/dashboard")} className="hover:text-blue-600">
            Dashboard
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-900 font-medium">Auftrag #{order.id.slice(0, 8)}</span>
        </div>

        {/* Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Auftrag #{order.id.slice(0, 8)}
                </h1>
                <p className="text-slate-600">Gig ID: {order.gigId}</p>
              </div>
              {getStatusBadge(order.status)}
            </div>

            <Separator className="my-4" />

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Preis</p>
                <p className="text-xl font-bold text-blue-600">{Number(order.totalPrice)}€</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Erstellt am</p>
                <p className="font-semibold text-slate-900">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString("de-DE") : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Status</p>
                <p className="font-semibold text-slate-900">
                  {order.status || "Ausstehend"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Tabs */}
          <div className="lg:col-span-2">
            <Card>
              <Tabs defaultValue="timeline" className="w-full">
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="timeline">
                      <Clock className="h-4 w-4 mr-2" />
                      Timeline
                    </TabsTrigger>
                    <TabsTrigger value="files">
                      <FileText className="h-4 w-4 mr-2" />
                      Dateien
                    </TabsTrigger>
                    <TabsTrigger value="communication">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Kommunikation
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent>
                  {/* Timeline Tab */}
                  <TabsContent value="timeline" className="space-y-4">
                    <div className="relative">
                      {timeline.map((event, index) => (
                        <div key={event.id} className="flex gap-4 pb-8 last:pb-0">
                          <div className="relative">
                            <div
                              className={`w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center ${event.color}`}
                            >
                              <event.icon className="h-5 w-5" />
                            </div>
                            {index < timeline.length - 1 && (
                              <div className="absolute left-5 top-10 w-0.5 h-full bg-slate-200" />
                            )}
                          </div>
                          <div className="flex-1 pt-1">
                            <h4 className="font-semibold text-slate-900 mb-1">
                              {event.title}
                            </h4>
                            <p className="text-sm text-slate-600 mb-1">
                              {event.description}
                            </p>
                            <p className="text-xs text-slate-500">
                              {event.timestamp
                                ? new Date(event.timestamp).toLocaleString("de-DE")
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Files Tab */}
                  <TabsContent value="files" className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Briefing</h4>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm text-slate-700 whitespace-pre-line">
                          {order.buyerMessage || "Kein Briefing vorhanden"}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Deliverables</h4>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">
                          Noch keine Dateien hochgeladen
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Communication Tab */}
                  <TabsContent value="communication" className="space-y-4">
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            K
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900 mb-1">
                              Käufer
                            </p>
                            <p className="text-sm text-slate-700">
                              {order.buyerMessage || "Keine Nachricht"}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleString("de-DE")
                                : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Textarea
                        placeholder="Nachricht schreiben..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                      />
                      <Button className="mt-2 w-full" disabled={!message}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Nachricht senden
                      </Button>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar - Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Actions Card */}
              {order.status === "in_progress" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Abnahme</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={() => acceptDeliveryMutation.mutate({ orderId: order.id })}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Lieferung akzeptieren
                    </Button>

                    <div className="space-y-2">
                      <Textarea
                        placeholder="Revisionswunsch beschreiben..."
                        value={revisionRequest}
                        onChange={(e) => setRevisionRequest(e.target.value)}
                        rows={3}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          requestRevisionMutation.mutate({
                            orderId: order.id,
                            reason: revisionRequest,
                          })
                        }
                        disabled={!revisionRequest}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Revision anfordern
                      </Button>
                    </div>

                    <Separator />

                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() =>
                        openDisputeMutation.mutate({
                          orderId: order.id,
                          reason: "Unzufrieden mit Lieferung",
                        })
                      }
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Streitfall eröffnen
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Wichtige Hinweise</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>Geld wird erst nach Abnahme ausgezahlt</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p>Bei Streitfall vermittelt Flinkly</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p>Automatische Abnahme nach 7 Tagen</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

