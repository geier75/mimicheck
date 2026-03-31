import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, User, Mail, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

const COUNTRIES = [
  { code: "DE", name: "Deutschland" },
  { code: "AT", name: "Österreich" },
  { code: "CH", name: "Schweiz" },
];

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: "",
    country: "DE",
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Authentifizierung erforderlich</h1>
          <p className="text-slate-600 mb-6">Du musst angemeldet sein, um dein Profil zu sehen.</p>
          <Button onClick={() => setLocation("/")}>Zur Startseite</Button>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // In a real app, you would call an API to save the profile
    console.log("Saving profile:", formData);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-900">Mein Profil</h1>
          <p className="text-slate-600">Verwalte deine Profilinformationen</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Profilinformationen</CardTitle>
                <CardDescription>Deine persönlichen Daten</CardDescription>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Bearbeiten
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <>
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Dein Name"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Erzähle uns etwas über dich..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Land */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Land
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Speichern
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-600">Name</p>
                      <p className="font-medium text-slate-900">{formData.name || "Nicht angegeben"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-600">E-Mail</p>
                      <p className="font-medium text-slate-900">{user.email || "Nicht angegeben"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-600">Land</p>
                      <p className="font-medium text-slate-900">
                        {COUNTRIES.find((c) => c.code === formData.country)?.name || "Nicht angegeben"}
                      </p>
                    </div>
                  </div>
                </div>

                {formData.bio && (
                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-sm text-slate-600 mb-2">Bio</p>
                    <p className="text-slate-900">{formData.bio}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Kontoeinstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-3">
                <strong>Benutzer-ID:</strong> {user.id}
              </p>
              <p className="text-sm text-slate-600 mb-3">
                <strong>Rolle:</strong> {user.role === "admin" ? "Administrator" : "Benutzer"}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Anmeldedatum:</strong>{" "}
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString("de-DE") : "N/A"}
              </p>
            </div>

            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full"
            >
              Abmelden
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-700">
              <strong>💡 Hinweis:</strong> Dein Profil wird von anderen Benutzern gesehen, wenn du Gigs
              anbietest oder Bewertungen hinterlässt.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

