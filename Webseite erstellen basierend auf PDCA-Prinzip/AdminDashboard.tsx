import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Users, 
  Package, 
  AlertTriangle,
  TrendingUp,
  FileText,
  DollarSign,
  Search,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Download
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Mock platform stats
  const platformStats = {
    totalUsers: 1247,
    activeGigs: 342,
    totalOrders: 1893,
    totalRevenue: 94650,
    disputeRate: 3.2,
    avgRating: 4.6,
    newUsersToday: 23,
    ordersToday: 47,
  };

  // Mock pending moderation items
  const [pendingGigs] = useState([
    {
      id: "1",
      title: "Logo Design Premium",
      seller: "Anna Designer",
      price: 250,
      status: "pending",
      flagged: false,
      createdAt: new Date("2025-10-20"),
    },
    {
      id: "2",
      title: "SEO Optimization",
      seller: "Max Marketing",
      price: 180,
      status: "pending",
      flagged: true,
      flagReason: "Verdächtige Keywords",
      createdAt: new Date("2025-10-20"),
    },
  ]);

  // Mock disputes
  const [disputes] = useState([
    {
      id: "1",
      orderId: "ORD-123",
      gigTitle: "Logo Design",
      buyer: "Peter K.",
      seller: "Anna D.",
      reason: "Lieferung entspricht nicht dem Briefing",
      status: "open",
      createdAt: new Date("2025-10-19"),
      priority: "high",
    },
    {
      id: "2",
      orderId: "ORD-124",
      gigTitle: "Social Media Bundle",
      buyer: "Maria S.",
      seller: "Tom M.",
      reason: "Verspätete Lieferung",
      status: "in_mediation",
      createdAt: new Date("2025-10-18"),
      priority: "medium",
    },
  ]);

  // Mock compliance reports
  const [complianceReports] = useState([
    {
      id: "1",
      type: "AVV",
      count: 234,
      status: "archived",
    },
    {
      id: "2",
      type: "Rechnungen",
      count: 1893,
      status: "ready",
    },
    {
      id: "3",
      type: "Umsatzreport DE",
      count: 1247,
      status: "ready",
    },
  ]);

  const handleApproveGig = (gigId: string) => {
    toast.success("Gig genehmigt!");
    // TODO: Implement via tRPC
  };

  const handleRejectGig = (gigId: string) => {
    toast.error("Gig abgelehnt!");
    // TODO: Implement via tRPC
  };

  const handleResolveDispute = (disputeId: string, resolution: string) => {
    toast.success(`Streitfall gelöst: ${resolution}`);
    // TODO: Implement via tRPC
  };

  const handleExportReport = (reportType: string) => {
    toast.info(`Export wird vorbereitet: ${reportType}`);
    // TODO: Implement via tRPC
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Anmeldung erforderlich</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              Bitte melde dich an, um auf das Admin-Dashboard zuzugreifen.
            </p>
            <Button onClick={() => setLocation("/")}>Zur Startseite</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Zugriff verweigert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              Du hast keine Berechtigung, auf das Admin-Dashboard zuzugreifen.
            </p>
            <Button onClick={() => setLocation("/")}>Zur Startseite</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin-Backoffice</h1>
              <p className="text-purple-100">Plattform-Management & Compliance</p>
            </div>
            <Badge className="bg-white text-purple-600 px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              Administrator
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Platform Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Plattform-Übersicht</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Gesamt-Nutzer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">
                      {platformStats.totalUsers.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      +{platformStats.newUsersToday} heute
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Aktive Gigs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">
                      {platformStats.activeGigs}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {pendingGigs.length} warten auf Freigabe
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Gesamt-Umsatz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">
                      {platformStats.totalRevenue.toLocaleString()}€
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      +{platformStats.ordersToday} Bestellungen heute
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Dispute Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">
                      {platformStats.disputeRate}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {disputes.length} aktive Streitfälle
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="moderation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="moderation">
              <Eye className="h-4 w-4 mr-2" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="disputes">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Streitfälle ({disputes.length})
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <FileText className="h-4 w-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gig-Moderation</CardTitle>
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Gigs durchsuchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingGigs.map((gig) => (
                    <div
                      key={gig.id}
                      className={`border rounded-lg p-4 ${
                        gig.flagged ? "border-red-300 bg-red-50" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900">{gig.title}</h3>
                            {gig.flagged && (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Markiert
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            Verkäufer: {gig.seller} • Preis: {gig.price}€
                          </p>
                          {gig.flagged && (
                            <p className="text-sm text-red-600">
                              <strong>Grund:</strong> {gig.flagReason}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-2">
                            Erstellt: {gig.createdAt.toLocaleDateString("de-DE")}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast.info("Gig wird angezeigt...")}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ansehen
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApproveGig(gig.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Genehmigen
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectGig(gig.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Ablehnen
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingGigs.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      Keine ausstehenden Moderationen
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disputes Tab */}
          <TabsContent value="disputes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Streitfall-Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {disputes.map((dispute) => (
                    <div
                      key={dispute.id}
                      className={`border rounded-lg p-4 ${
                        dispute.priority === "high"
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900">
                              {dispute.orderId} - {dispute.gigTitle}
                            </h3>
                            <Badge
                              className={
                                dispute.status === "open"
                                  ? "bg-red-500"
                                  : "bg-orange-500"
                              }
                            >
                              {dispute.status === "open" ? "Offen" : "In Mediation"}
                            </Badge>
                            {dispute.priority === "high" && (
                              <Badge variant="destructive">Hohe Priorität</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            Käufer: {dispute.buyer} • Verkäufer: {dispute.seller}
                          </p>
                          <p className="text-sm text-slate-900">
                            <strong>Grund:</strong> {dispute.reason}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            Erstellt: {dispute.createdAt.toLocaleDateString("de-DE")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-slate-200">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.info("Details werden geladen...")}
                        >
                          Details ansehen
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            handleResolveDispute(dispute.id, "Vollständige Rückerstattung")
                          }
                        >
                          Rückerstattung
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            handleResolveDispute(dispute.id, "Neue Revision")
                          }
                        >
                          Neue Revision
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            handleResolveDispute(dispute.id, "Teilrückerstattung")
                          }
                        >
                          Teilrückerstattung
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance-Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {complianceReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{report.type}</p>
                          <p className="text-sm text-slate-600">
                            {report.count} Einträge
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportReport(report.type)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>DSGVO-Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">AVV-Archiv</p>
                        <p className="text-sm text-green-700">234 Vereinbarungen</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Ansehen
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-900">Datenlöschungen</p>
                        <p className="text-sm text-blue-700">12 ausstehend</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Bearbeiten
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="font-semibold text-slate-900">Audit-Log</p>
                        <p className="text-sm text-slate-700">Alle Aktionen protokolliert</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Log ansehen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Umsatzreports (DACH)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {["Deutschland", "Österreich", "Schweiz"].map((country) => (
                    <div
                      key={country}
                      className="border border-slate-200 rounded-lg p-4"
                    >
                      <p className="font-semibold text-slate-900 mb-2">{country}</p>
                      <p className="text-2xl font-bold text-slate-900 mb-3">
                        {Math.floor(Math.random() * 50000 + 20000).toLocaleString()}€
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-1" />
                        Monatsbericht
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plattform-KPIs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Time-to-First-Gig</span>
                    <span className="font-semibold text-green-600">18h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Fulfillment-Rate</span>
                    <span className="font-semibold text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Durchschn. Bewertung</span>
                    <span className="font-semibold text-yellow-600">
                      {platformStats.avgRating} ⭐
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">NPS-Score</span>
                    <span className="font-semibold text-green-600">62</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top-Kategorien</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Logo Design", orders: 234, revenue: 35100 },
                    { name: "Social Media", orders: 189, revenue: 15120 },
                    { name: "SEO", orders: 156, revenue: 31200 },
                    { name: "Content Writing", orders: 142, revenue: 14200 },
                  ].map((cat, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-900">{cat.name}</p>
                        <p className="text-sm text-slate-600">{cat.orders} Bestellungen</p>
                      </div>
                      <span className="font-semibold text-green-600">
                        {cat.revenue.toLocaleString()}€
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

