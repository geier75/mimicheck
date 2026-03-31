import React from 'react';
import { supabase } from '@/api/supabaseClient';
import { User } from '@/api/entities';

export default function AuthBridge() {
  React.useEffect(() => {
    console.log('🌉 AuthBridge LOADED');
    console.log('📍 Current URL:', window.location.href);
    
    const url = new URL(window.location.href);
    const access_token = url.searchParams.get('access_token');
    const refresh_token = url.searchParams.get('refresh_token');
    
    console.log('🎫 Received tokens:', {
      hasAccess: !!access_token,
      hasRefresh: !!refresh_token,
      accessLength: access_token?.length,
      refreshLength: refresh_token?.length
    });

    async function run() {
      if (!access_token || !refresh_token) {
        console.warn('⚠️ No tokens found, redirecting to Landing Page');
        const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://localhost:3000/landing';
        window.location.href = `${landingUrl}#auth`;
        return;
      }
      
      try {
        console.log('🔐 Setting session manually...');
        
        // Session MANUELL im localStorage speichern (Supabase Format)
        const sessionData = {
          access_token,
          refresh_token,
          token_type: 'bearer',
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 Stunde
          user: {
            id: 'pending',
            email: url.searchParams.get('email') || '',
          }
        };
        
        // Speichere in BEIDEN möglichen Keys
        const storageKey = 'mimicheck-auth';
        // Dynamisch: Extrahiere Projekt-Ref aus Supabase-URL
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
        const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase/)?.[1] || '';
        const supabaseKey = projectRef ? `sb-${projectRef}-auth-token` : storageKey;
        
        try {
          localStorage.setItem(storageKey, JSON.stringify(sessionData));
          localStorage.setItem(supabaseKey, JSON.stringify(sessionData));
          console.log('💾 Session manually saved to localStorage');
        } catch (e) {
          console.warn('⚠️ localStorage save failed:', e);
        }
        
        // Versuche auch Supabase setSession (aber warte nicht lange)
        try {
          const result = await Promise.race([
            supabase.auth.setSession({ access_token, refresh_token }),
            new Promise(resolve => setTimeout(() => resolve({ data: null, error: 'timeout' }), 2000))
          ]);
          console.log('📦 Supabase setSession result:', result?.error ? 'error/timeout' : 'success');
        } catch (e) {
          console.warn('⚠️ Supabase setSession failed (non-critical):', e);
        }
        
        // Session ist jetzt gesetzt - speichere Login-Flag
        try { 
          localStorage.setItem('justLoggedIn', '1');
          console.log('💾 Saved login flag to localStorage');
        } catch {}
        
        // Profil-Update ist optional und blockiert nicht
        const name = url.searchParams.get('name');
        const email = url.searchParams.get('email');
        if (name || email) {
          console.log('👤 User info:', { name, email });
          // Nicht await - lass es im Hintergrund laufen
          User.updateProfile({ full_name: name || email || undefined, email: email || undefined })
            .then(() => console.log('✅ Profile updated'))
            .catch((e) => console.warn('⚠️ Profile update failed (non-critical):', e));
        }
        
        // Zur Profilseite
        console.log('🚀 Redirecting to /profilseite...');
        window.location.replace('/profilseite');
        
      } catch (e) {
        console.error('❌ AuthBridge error:', e);
        // Trotzdem zur Profilseite versuchen
        console.log('🚀 Trying redirect to /profilseite anyway...');
        window.location.replace('/profilseite');
      }
    }

    run();
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#000',
      color: '#fff'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>🔐 Authentifizierung läuft...</h2>
        <p>Bitte warten...</p>
      </div>
    </div>
  );
}
