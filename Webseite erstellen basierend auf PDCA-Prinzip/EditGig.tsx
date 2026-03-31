import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLocation, useParams } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function EditGig() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const gigId = params.id;

  const { data: gig, isLoading } = trpc.gigs.getById.useQuery({ id: gigId! });
  const utils = trpc.useUtils();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: 0,
    deliveryDays: 3,
    imageUrl: "",
  });

  useEffect(() => {
    if (gig) {
      setFormData({
        title: gig.title,
        description: gig.description,
        category: gig.category,
        price: Number(gig.price) / 100, // Convert cents to euros
        deliveryDays: gig.deliveryDays,
        imageUrl: gig.imageUrl || "",
      });
    }
  }, [gig]);

  const updateGig = trpc.gigs.update.useMutation({
    onSuccess: () => {
      toast.success("Gig erfolgreich aktualisiert!");
      utils.gigs.myGigs.invalidate();
      setLocation("/seller-dashboard");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

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

  if (!gig) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-600 mb-4">Gig nicht gefunden</p>
            <Button onClick={() => setLocation("/seller-dashboard")}>Zurück</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGig.mutate({
      id: gigId!,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: Math.round(formData.price * 100), // Convert euros to cents
      deliveryDays: formData.deliveryDays,
      imageUrl: formData.imageUrl || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Gig bearbeiten</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  minLength={5}
                  maxLength={255}
                  placeholder="z.B. Professionelles Logo-Design"
                />
              </div>

              <div>
                <Label htmlFor="description">Beschreibung *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  minLength={20}
                  rows={6}
                  placeholder="Beschreibe deine Dienstleistung im Detail..."
                />
              </div>

              <div>
                <Label htmlFor="category">Kategorie *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Kategorie wählen</option>
                  <option value="design">Design</option>
                  <option value="writing">Texterstellung</option>
                  <option value="marketing">Marketing</option>
                  <option value="development">Entwicklung</option>
                  <option value="video">Video & Animation</option>
                  <option value="music">Musik & Audio</option>
                  <option value="business">Business</option>
                  <option value="lifestyle">Lifestyle</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Preis (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                    min={1}
                    max={250}
                    step={0.01}
                    placeholder="z.B. 50"
                  />
                  <p className="text-xs text-slate-500 mt-1">Max. 250€ (Micro-Gigs)</p>
                </div>

                <div>
                  <Label htmlFor="deliveryDays">Lieferzeit (Tage) *</Label>
                  <Input
                    id="deliveryDays"
                    type="number"
                    value={formData.deliveryDays}
                    onChange={(e) => setFormData({ ...formData, deliveryDays: parseInt(e.target.value) })}
                    required
                    min={1}
                    max={30}
                    placeholder="z.B. 3"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Bild-URL (optional)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={updateGig.isPending}
                  className="flex-1"
                >
                  {updateGig.isPending ? "Speichern..." : "Änderungen speichern"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/seller-dashboard")}
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

