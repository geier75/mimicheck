import React, { Suspense, lazy } from 'react';
import Layout from "./Layout.jsx";
import ErrorBoundary from '@/components/ErrorBoundary';
// import CookieBanner from '@/components/ui/CookieBanner';

// ============================================================
// Loading Fallback Komponente
// ============================================================
const LoadingFallback = ({ text = 'Wird geladen...' }) => (
  <div className="flex h-screen bg-slate-950 text-white items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white/60">{text}</p>
    </div>
  </div>
);

// ============================================================
// CRITICAL PATH - Direkte Imports (häufig genutzt)
// ============================================================
import ProfilSeiteSimple from "./ProfilSeiteSimple";
import Upload from "./Upload";
import Assistent from "./Assistent";
import Antraege from "./Antraege";
import AnspruchsAnalyse from "./AnspruchsAnalyse";
import Home from './Home.jsx';
import Auth from './Auth.jsx';

// ============================================================
// LAZY LOADED - Selten genutzte Seiten
// ============================================================
const Abrechnungen = lazy(() => import("./Abrechnungen"));
const Lebenslagen = lazy(() => import("./Lebenslagen"));
const Pruefung = lazy(() => import("./Pruefung"));
const Bericht = lazy(() => import("./Bericht"));
const PdfAusfuellhilfe = lazy(() => import("./PdfAusfuellhilfe"));
const PdfAutofill = lazy(() => import("./PdfAutofill"));
const AntragAssistent = lazy(() => import("./AntragAssistent"));
const AntraegeFinden = lazy(() => import("./AntraegeFinden"));
const WebAssistent = lazy(() => import("./WebAssistent"));

// Legal Pages (selten genutzt)
const Impressum = lazy(() => import("./Impressum"));
const Datenschutz = lazy(() => import("./Datenschutz"));
const AGB = lazy(() => import("./AGB"));
const Hilfe = lazy(() => import("./Hilfe"));
const Pricing = lazy(() => import("./Pricing"));

// Admin/Setup Pages (sehr selten genutzt)
const Implementierungsplan = lazy(() => import("./Implementierungsplan"));
const WohngeldCleanup = lazy(() => import("./WohngeldCleanup"));
const DataCleanupExecution = lazy(() => import("./DataCleanupExecution"));
const FoerderPruefradar = lazy(() => import("./FoerderPruefradar"));
const Datenqualitaet = lazy(() => import("./Datenqualitaet"));
const ProductionReadiness = lazy(() => import("./ProductionReadiness"));
const StripeSetup = lazy(() => import("./StripeSetup"));
const BillingAgent = lazy(() => import("./BillingAgent"));
const BackendSetup = lazy(() => import("./BackendSetup"));
const StripeAutoSetup = lazy(() => import("./StripeAutoSetup"));
const QATests = lazy(() => import("./QATests"));
const LandingPage = lazy(() => import("./LandingPage"));

import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { NotificationProvider } from '@/components/notifications/NotificationContext.jsx';
import Onboarding from './Onboarding';
import { UserProfileProvider, useUserProfile } from '@/components/UserProfileContext.jsx';
import Contact from './Contact.jsx';
import Reports from './Reports.jsx';
import ProtectedRoute from '@/routes/ProtectedRoute.jsx';
import AuthBridge from './AuthBridge.jsx';
import LandingStatic from './LandingStatic.jsx';

