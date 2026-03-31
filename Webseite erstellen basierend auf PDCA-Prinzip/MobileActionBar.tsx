import { Home, Search, Package, MessageSquare, User, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

export default function MobileActionBar() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/marketplace", icon: Search, label: "Suchen" },
    { path: "/dashboard", icon: Package, label: "Aufträge", auth: true },
    { path: "/messages", icon: MessageSquare, label: "Nachrichten", auth: true, badge: true },
    { path: "/profile", icon: User, label: "Profil", auth: true },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <>
      {/* Mobile Action Bar - Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-lg border-t border-slate-200 z-50 safe-area-pb shadow-lg">
        <div className="flex items-center justify-around h-20 px-2 pb-2">
          {navItems.map((item) => {
            // Skip auth-required items if not authenticated
            if (item.auth && !isAuthenticated) return null;

            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link key={item.path} href={item.path}>
                <button
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 relative ${
                    active
                      ? "bg-blue-50 text-blue-600 shadow-md"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${active ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                  <span className="text-xs mt-0.5 font-semibold">{item.label}</span>
                  {item.badge && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full h-5 w-5 flex items-center justify-center">
                      1
                    </Badge>
                  )}
                </button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Floating Action Button for Sellers */}
      {isAuthenticated && user?.role === "admin" && (
        <Link href="/create-gig">
          <button className="md:hidden fixed bottom-24 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 active:scale-95 z-40">
            <Plus className="h-6 w-6" />
          </button>
        </Link>
      )}
    </>
  );
}

