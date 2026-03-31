import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Plus, Package, ShoppingCart, Star } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const { data: myGigs } = trpc.gigs.myGigs.useQuery();
  const { data: myPurchases } = trpc.orders.myPurchases.useQuery();
  const { data: mySales } = trpc.orders.mySales.useQuery();

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      disputed: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Willkommen, {user?.name || "Nutzer"}!
              </h1>
              <p className="text-slate-600">
                Verwalte deine Gigs, Bestellungen und Verdienste
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/profile">
                <Button variant="outline">Profil</Button>
              </Link>
                <Link href="/create-gig">
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Neuer Gig
                  </Button>
                </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="gigs">Meine Gigs</TabsTrigger>
            <TabsTrigger value="orders">Bestellungen</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktive Gigs</CardTitle>
                  <Package className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{myGigs?.length || 0}</div>
                  <p className="text-xs text-slate-600">
                    {myGigs?.filter((g) => g.active).length || 0} aktiv
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bestellungen</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(myPurchases?.length || 0) + (mySales?.length || 0)}
                  </div>
                  <p className="text-xs text-slate-600">
                    {myPurchases?.filter((o) => o.status === "completed").length || 0} abgeschlossen
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bewertung</CardTitle>
                  <Star className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8</div>
                  <p className="text-xs text-slate-600">basierend auf 12 Bewertungen</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Schnellstart</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/marketplace">
                  <Button variant="outline" className="w-full justify-start">
                    Marketplace erkunden
                  </Button>
                </Link>
                <Link href="/create-gig">
                  <Button variant="outline" className="w-full justify-start">
                    Erstes Gig erstellen
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  Profil bearbeiten
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gigs Tab */}
          <TabsContent value="gigs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Meine Gigs</h2>
              <Link href="/create-gig">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Neuer Gig
                </Button>
              </Link>
            </div>

            {!myGigs || myGigs.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-slate-600 mb-4">
                    Du hast noch keine Gigs erstellt
                  </p>
                  <Link href="/create-gig">
                    <Button>Erstes Gig erstellen</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myGigs.map((gig) => (
                  <Card key={gig.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{gig.title}</h3>
                          <p className="text-sm text-slate-600 mb-3">
                            {gig.description.substring(0, 100)}...
                          </p>
                          <div className="flex gap-4 text-sm">
                            <span className="text-slate-600">
                              €{(gig.price / 100).toFixed(2)}
                            </span>
                            <span className="text-slate-600">
                              {gig.completedOrders} Bestellungen
                            </span>
                            {gig.averageRating && (
                              <span className="text-slate-600">
                                ⭐ {parseFloat(gig.averageRating.toString()).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              gig.active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {gig.active ? "Aktiv" : "Inaktiv"}
                          </span>
                          <Button variant="outline" size="sm">
                            Bearbeiten
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Tabs defaultValue="purchases" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="purchases">Meine Käufe</TabsTrigger>
                <TabsTrigger value="sales">Meine Verkäufe</TabsTrigger>
              </TabsList>

              {/* Purchases */}
              <TabsContent value="purchases" className="space-y-4 mt-6">
                {!myPurchases || myPurchases.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-slate-600 mb-4">
                        Du hast noch keine Gigs gekauft
                      </p>
                      <Link href="/marketplace">
                        <Button>Marketplace erkunden</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  myPurchases.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold mb-2">Bestellung {order.id.substring(0, 8)}</h3>
                            <div className="space-y-1 text-sm text-slate-600">
                              <p>€{(order.totalPrice / 100).toFixed(2)}</p>
                              <p>Erstellt: {order.createdAt ? new Date(order.createdAt).toLocaleDateString("de-DE") : "N/A"}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status || "pending")}`}>
                            {order.status === "pending" && "Ausstehend"}
                            {order.status === "in_progress" && "In Bearbeitung"}
                            {order.status === "completed" && "Abgeschlossen"}
                            {order.status === "cancelled" && "Storniert"}
                            {order.status === "disputed" && "Umstritten"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Sales */}
              <TabsContent value="sales" className="space-y-4 mt-6">
                {!mySales || mySales.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-slate-600 mb-4">
                        Du hast noch keine Gigs verkauft
                      </p>
                      <Link href="/create-gig">
                        <Button>Gig erstellen</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  mySales.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold mb-2">Bestellung {order.id.substring(0, 8)}</h3>
                            <div className="space-y-1 text-sm text-slate-600">
                              <p>€{(order.totalPrice / 100).toFixed(2)}</p>
                              <p>Erstellt: {order.createdAt ? new Date(order.createdAt).toLocaleDateString("de-DE") : "N/A"}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status || "pending")}`}>
                            {order.status === "pending" && "Ausstehend"}
                            {order.status === "in_progress" && "In Bearbeitung"}
                            {order.status === "completed" && "Abgeschlossen"}
                            {order.status === "cancelled" && "Storniert"}
                            {order.status === "disputed" && "Umstritten"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

