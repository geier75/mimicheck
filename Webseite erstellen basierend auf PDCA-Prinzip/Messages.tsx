import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Messages() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Anmeldung erforderlich</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">
              Bitte melde dich an, um deine Nachrichten zu sehen.
            </p>
            <a href={getLoginUrl()}>
              <Button className="w-full">Jetzt anmelden</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Nachrichten</h1>
          </div>

          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  Noch keine Nachrichten
                </h2>
                <p className="text-slate-600 mb-6">
                  Wenn du einen Auftrag erstellst oder einen Gig anbietest, kannst du hier mit
                  Käufern und Verkäufern chatten.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setLocation("/marketplace")}>
                    Gigs durchsuchen
                  </Button>
                  <Button variant="outline" onClick={() => setLocation("/create-gig")}>
                    Gig anbieten
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

