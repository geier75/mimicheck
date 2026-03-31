import React, { useState, useEffect, Component } from 'react';
import { UserProfile } from '../api/supabaseEntities';

// Importiere alle Profil-Sektionen
import {
  PersoenlichesDatenSection,
  EinwilligungenSection,
  KontaktSection,
  BankSection,
  KrankenversicherungSection,
  WohnungSection,
  EinkommenSection,
  PartnerSection,
  KinderSection,
  VermoegenSection,
  BesonderesSection,
  BildungSection
} from '../components/profil';

// Error Boundary für Stabilität
class ProfilErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ProfilSeite Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen bg-slate-950 text-white items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">⚠️ Laden fehlgeschlagen</h2>
            <p className="text-white/60 mb-4">Bitte Seite neu laden (F5)</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-cyan-500 rounded-lg hover:bg-cyan-600"
            >
              🔄 Neu laden
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Sidebar-Sektionen Konfiguration
const SECTIONS = [
  { id: 'persoenlich', label: 'Persönliche Daten', icon: '👤', color: '#06b6d4' },
  { id: 'kontakt', label: 'Kontakt & Adresse', icon: '📍', color: '#14b8a6' },
  { id: 'bank', label: 'Bankverbindung', icon: '🏦', color: '#10b981' },
  { id: 'krankenversicherung', label: 'Krankenversicherung', icon: '🏥', color: '#f43f5e' },
  { id: 'wohnung', label: 'Wohnsituation', icon: '🏠', color: '#f59e0b' },
  { id: 'einkommen', label: 'Einkommen', icon: '💼', color: '#3b82f6' },
  { id: 'partner', label: 'Partner/in', icon: '💑', color: '#a855f7' },
  { id: 'kinder', label: 'Kinder', icon: '👶', color: '#ec4899' },
  { id: 'vermoegen', label: 'Vermögen', icon: '💰', color: '#eab308' },
  { id: 'besonderes', label: 'Besondere Umstände', icon: '⚠️', color: '#fb923c' },
  { id: 'bildung', label: 'Bildung', icon: '🎓', color: '#6366f1' },
  { id: 'einwilligungen', label: 'Datenschutz', icon: '🛡️', color: '#64748b' }
];

// Initiale Profil-State Struktur
const INITIAL_PROFIL = {
  // Persönliche Daten
  anrede: '', vorname: '', nachname: '', geburtsdatum: '', 
  steuer_id: '', sozialversicherungsnummer: '',
  
  // Kontakt & Adresse
  strasse: '', hausnummer: '', adresszusatz: '', plz: '', ort: '', 
  bundesland: '', landkreis: '', telefon_mobil: '', telefon_festnetz: '', 
  email: '', de_mail: '',
  
  // Bankverbindung
  iban: '', bic: '', kontoinhaber: '', bank_name: '',
  
  // Einwilligungen
  dsgvo_einwilligung: false, ki_verarbeitung_einwilligung: false, 
  datenweitergabe_behoerden: false
};

