import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Onboarding from "./components/Onboarding";
import GlobalHeader from "./components/GlobalHeader";
import MobileActionBar from "./components/MobileActionBar";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/Dashboard";
import GigDetail from "./pages/GigDetail";
import CreateGig from "./pages/CreateGig";
import EditGig from "./pages/EditGig";
import Profile from "./pages/Profile";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Impressum from "./pages/Impressum";
import OrderDetail from "./pages/OrderDetail";
import Settings from "./pages/Settings";
import Checkout from "./pages/Checkout";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Messages from "./pages/Messages";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/marketplace"} component={Marketplace} />
      <Route path={"/gig/:id"} component={GigDetail} />
      <Route path={"/checkout/:id"} component={Checkout} />
      <Route path="/create-gig" component={CreateGig} />
      <Route path="/edit-gig/:id" component={EditGig} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/seller-dashboard"} component={SellerDashboard} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/order/:id"} component={OrderDetail} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/messages"} component={Messages} />
      <Route path={"/about"} component={About} />
      <Route path={"/how-it-works"} component={HowItWorks} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/impressum"} component={Impressum} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <GlobalHeader />
          <Onboarding />
          <Router />
          <MobileActionBar />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

