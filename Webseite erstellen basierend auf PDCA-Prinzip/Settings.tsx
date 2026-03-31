import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    marketingEmails: false,
    twoFactorAuth: false,
  });

  const handleSaveSettings = () => {
    // TODO: Implement via tRPC
    toast.success("Einstellungen gespeichert!");
  };

  const handleDeleteAccount = () => {
    if (confirm("Möchtest du dein Konto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) {
      // TODO: Implement via tRPC
      toast.success("Konto gelöscht.");
      setLocation("/");
    }
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
              Bitte melde dich an, um auf die Einstellungen zuzugreifen.
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
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">← Zurück zum Dashboard</Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Einstellungen</h1>
          <p className="text-slate-600">Verwalte deine Konto-Einstellungen</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Konto-Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue={user?.name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
                <p className="text-sm text-slate-500">
                  E-Mail-Adresse kann nicht geändert werden
                </p>
              </div>
              <Button>Änderungen speichern</Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">E-Mail-Benachrichtigungen</Label>
                  <p className="text-sm text-slate-500">
                    Erhalte wichtige Updates per E-Mail
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="order-updates">Bestellungs-Updates</Label>
                  <p className="text-sm text-slate-500">
                    Benachrichtigungen über Bestellstatus-Änderungen
                  </p>
                </div>
                <Switch
                  id="order-updates"
                  checked={settings.orderUpdates}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, orderUpdates: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing-emails">Marketing-E-Mails</Label>
                  <p className="text-sm text-slate-500">
                    Erhalte Neuigkeiten und Angebote
                  </p>
                </div>
                <Switch
                  id="marketing-emails"
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, marketingEmails: checked })
                  }
                />
              </div>

              <Button onClick={handleSaveSettings}>Einstellungen speichern</Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle>Sicherheit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">Zwei-Faktor-Authentifizierung</Label>
                  <p className="text-sm text-slate-500">
                    Zusätzliche Sicherheit für dein Konto
                  </p>
                </div>
                <Switch
                  id="two-factor"
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, twoFactorAuth: checked })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Passwort ändern</Label>
                <p className="text-sm text-slate-500 mb-3">
                  Ändere dein Passwort regelmäßig für mehr Sicherheit
                </p>
                <Button variant="outline">Passwort ändern</Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Zahlungsmethoden</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Verwalte deine Zahlungsmethoden für schnellere Transaktionen
              </p>
              <Button variant="outline">Zahlungsmethode hinzufügen</Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Gefahrenbereich</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Konto löschen</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Sobald du dein Konto löschst, gibt es kein Zurück mehr. Bitte sei dir sicher.
                </p>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Konto löschen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

