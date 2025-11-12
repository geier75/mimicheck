import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import CustomCursor from "./components/CustomCursor";
import LandingPage from "./pages/LandingPage";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SupabaseDashboard from "./pages/SupabaseDashboard";
import NotFound from "./pages/NotFound";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Switch location={location}>
      {/* Landing Page as root */}
      <Route path="/" component={LandingPage} />
      <Route path="/landingpage" component={LandingPage} />
      
      {/* Auth & Contact */}
      <Route path="/auth" component={Auth} />
      <Route path="/contact" component={Contact} />
      
      {/* Dashboard (Protected) */}
      <Route path="/dashboard" component={SupabaseDashboard} />
      <Route path="/dashboard-old" component={Dashboard} />
      
      {/* Legal pages */}
      <Route path="/impressum" component={Impressum} />
      <Route path="/datenschutz" component={Datenschutz} />
      <Route path="/agb" component={AGB} />
      <Route path="/barrierefreiheit" component={() => <LegalPlaceholder title="Barrierefreiheit" />} />
      <Route path="/hilfe" component={() => <LegalPlaceholder title="Hilfe & FAQ" />} />
      <Route path="/ki-transparenz" component={() => <LegalPlaceholder title="KI-Transparenz" />} />
      
      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}

// Placeholder component for legal pages
function LegalPlaceholder({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground mb-8">Diese Seite wird in Kürze verfügbar sein.</p>
        <a href="/" className="text-primary hover:underline">
          Zurück zur Startseite
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <SupabaseAuthProvider>
        <ThemeProvider
          defaultTheme="light"
          switchable
        >
          <TooltipProvider>
            <CustomCursor />
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </SupabaseAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
