import { useEffect } from 'react';

// REDIRECT TO LANDING PAGE ON PORT 3000 (Updated: 2025-11-25 10:45)
export default function LandingPage() {
    useEffect(() => {
        // WICHTIG: Landing Page läuft auf Port 3000, NICHT 3001!
        const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://localhost:3000/landing';
        
        // Cache-Buster für sauberes Laden
        const cacheBuster = `?v=${Date.now()}`;
        const finalUrl = landingUrl + cacheBuster;
        
        console.log('🔄 [UPDATED 10:45] Redirecting to Landing Page:', finalUrl);
        console.log('📍 Port 3000 - NOT 3001!');
        
        // Redirect to the actual landing page
        window.location.href = finalUrl;
    }, []);

    // Show loading state while redirecting
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg font-semibold">Weiterleitung zur Startseite...</p>
            </div>
        </div>
    );
}
