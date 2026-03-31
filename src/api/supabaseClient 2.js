import { createClient } from '@supabase/supabase-js';

// SECURITY: API-Keys müssen aus Umgebungsvariablen kommen, KEINE Fallbacks!
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// DEBUG: Zeige ob Keys geladen wurden
console.log('🔐 Supabase Config:', { 
  url: supabaseUrl ? '✅ SET' : '❌ MISSING', 
  key: supabaseAnon ? '✅ SET (' + supabaseAnon.substring(0, 20) + '...)' : '❌ MISSING' 
});

// Validierung der Umgebungsvariablen
if (!supabaseUrl || !supabaseAnon) {
  console.error('❌ KRITISCH: Supabase Umgebungsvariablen fehlen!');
  console.error('Erstellen Sie eine .env Datei mit:');
  console.error('  VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('  VITE_SUPABASE_ANON_KEY=your-anon-key');
  
  // In Entwicklung: Warnung, in Produktion: Fehler
  if (import.meta.env.PROD) {
    throw new Error('Supabase Konfiguration fehlt. Bitte .env Datei prüfen.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'mimicheck-auth',
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch {}
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch {}
      },
    },
  },
});

export async function supabaseHealthcheck() {
  try {
    // Ping auth settings (lightweight request) by listing buckets if storage exists
    const { data, error } = await supabase.from('contact_requests').select('id', { count: 'exact', head: true }).limit(1);
    return !error;
  } catch {
    return false;
  }
}