function ProfilSeiteContent() {
  const [activeSection, setActiveSection] = useState('persoenlich');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [profil, setProfil] = useState(INITIAL_PROFIL);

  // Profil beim Laden abrufen
  useEffect(() => {
    let isMounted = true;
    
    async function loadProfile() {
      // Zuerst: localStorage laden (schneller)
      const localData = localStorage.getItem('mimicheck-profil');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (isMounted) setProfil(prev => ({ ...prev, ...parsed }));
          console.log('✅ Profil aus localStorage geladen');
        } catch (e) {
          console.warn('localStorage Profil ungültig');
        }
      }
      
      // Sofort anzeigen
      if (isMounted) setLoading(false);
      
      // Im Hintergrund: Supabase laden
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );
        const data = await Promise.race([UserProfile.getCurrent(), timeoutPromise]);
        if (data && isMounted) {
          const cleanData = {};
          Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
              cleanData[key] = data[key];
            }
          });
          setProfil(prev => ({ ...prev, ...cleanData }));
          console.log('✅ Profil aus Supabase geladen');
        }
      } catch (e) {
        console.log('ℹ️ Supabase nicht verfügbar:', e.message);
      }
    }
    
    loadProfile();
    return () => { isMounted = false; };
  }, []);

  // Auto-Save in localStorage
  useEffect(() => {
    if (!loading) {
      const dataToSave = {};
      Object.keys(profil).forEach(key => {
        const value = profil[key];
        if (typeof value === 'boolean') {
          dataToSave[key] = value;
        } else if (value && value !== '') {
          dataToSave[key] = value;
        }
      });
      
      try {
        localStorage.setItem('mimicheck-profil', JSON.stringify(dataToSave));
      } catch (e) {
        console.warn('Auto-Save fehlgeschlagen:', e);
      }
    }
  }, [profil, loading]);

  // Generischer onChange Handler
  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setProfil(prev => ({ ...prev, [field]: value }));
  };

  // Profil speichern
  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      
      const dataToSave = {};
      Object.keys(profil).forEach(key => {
        const value = profil[key];
        if (typeof value === 'boolean') {
          dataToSave[key] = value;
        } else if (value && value !== '') {
          dataToSave[key] = value;
        }
      });
      
      // 1. localStorage speichern
      try {
        localStorage.setItem('mimicheck-profil', JSON.stringify(dataToSave));
        console.log('✅ Profil in localStorage gespeichert');
      } catch (e) {
        console.warn('localStorage Speichern fehlgeschlagen:', e);
      }
      
      // 2. Supabase speichern
      try {
        await UserProfile.update(dataToSave);
        console.log('✅ Profil in Supabase gespeichert');
      } catch (e) {
        console.log('ℹ️ Supabase Speichern nicht möglich:', e.message);
      }
      
      setSaveMessage({ type: 'success', text: '✅ Profil erfolgreich gespeichert!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setSaveMessage({ type: 'error', text: '❌ Fehler beim Speichern: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  // Aktive Sektion rendern
  const renderSection = () => {
    const props = { profil, handleChange, setProfil, handleSave, saving };
    
    switch (activeSection) {
      case 'persoenlich': return <PersoenlichesDatenSection {...props} />;
      case 'kontakt': return <KontaktSection {...props} />;
      case 'bank': return <BankSection {...props} />;
      case 'krankenversicherung': return <KrankenversicherungSection {...props} />;
      case 'wohnung': return <WohnungSection {...props} />;
      case 'einkommen': return <EinkommenSection {...props} />;
      case 'partner': return <PartnerSection {...props} />;
      case 'kinder': return <KinderSection {...props} />;
      case 'vermoegen': return <VermoegenSection {...props} />;
      case 'besonderes': return <BesonderesSection {...props} />;
      case 'bildung': return <BildungSection {...props} />;
      case 'einwilligungen': return <EinwilligungenSection {...props} />;
      default: return <PersoenlichesDatenSection {...props} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900/95 border-r border-white/10 flex flex-col h-full">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            MiMiCheck
          </h1>
          <p className="text-xs text-white/50 mt-1">Dein digitaler Antragshelfer</p>
        </div>
        
        {/* Fortschrittsanzeige */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/50">Profil-Vollständigkeit</span>
            <span className="text-sm font-bold text-cyan-400">
              {Math.round((Object.values(profil).filter(v => v && v !== '').length / Object.keys(profil).length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all"
              style={{ width: `${(Object.values(profil).filter(v => v && v !== '').length / Object.keys(profil).length) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm transition-all ${
                  activeSection === s.id 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 border border-cyan-500/30 text-white font-medium' 
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  activeSection === s.id ? 'bg-gradient-to-r from-cyan-500 to-teal-500' : 'bg-white/10'
                }`}>
                  <span className="text-sm">{s.icon}</span>
                </div>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex flex-wrap gap-2 text-[10px] text-white/40">
            <span className="px-2 py-1 rounded bg-white/5">DSGVO</span>
            <span className="px-2 py-1 rounded bg-white/5">AES-256</span>
            <span className="px-2 py-1 rounded bg-white/5">EU AI Act</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-white/10 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center">
                <span className="text-xl">{SECTIONS.find(s => s.id === activeSection)?.icon || '👤'}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {SECTIONS.find(s => s.id === activeSection)?.label || 'Persönliche Daten'}
                </h2>
                <p className="text-sm text-white/50 mt-1">Ihre grundlegenden Informationen</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {saveMessage && (
                <span className={`text-sm ${saveMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {saveMessage.text}
                </span>
              )}
              {profil.vorname && (
                <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">
                  ✓ Daten geladen
                </span>
              )}
              <button 
                onClick={handleSave}
                disabled={saving || loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-600 hover:to-teal-600 transition-all"
              >
                {saving ? '⏳ Speichern...' : '💾 Speichern'}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-5xl">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                  <span className="text-white/60">Profildaten werden geladen...</span>
                </div>
              </div>
            ) : (
              renderSection()
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Export der Komponente mit Error Boundary
export default function ProfilSeite() {
  return (
    <ProfilErrorBoundary>
      <ProfilSeiteContent />
    </ProfilErrorBoundary>
  );
}