const PAGES = {

    ProfilSeite: ProfilSeiteSimple,

    Upload: Upload,

    Abrechnungen: Abrechnungen,

    Assistent: Assistent,

    Lebenslagen: Lebenslagen,

    Pruefung: Pruefung,

    Implementierungsplan: Implementierungsplan,

    WohngeldCleanup: WohngeldCleanup,

    DataCleanupExecution: DataCleanupExecution,

    FoerderPruefradar: FoerderPruefradar,

    Datenqualitaet: Datenqualitaet,

    AntragAssistent: AntragAssistent,

    ProductionReadiness: ProductionReadiness,

    Impressum: Impressum,

    Datenschutz: Datenschutz,

    AGB: AGB,

    Hilfe: Hilfe,

    Bericht: Bericht,

    Pricing: Pricing,

    Antraege: Antraege,

    PdfAusfuellhilfe: PdfAusfuellhilfe,

    LandingPage: LandingPage,

    StripeSetup: StripeSetup,

    BillingAgent: BillingAgent,

    BackendSetup: BackendSetup,

    StripeAutoSetup: StripeAutoSetup,

    QATests: QATests,

    PdfAutofill: PdfAutofill,

    WebAssistent: WebAssistent,
    AnspruchsAnalyse: AnspruchsAnalyse,
    Contact: Contact,

}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPage = _getCurrentPage(location.pathname);
    const { user } = useUserProfile();

    React.useEffect(() => {
        const seen = localStorage.getItem('seenOnboarding');
        const completion = (user?.profile_completeness ?? 0);
        const path = location.pathname.toLowerCase();
        const isPublic = (
            path === '/' ||
            path === '/contact' || path === '/kontakt' ||
            path === '/auth' ||
            path === '/onboarding' ||
            path === '/impressum' ||
            path === '/datenschutz' ||
            path === '/agb' ||
            path === '/pricing' ||
            path === '/hilfe'
        );

        // Skip onboarding redirect right after a fresh login once
        const justLoggedIn = localStorage.getItem('justLoggedIn') === '1';
        if (justLoggedIn) {
            localStorage.removeItem('justLoggedIn');
            return;
        }

        // Nach Login: Prüfe Onboarding-Status
        if (!isPublic && completion === 0 && !seen) {
            localStorage.setItem('seenOnboarding', '1');
            navigate('/onboarding');
        }
        // Eingeloggt auf Root → zur ProfilSeite
        else if (user && location.pathname === '/') {
            navigate('/profilseite');
        }
        // Nach abgeschlossenem Onboarding: Direkt zur Anspruchsanalyse
        else if (!isPublic && completion === 100 && location.pathname.toLowerCase() === '/profilseite') {
            navigate('/anspruchsanalyse');
        }
    }, [user, location.pathname, navigate]);

    return (
        <Layout currentPageName={currentPage}>
            <Suspense fallback={<LoadingFallback />}>
            <Routes>
                {/* Root Route zeigt Home - KEIN Redirect zu Port 3000! */}
                <Route path="/" element={<Home />} />
                {/* Landing Page Redirect (nur wenn explizit aufgerufen) */}
                <Route path="/landing" element={<LandingPage />} />
                
                {/* ProfilSeite */}
                <Route path="/profilseite" element={
                  <ProtectedRoute>
                    <ProfilSeiteSimple />
                  </ProtectedRoute>
                } />

                <Route path="/Upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />

                <Route path="/Abrechnungen" element={<ProtectedRoute><Abrechnungen /></ProtectedRoute>} />

                <Route path="/Assistent" element={<ProtectedRoute><Assistent /></ProtectedRoute>} />

                <Route path="/Lebenslagen" element={<ProtectedRoute><Lebenslagen /></ProtectedRoute>} />

                <Route path="/Pruefung" element={<ProtectedRoute><Pruefung /></ProtectedRoute>} />

                <Route path="/Implementierungsplan" element={<ProtectedRoute><Implementierungsplan /></ProtectedRoute>} />

                <Route path="/WohngeldCleanup" element={<ProtectedRoute><WohngeldCleanup /></ProtectedRoute>} />

                <Route path="/DataCleanupExecution" element={<ProtectedRoute><DataCleanupExecution /></ProtectedRoute>} />

                <Route path="/FoerderPruefradar" element={<ProtectedRoute><FoerderPruefradar /></ProtectedRoute>} />

                <Route path="/Datenqualitaet" element={<ProtectedRoute><Datenqualitaet /></ProtectedRoute>} />

                <Route path="/AntragAssistent" element={<ProtectedRoute><AntragAssistent /></ProtectedRoute>} />

                <Route path="/ProductionReadiness" element={<ProtectedRoute><ProductionReadiness /></ProtectedRoute>} />

                <Route path="/Impressum" element={<Impressum />} />
                <Route path="/impressum" element={<Impressum />} />

                <Route path="/Datenschutz" element={<Datenschutz />} />
                <Route path="/datenschutz" element={<Datenschutz />} />

                <Route path="/AGB" element={<AGB />} />
                <Route path="/agb" element={<AGB />} />

                <Route path="/Hilfe" element={<Hilfe />} />
                <Route path="/hilfe" element={<Hilfe />} />

                <Route path="/Bericht" element={<ProtectedRoute><Bericht /></ProtectedRoute>} />

                <Route path="/Pricing" element={<Pricing />} />
                <Route path="/pricing" element={<Pricing />} />

                <Route path="/Antraege" element={<ProtectedRoute><Antraege /></ProtectedRoute>} />

                <Route path="/PdfAusfuellhilfe" element={<ProtectedRoute><PdfAusfuellhilfe /></ProtectedRoute>} />

                <Route path="/LandingPage" element={<Home />} />

                <Route path="/StripeSetup" element={<ProtectedRoute><StripeSetup /></ProtectedRoute>} />

                <Route path="/BillingAgent" element={<ProtectedRoute><BillingAgent /></ProtectedRoute>} />

                <Route path="/BackendSetup" element={<ProtectedRoute><BackendSetup /></ProtectedRoute>} />

                <Route path="/StripeAutoSetup" element={<ProtectedRoute><StripeAutoSetup /></ProtectedRoute>} />

                <Route path="/QATests" element={<ProtectedRoute><QATests /></ProtectedRoute>} />

                <Route path="/PdfAutofill" element={<ProtectedRoute><PdfAutofill /></ProtectedRoute>} />

                <Route path="/web-assistent" element={<ProtectedRoute><WebAssistent /></ProtectedRoute>} />
                <Route path="/anspruchsanalyse" element={<ProtectedRoute><AnspruchsAnalyse /></ProtectedRoute>} />
                <Route path="/antraege-finden" element={<ProtectedRoute><AntraegeFinden /></ProtectedRoute>} />

                <Route path="/Contact" element={<Contact />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/Home" element={<Home />} />
                {/* Auth Route ENTFERNT - Anmeldung nur auf Port 3000! */}
                <Route path="/auth-bridge" element={<AuthBridge />} />
                <Route path="/reports/:id" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

                <Route path="/Onboarding" element={<Onboarding />} />
                <Route path="/onboarding" element={<Onboarding />} />

            </Routes>
            </Suspense>
        </Layout>
    );
}

export default function Pages() {
    return (
        <ErrorBoundary message="Die Anwendung konnte nicht geladen werden.">
            <Router>
                <UserProfileProvider>
                    <NotificationProvider>
                        <PagesContent />
                        {/* <CookieBanner /> */}
                    </NotificationProvider>
                </UserProfileProvider>
            </Router>
        </ErrorBoundary>
    );
}