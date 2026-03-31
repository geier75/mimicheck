import React from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';

export default function ProtectedRoute({ children }) {
  // 🔧 DEV MODE: Bypass Auth für lokale Entwicklung
  const DEV_BYPASS = false; // ✅ Production-ready
  
  const [ready, setReady] = React.useState(DEV_BYPASS);
  const [session, setSession] = React.useState(DEV_BYPASS ? { user: { id: 'dev-user' } } : null);

  React.useEffect(() => {
    // Im Dev-Mode keine Auth-Prüfung
    if (DEV_BYPASS) {
      console.log('🔧 DEV MODE: Auth bypassed');
      return;
    }
    let mounted = true;
    
    async function checkSession() {
      // 1. Prüfe zuerst localStorage für manuelle Session
      try {
        const storageKey = 'mimicheck-auth';
        // Dynamisch: Extrahiere Projekt-Ref aus Supabase-URL
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
        const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase/)?.[1] || '';
        const supabaseKey = projectRef ? `sb-${projectRef}-auth-token` : storageKey;
        const stored = localStorage.getItem(storageKey) || localStorage.getItem(supabaseKey);
        
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.access_token) {
            console.log('✅ ProtectedRoute: Found session in localStorage');
            // Setze Session mit gespeichertem Token
            const { data, error } = await supabase.auth.setSession({
              access_token: parsed.access_token,
              refresh_token: parsed.refresh_token
            });
            if (!error && data?.session) {
              if (mounted) {
                setSession(data.session);
                setReady(true);
              }
              return;
            }
          }
        }
      } catch (e) {
        console.warn('ProtectedRoute: localStorage check failed:', e);
      }
      
      // 2. Fallback: Prüfe Supabase direkt
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!error && data?.session) {
          if (mounted) {
            setSession(data.session);
            setReady(true);
          }
          return;
        }
      } catch (e) {
        console.warn('ProtectedRoute: getSession failed:', e);
      }
      
      // 3. Keine Session gefunden
      if (mounted) {
        console.log('❌ ProtectedRoute: No session found');
        setReady(true);
      }
    }
    
    // Timeout nach 5 Sekunden
    const timeout = setTimeout(() => {
      if (!mounted) return;
      console.warn('ProtectedRoute: Session check timeout');
      setReady(true);
    }, 5000);
    
    checkSession().finally(() => clearTimeout(timeout));
    
    const { data: { subscription } = { subscription: null } } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
    });
    
    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription?.unsubscribe?.();
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex h-screen bg-slate-950 text-white items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Authentifizierung wird geprüft...</p>
        </div>
      </div>
    );
  }
  
  // Nicht eingeloggt? → Weiterleitung zu Port 3000 Landing Page Auth
  if (!session) {
    const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://localhost:3000/landing';
    window.location.href = `${landingUrl}#auth`;
    return null;
  }
  
  return children;
}
