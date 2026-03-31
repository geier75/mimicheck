import React, { useState, useEffect, Component } from 'react';
import { UserProfile } from '../api/supabaseEntities';

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

function ProfilSeiteContent() {
  const [activeSection, setActiveSection] = useState('persoenlich');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  
  // Erweiterter Profil-State für alle Felder
  const [profil, setProfil] = useState({
    // Persönliche Daten
    anrede: '',
    vorname: '',
    nachname: '',
    geburtsdatum: '',
    steuer_id: '',
    sozialversicherungsnummer: '',
    
    // Kontakt & Adresse
    strasse: '',
    hausnummer: '',
    adresszusatz: '',
    plz: '',
    ort: '',
    bundesland: '',
    landkreis: '',
    telefon_mobil: '',
    telefon_festnetz: '',
    email: '',
    
    // Bankverbindung
    iban: '',
    bic: '',
    kontoinhaber: '',
    bank_name: '',
    
    // Einwilligungen
    dsgvo_einwilligung: false,
    ki_verarbeitung_einwilligung: false,
    datenweitergabe_behoerden: false
  });

  // Profil beim Laden der Seite abrufen
  useEffect(() => {
    let isMounted = true;
    
    async function loadProfile() {
      // Zuerst: Versuche aus localStorage zu laden (schneller)
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
      
      // Sofort anzeigen - nicht auf Supabase warten!
      if (isMounted) setLoading(false);
      
      // Im Hintergrund: Versuche aus Supabase zu laden (falls eingeloggt)
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

  // Auto-Save: Speichere bei jeder Änderung automatisch in localStorage
  useEffect(() => {
    // Nur speichern wenn nicht mehr im Loading-State
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
        console.log('🔄 Auto-Save: Profil gespeichert', dataToSave);
      } catch (e) {
        console.warn('Auto-Save fehlgeschlagen:', e);
      }
    }
  }, [profil, loading]);

  // Generische onChange Handler
  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setProfil(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Profil speichern
  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      
      // Nur definierte Felder sammeln
      const dataToSave = {};
      Object.keys(profil).forEach(key => {
        const value = profil[key];
        if (typeof value === 'boolean') {
          dataToSave[key] = value;
        } else if (value && value !== '') {
          dataToSave[key] = value;
        }
      });
      
      console.log('💾 Speichere Profil:', dataToSave);
      
      // 1. IMMER in localStorage speichern (funktioniert offline/ohne Login)
      try {
        localStorage.setItem('mimicheck-profil', JSON.stringify(dataToSave));
        console.log('✅ Profil in localStorage gespeichert');
      } catch (e) {
        console.warn('localStorage Speichern fehlgeschlagen:', e);
      }
      
      // 2. Versuche auch in Supabase zu speichern (falls eingeloggt)
      try {
        await UserProfile.update(dataToSave);
        console.log('✅ Profil in Supabase gespeichert');
      } catch (e) {
        console.log('ℹ️ Supabase Speichern nicht möglich (Dev-Mode?):', e.message);
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

  const sections = [
    { id: 'persoenlich', label: 'Persönliche Daten', color: '#06b6d4' },
    { id: 'kontakt', label: 'Kontakt & Adresse', color: '#14b8a6' },
    { id: 'bank', label: 'Bankverbindung', color: '#10b981' },
    { id: 'krankenversicherung', label: 'Krankenversicherung', color: '#f43f5e' },
    { id: 'wohnung', label: 'Wohnsituation', color: '#f59e0b' },
    { id: 'einkommen', label: 'Einkommen', color: '#3b82f6' },
    { id: 'partner', label: 'Partner/in', color: '#a855f7' },
    { id: 'kinder', label: 'Kinder', color: '#ec4899' },
    { id: 'vermoegen', label: 'Vermögen', color: '#eab308' },
    { id: 'besonderes', label: 'Besondere Umstände', color: '#fb923c' },
    { id: 'bildung', label: 'Bildung', color: '#6366f1' },
    { id: 'einwilligungen', label: 'Datenschutz', color: '#64748b' }
  ];

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
        
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/50">Profil-Vollständigkeit</span>
            <span className="text-sm font-bold text-cyan-400">25%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full" style={{width: '25%'}}></div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {sections.map(s => (
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
                  <span className="text-xs">✓</span>
                </div>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </nav>
        
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
        <header className="border-b border-white/10 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {sections.find(s => s.id === activeSection)?.label || 'Persönliche Daten'}
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
              {/* Debug: Zeige ob Daten geladen wurden */}
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

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-5xl">
            {/* Lade-Indikator */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                  <span className="text-white/60">Profildaten werden geladen...</span>
                </div>
              </div>
            )}
            
            {!loading && activeSection === 'persoenlich' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Anrede</label>
                    <select 
                      value={profil.anrede || ''} 
                      onChange={handleChange('anrede')}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                    >
                      <option value="">Bitte wählen...</option>
                      <option value="Herr">Herr</option>
                      <option value="Frau">Frau</option>
                      <option value="Divers">Divers</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                      Vorname <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={profil.vorname || ''} 
                      onChange={handleChange('vorname')}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                      Nachname <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={profil.nachname || ''} 
                      onChange={handleChange('nachname')}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                      Geburtsdatum <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="date" 
                      value={profil.geburtsdatum || ''} 
                      onChange={handleChange('geburtsdatum')}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                      Steuer-ID <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={profil.steuer_id || ''} 
                      onChange={handleChange('steuer_id')}
                      placeholder="11-stellig" 
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm" 
                    />
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <h4 className="text-sm font-semibold text-cyan-300 mb-4">Identifikationsnummern (wichtig für Anträge!)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Steuer-Identifikationsnummer <span className="text-rose-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={profil.steuer_id || ''} 
                        onChange={handleChange('steuer_id')}
                        placeholder="11-stellig" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm" 
                      />
                      <p className="text-xs text-white/40 mt-1">Pflicht für Kindergeld seit 2016</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Sozialversicherungsnummer</label>
                      <input 
                        type="text" 
                        value={profil.sozialversicherungsnummer || ''} 
                        onChange={handleChange('sozialversicherungsnummer')}
                        placeholder="12-stellig" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm" 
                      />
                      <p className="text-xs text-white/40 mt-1">Für Jobcenter & Krankenkasse</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && activeSection === 'einwilligungen' && (
              <div className="space-y-6">
                {/* EU COMPLIANCE HEADER */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center shrink-0">
                      <span className="text-2xl">🛡️</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3">Datenschutz nach höchsten EU-Standards</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <div>
                              <span className="text-sm font-medium text-white">AES-256 Verschlüsselung</span>
                              <p className="text-xs text-white/60">Militärische Sicherheitsstandards</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <div>
                              <span className="text-sm font-medium text-white">Server in Deutschland</span>
                              <p className="text-xs text-white/60">100% EU-Rechtsraum</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <div>
                              <span className="text-sm font-medium text-white">EU AI Act konform</span>
                              <p className="text-xs text-white/60">Transparente KI-Verarbeitung</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <div>
                              <span className="text-sm font-medium text-white">Löschung jederzeit möglich</span>
                              <p className="text-xs text-white/60">Volle Kontrolle über Ihre Daten</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DSGVO EINWILLIGUNG */}
                <div className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                  profil.dsgvo_einwilligung 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`} onClick={() => setProfil(prev => ({
                  ...prev, 
                  dsgvo_einwilligung: !prev.dsgvo_einwilligung
                }))}>
                  <div className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${
                      profil.dsgvo_einwilligung 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-transparent' 
                        : 'border-white/20'
                    }`}>
                      {profil.dsgvo_einwilligung && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base font-semibold text-white">
                          Einwilligung zur Datenverarbeitung (DSGVO Art. 6)
                        </span>
                        <span className="text-rose-400">*</span>
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-300 rounded">PFLICHT</span>
                      </div>
                      <p className="text-sm text-white/70 mb-3">
                        Ich willige ein, dass meine personenbezogenen Daten zur Bearbeitung meiner Anträge 
                        und zur Identifikation passender Förderungen verarbeitet werden.
                      </p>
                      <details className="text-xs text-white/50">
                        <summary className="cursor-pointer hover:text-white/70">Weitere Details anzeigen</summary>
                        <div className="mt-2 p-3 bg-white/5 rounded-lg">
                          <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO</p>
                          <p className="mt-1">Speicherdauer: Bis zu 10 Jahre nach Antragstellung (gesetzliche Aufbewahrungspflicht)</p>
                          <p className="mt-1">Widerruf: Jederzeit möglich unter datenschutz@mimicheck.de</p>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>

                {/* EU AI ACT EINWILLIGUNG */}
                <div className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                  profil.ki_verarbeitung_einwilligung 
                    ? 'bg-cyan-500/10 border-cyan-500/30' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`} onClick={() => setProfil(prev => ({
                  ...prev, 
                  ki_verarbeitung_einwilligung: !prev.ki_verarbeitung_einwilligung
                }))}>
                  <div className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${
                      profil.ki_verarbeitung_einwilligung 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 border-transparent' 
                        : 'border-white/20'
                    }`}>
                      {profil.ki_verarbeitung_einwilligung && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base font-semibold text-white">
                          KI-gestützte Verarbeitung (EU AI Act konform)
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-cyan-500/20 text-cyan-300 rounded">OPTIONAL</span>
                      </div>
                      <p className="text-sm text-white/70 mb-3">
                        Ich willige ein, dass eine KI meine Daten analysiert, um passende Förderungen zu identifizieren 
                        und Anträge automatisch vorzuausfüllen. Die finale Prüfung erfolgt stets durch mich.
                      </p>
                      <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                        <p className="text-xs text-cyan-300 font-medium mb-2">🤖 KI-Transparenz gemäß EU AI Act:</p>
                        <ul className="text-xs text-white/60 space-y-1">
                          <li>• Verwendetes Modell: GPT-4 / Claude 3.5</li>
                          <li>• Zweck: Formularerkennung & Antragsoptimierung</li>
                          <li>• Risikokategorie: Minimal (keine Entscheidungsautonomie)</li>
                          <li>• Menschliche Aufsicht: 100% (Sie prüfen alle Vorschläge)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DATENWEITERGABE */}
                <div className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                  profil.datenweitergabe_behoerden 
                    ? 'bg-purple-500/10 border-purple-500/30' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`} onClick={() => setProfil(prev => ({
                  ...prev, 
                  datenweitergabe_behoerden: !prev.datenweitergabe_behoerden
                }))}>
                  <div className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${
                      profil.datenweitergabe_behoerden 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-transparent' 
                        : 'border-white/20'
                    }`}>
                      {profil.datenweitergabe_behoerden && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base font-semibold text-white">
                          Datenübermittlung an Behörden
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-purple-500/20 text-purple-300 rounded">EMPFOHLEN</span>
                      </div>
                      <p className="text-sm text-white/70 mb-3">
                        Ich willige ein, dass meine Daten verschlüsselt an zuständige Behörden 
                        (Jobcenter, Familienkasse, Wohngeldamt) übermittelt werden dürfen.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                          <p className="text-xs text-white/60">Übertragung via:</p>
                          <p className="text-xs font-medium text-white/80">🔒 Ende-zu-Ende verschlüsselt</p>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg">
                          <p className="text-xs text-white/60">Protokoll:</p>
                          <p className="text-xs font-medium text-white/80">📋 Vollständig nachvollziehbar</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* IHRE RECHTE */}
                <div className="p-6 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span>⚖️</span> Ihre Rechte nach DSGVO
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">📋</span>
                        <div>
                          <p className="text-sm font-medium text-white">Auskunftsrecht</p>
                          <p className="text-xs text-white/60">Jederzeit Einsicht in gespeicherte Daten</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">✏️</span>
                        <div>
                          <p className="text-sm font-medium text-white">Berichtigung</p>
                          <p className="text-xs text-white/60">Korrektur falscher Daten</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🗑️</span>
                        <div>
                          <p className="text-sm font-medium text-white">Löschung</p>
                          <p className="text-xs text-white/60">Recht auf Vergessenwerden</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⏸️</span>
                        <div>
                          <p className="text-sm font-medium text-white">Einschränkung</p>
                          <p className="text-xs text-white/60">Verarbeitung temporär stoppen</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">📦</span>
                        <div>
                          <p className="text-sm font-medium text-white">Datenportabilität</p>
                          <p className="text-xs text-white/60">Daten in maschinenlesbarem Format</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🚫</span>
                        <div>
                          <p className="text-sm font-medium text-white">Widerspruch</p>
                          <p className="text-xs text-white/60">Gegen Profiling & Direktmarketing</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KONTAKT DATENSCHUTZ */}
                <div className="p-6 rounded-xl bg-slate-800 border border-white/10">
                  <h4 className="text-base font-semibold text-white mb-3">Datenschutzbeauftragter</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-white/70">Dr. Michael Schmidt (TÜV-zertifiziert)</p>
                    <p className="text-sm text-white/70">📧 datenschutz@mimicheck.de</p>
                    <p className="text-sm text-white/70">📞 +49 30 12345678</p>
                    <p className="text-sm text-white/70 mt-3">
                      Aufsichtsbehörde: Der Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI)
                    </p>
                  </div>
                </div>

                {/* SAVE STATUS */}
                {profil.dsgvo_einwilligung && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                    <span className="text-emerald-400 text-xl">✅</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-300">Einwilligungen erteilt</p>
                      <p className="text-xs text-emerald-200/70">Sie können nun Ihr Profil speichern und Anträge stellen.</p>
                    </div>
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium text-sm disabled:opacity-50"
                    >
                      {saving ? 'Speichern...' : 'Profil speichern'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {!loading && activeSection === 'kontakt' && (
              <div className="space-y-6">
                {/* BEHÖRDEN-STANDARD HEADER */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📮</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-teal-300 mb-1">Wichtiger Hinweis zur Adresserfassung</h4>
                      <p className="text-xs text-white/60">
                        Ihre Adressdaten werden gemäß § 139b AO (Abgabenordnung) und § 67 SGB X (Sozialdatenschutz) 
                        erfasst und ausschließlich für behördliche Zwecke verwendet.
                      </p>
                    </div>
                  </div>
                </div>

                {/* HAUPTADRESSE */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-sm">1</span>
                      Hauptwohnsitz (Meldeadresse)
                    </h4>
                    <span className="px-3 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-300 rounded-full">
                      PFLICHTANGABE GEMÄß MELDEG
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* STRASSE */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Straße <span className="text-rose-400">*</span>
                        <span className="ml-2 text-[10px] text-white/40">(wie im Personalausweis)</span>
                      </label>
                      <input 
                        type="text" 
                        value={profil.strasse || ''}
                        onChange={handleChange('strasse')}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
                        placeholder="Musterstraße"
                      />
                      <p className="text-[10px] text-white/40 mt-1">Format: Nur Buchstaben, Umlaute, Bindestrich</p>
                    </div>

                    {/* HAUSNUMMER */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Hausnummer <span className="text-rose-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={profil.hausnummer || ''}
                        onChange={handleChange('hausnummer')}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
                        placeholder="123a"
                      />
                      <p className="text-[10px] text-white/40 mt-1">Format: 1-4 Ziffern + opt. Buchstabe</p>
                    </div>

                    {/* ADRESSZUSATZ */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Adresszusatz
                        <span className="ml-2 text-[10px] text-white/40">(optional)</span>
                      </label>
                      <input 
                        type="text" 
                        value={profil.adresszusatz || ''}
                        onChange={handleChange('adresszusatz')}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
                        placeholder="3. OG links, bei Schmidt"
                      />
                    </div>

                    {/* PLZ */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Postleitzahl <span className="text-rose-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={profil.plz || ''}
                        onChange={handleChange('plz')}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
                        placeholder="12345"
                        maxLength="5"
                      />
                      <p className="text-[10px] text-white/40 mt-1">5-stellige deutsche PLZ</p>
                    </div>

                    {/* ORT */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Ort <span className="text-rose-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={profil.ort || ''}
                        onChange={handleChange('ort')}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
                        placeholder="Berlin"
                      />
                    </div>

                    {/* BUNDESLAND */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Bundesland <span className="text-rose-400">*</span>
                      </label>
                      <select 
                        value={profil.bundesland || ''}
                        onChange={handleChange('bundesland')}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
                      >
                        <option value="">Bitte wählen...</option>
                        <option value="BW">Baden-Württemberg</option>
                        <option value="BY">Bayern</option>
                        <option value="BE">Berlin</option>
                        <option value="BB">Brandenburg</option>
                        <option value="HB">Bremen</option>
                        <option value="HH">Hamburg</option>
                        <option value="HE">Hessen</option>
                        <option value="MV">Mecklenburg-Vorpommern</option>
                        <option value="NI">Niedersachsen</option>
                        <option value="NW">Nordrhein-Westfalen</option>
                        <option value="RP">Rheinland-Pfalz</option>
                        <option value="SL">Saarland</option>
                        <option value="SN">Sachsen</option>
                        <option value="ST">Sachsen-Anhalt</option>
                        <option value="SH">Schleswig-Holstein</option>
                        <option value="TH">Thüringen</option>
                      </select>
                      <p className="text-[10px] text-white/40 mt-1">Wichtig für Landesbehörden</p>
                    </div>

                    {/* LANDKREIS */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Landkreis / Kreisfreie Stadt
                        <span className="ml-2 text-[10px] text-white/40">(für Jobcenter-Zuordnung)</span>
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
                        placeholder="z.B. Landkreis München, Stadt Berlin"
                      />
                    </div>
                  </div>
                </div>

                {/* ABWEICHENDE POSTANSCHRIFT */}
                <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                      <span className="text-lg">📬</span>
                      Abweichende Postanschrift
                    </h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span className="text-xs text-white/60">Postanschrift weicht ab</span>
                    </label>
                  </div>
                  <p className="text-xs text-white/50">
                    Gemäß § 21 Abs. 3 BMG (Bundesmeldegesetz) können Sie eine abweichende Postanschrift angeben,
                    wenn Ihre Post nicht an die Meldeadresse zugestellt werden soll.
                  </p>
                </div>

                {/* KONTAKTDATEN */}
                <div className="space-y-4">
                  <h4 className="text-base font-semibold text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-sm">2</span>
                    Kontaktdaten für Rückfragen
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* TELEFON MOBIL */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Mobiltelefon
                        <span className="ml-2 text-[10px] text-white/40">(bevorzugt für SMS-TAN)</span>
                      </label>
                      <div className="flex gap-2">
                        <select className="w-24 px-2 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                          <option>+49</option>
                          <option>+43</option>
                          <option>+41</option>
                        </select>
                        <input 
                          type="tel" 
                          className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
                          placeholder="151 12345678"
                          pattern="[0-9\s]{10,15}"
                        />
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Für 2FA und Benachrichtigungen</p>
                    </div>

                    {/* TELEFON FESTNETZ */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Festnetz
                        <span className="ml-2 text-[10px] text-white/40">(optional)</span>
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          className="w-24 px-2 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="030"
                        />
                        <input 
                          type="tel" 
                          className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
                          placeholder="12345678"
                        />
                      </div>
                    </div>

                    {/* E-MAIL */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        E-Mail-Adresse <span className="text-rose-400">*</span>
                        <span className="ml-2 text-[10px] text-white/40">(für digitale Bescheide)</span>
                      </label>
                      <input 
                        type="email" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
                        placeholder="max.mustermann@email.de"
                        required
                      />
                      <div className="mt-2 flex items-start gap-2">
                        <input type="checkbox" className="mt-0.5" />
                        <label className="text-xs text-white/60">
                          Ich stimme der elektronischen Zustellung von Bescheiden zu (§ 122a AO, § 36a SGB I)
                        </label>
                      </div>
                    </div>

                    {/* DE-MAIL */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        De-Mail
                        <span className="ml-2 text-[10px] text-white/40">(für rechtssichere Kommunikation)</span>
                      </label>
                      <input 
                        type="email" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
                        placeholder="max.mustermann@provider.de-mail.de"
                      />
                      <p className="text-[10px] text-white/40 mt-1">
                        De-Mail ermöglicht rechtsverbindliche elektronische Kommunikation mit Behörden
                      </p>
                    </div>
                  </div>
                </div>

                {/* ERREICHBARKEIT */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/20">
                  <h4 className="text-sm font-semibold text-purple-300 mb-3">Erreichbarkeit für Behörden</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/60 block mb-2">Beste Erreichbarkeit</label>
                      <select className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                        <option>Montag - Freitag: 8-12 Uhr</option>
                        <option>Montag - Freitag: 13-17 Uhr</option>
                        <option>Montag - Freitag: ganztags</option>
                        <option>Flexibel</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/60 block mb-2">Bevorzugter Kontaktweg</label>
                      <select className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                        <option>E-Mail</option>
                        <option>Mobiltelefon</option>
                        <option>Festnetz</option>
                        <option>Briefpost</option>
                        <option>De-Mail</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* VALIDIERUNG & VERIFIZIERUNG */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 text-xl">✅</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-300">Automatische Adressvalidierung</p>
                      <p className="text-xs text-emerald-200/70">
                        Ihre Adresse wird gegen das Bundesamt für Kartographie und Geodäsie (BKG) validiert
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-medium hover:bg-emerald-500/30">
                      Jetzt validieren
                    </button>
                  </div>
                </div>

                {/* DATENSCHUTZ INFO */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                  <div className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">🔒</span>
                    <div className="text-xs text-white/50">
                      <p className="font-medium text-white/70 mb-1">Datenschutzhinweis gemäß Art. 13 DSGVO:</p>
                      <p>Ihre Kontaktdaten werden ausschließlich zur Bearbeitung Ihrer Anträge und zur Kommunikation mit den zuständigen Behörden verwendet. 
                      Die Speicherung erfolgt verschlüsselt nach dem Stand der Technik (AES-256). 
                      Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie gesetzliche Verpflichtungen nach SGB, AO und BMG.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'bank' && (
              <div className="space-y-6">
                {/* SEPA & ZAHLUNGSVERKEHR HEADER */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🏦</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-emerald-300 mb-1">Wichtiger Hinweis zum Zahlungsverkehr</h4>
                      <p className="text-xs text-white/60">
                        Ihre Bankdaten werden gemäß PSD2-Richtlinie (EU) 2015/2366 und § 675f BGB verarbeitet. 
                        SEPA-Lastschriften erfolgen ausschließlich mit vorheriger Ankündigung (Pre-Notification).
                      </p>
                    </div>
                  </div>
                </div>

                {/* HAUPTKONTO */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center text-sm">💳</span>
                      Hauptkonto für Auszahlungen
                    </h4>
                    <span className="px-3 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-300 rounded-full">
                      SEPA-VERIFIZIERT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* KONTOINHABER */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Kontoinhaber <span className="text-rose-400">*</span>
                        <span className="ml-2 text-[10px] text-white/40">(wie auf Kontoauszug)</span>
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
                        placeholder="Max Mustermann"
                        pattern="[A-Za-zÄÖÜäöüß\s\-\.]{2,}"
                        required
                      />
                      <p className="text-[10px] text-white/40 mt-1">Muss mit dem Antragsteller übereinstimmen (KYC-Prüfung)</p>
                    </div>

                    {/* IBAN */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        IBAN <span className="text-rose-400">*</span>
                        <span className="ml-2 text-[10px] text-white/40">(International Bank Account Number)</span>
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 font-mono"
                        placeholder="DE89 3704 0044 0532 0130 00"
                        pattern="[A-Z]{2}[0-9]{2}\s?([0-9]{4}\s?){4}[0-9]{2}"
                        maxLength="27"
                        required
                        onInput={(e) => {
                          // Auto-Format IBAN mit Leerzeichen
                          let value = e.target.value.replace(/\s/g, '').toUpperCase();
                          let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                          e.target.value = formatted;
                        }}
                      />
                      <p className="text-[10px] text-white/40 mt-1">Deutsche IBAN: DE + 20 Ziffern</p>
                    </div>

                    {/* BIC */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        BIC/SWIFT
                        <span className="ml-2 text-[10px] text-white/40">(automatisch ermittelt)</span>
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 font-mono"
                        placeholder="COBADEFFXXX"
                        pattern="[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?"
                        maxLength="11"
                      />
                      <p className="text-[10px] text-white/40 mt-1">Wird aus IBAN ermittelt</p>
                    </div>

                    {/* BANKNAME */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Bank/Institut
                        <span className="ml-2 text-[10px] text-white/40">(automatisch)</span>
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
                        placeholder="Commerzbank AG"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* KONTOTYP & VERWENDUNG */}
                <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <h4 className="text-sm font-semibold text-blue-300 mb-3">Kontoinformationen & Verwendungszweck</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Kontotyp
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="girokonto">Girokonto (Standard)</option>
                        <option value="sparkonto">Sparkonto</option>
                        <option value="gemeinschaftskonto">Gemeinschaftskonto</option>
                        <option value="geschaeftskonto">Geschäftskonto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Verwendungszweck
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="alle">Alle Zahlungen</option>
                        <option value="kindergeld">Nur Kindergeld</option>
                        <option value="wohngeld">Nur Wohngeld</option>
                        <option value="buergergeld">Nur Bürgergeld</option>
                        <option value="elterngeld">Nur Elterngeld</option>
                      </select>
                    </div>

                    {/* GEMEINSCHAFTSKONTO INFO */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Weitere Kontoinhaber
                        <span className="ml-2 text-[10px] text-white/40">(bei Gemeinschaftskonto)</span>
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="z.B. Erika Mustermann"
                      />
                      <p className="text-[10px] text-white/40 mt-1">
                        Bei Gemeinschaftskonten: Vollmacht aller Kontoinhaber erforderlich
                      </p>
                    </div>
                  </div>
                </div>

                {/* SEPA-MANDAT */}
                <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">📋</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">SEPA-Lastschriftmandat</h4>
                      <p className="text-xs text-white/60 mb-3">
                        Für wiederkehrende Zahlungen (z.B. Rückforderungen) kann ein SEPA-Mandat erforderlich sein.
                      </p>
                      
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" className="mt-0.5" />
                          <div className="text-xs text-white/70">
                            <p className="font-medium text-white/90 mb-1">Einwilligung zum SEPA-Lastschriftverfahren</p>
                            <p>
                              Ich ermächtige die zuständige Behörde, Zahlungen von meinem Konto mittels SEPA-Lastschrift 
                              einzuziehen. Zugleich weise ich mein Kreditinstitut an, die gezogenen Lastschriften einzulösen.
                            </p>
                            <p className="mt-1 text-[10px] text-white/50">
                              Mandatsreferenz wird nach Antragstellung vergeben. Gläubiger-ID der Behörde wird mitgeteilt.
                            </p>
                          </div>
                        </label>

                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-[11px] text-white/60">
                            <strong>Ihre Rechte:</strong> 8 Wochen Widerspruchsrecht ab Belastungsdatum. 
                            Bei unberechtigten Lastschriften: 13 Monate Erstattungsrecht.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ALTERNATIVE ZAHLUNGSMETHODEN */}
                <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <h4 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
                    <span>💰</span>
                    Alternative Auszahlungswege
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="payment" value="bank" defaultChecked />
                      <div>
                        <p className="text-sm text-white/90">Banküberweisung (Standard)</p>
                        <p className="text-xs text-white/50">1-2 Werktage, kostenlos</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="payment" value="postbank" />
                      <div>
                        <p className="text-sm text-white/90">Postbank Bareinzahlung</p>
                        <p className="text-xs text-white/50">Für Personen ohne Bankkonto, Gebühr: 2,50€</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="payment" value="scheck" />
                      <div>
                        <p className="text-sm text-white/90">Verrechnungsscheck</p>
                        <p className="text-xs text-white/50">5-7 Werktage, nur in Ausnahmefällen</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* VERIFIZIERUNG */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 text-xl">✅</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-300">Automatische IBAN-Validierung</p>
                      <p className="text-xs text-emerald-200/70">
                        Ihre IBAN wird gegen die Bundesbank-Datenbank validiert (Prüfziffer-Check)
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-medium hover:bg-emerald-500/30">
                      Konto verifizieren
                    </button>
                  </div>
                </div>

                {/* SICHERHEITSHINWEISE */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                  <div className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">🔒</span>
                    <div className="text-xs text-white/50">
                      <p className="font-medium text-white/70 mb-1">Datensicherheit & Verschlüsselung:</p>
                      <ul className="space-y-1">
                        <li>• TLS 1.3 verschlüsselte Übertragung</li>
                        <li>• AES-256 Verschlüsselung in Datenbank</li>
                        <li>• PCI DSS Level 1 konform</li>
                        <li>• Keine Weitergabe an Dritte (außer zuständige Behörde)</li>
                        <li>• Löschung nach 10 Jahren (gesetzliche Aufbewahrung)</li>
                      </ul>
                      <p className="mt-2">
                        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. c DSGVO i.V.m. § 147 AO, § 257 HGB
                      </p>
                    </div>
                  </div>
                </div>

                {/* PFÄNDUNGSSCHUTZ INFO */}
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex items-start gap-3">
                    <span className="text-indigo-400">⚖️</span>
                    <div>
                      <p className="text-sm font-medium text-indigo-300 mb-1">P-Konto (Pfändungsschutzkonto)</p>
                      <p className="text-xs text-white/60">
                        Falls Sie ein P-Konto haben, geben Sie dies bitte bei der zuständigen Stelle an. 
                        Sozialleistungen sind grundsätzlich unpfändbar (§ 54 SGB I).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'krankenversicherung' && (
              <div className="space-y-6">
                {/* SGB V HEADER */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🏥</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-rose-300 mb-1">Krankenversicherungspflicht in Deutschland</h4>
                      <p className="text-xs text-white/60">
                        Gemäß § 5 SGB V besteht in Deutschland Versicherungspflicht. Ihre Daten werden nach § 284 SGB V 
                        und § 206 SGB V (Schweigepflicht) streng vertraulich behandelt.
                      </p>
                    </div>
                  </div>
                </div>

                {/* VERSICHERUNGSSTATUS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-sm">❤️</span>
                      Aktueller Versicherungsstatus
                    </h4>
                    <span className="px-3 py-1 text-xs font-medium bg-rose-500/20 text-rose-300 rounded-full">
                      PFLICHTANGABE FÜR LEISTUNGEN
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* VERSICHERUNGSART */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Versicherungsart <span className="text-rose-400">*</span>
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" required>
                        <option value="">Bitte wählen...</option>
                        <option value="gkv_pflicht">Gesetzlich pflichtversichert</option>
                        <option value="gkv_freiwillig">Gesetzlich freiwillig versichert</option>
                        <option value="gkv_familie">Gesetzlich familienversichert</option>
                        <option value="pkv">Privat versichert</option>
                        <option value="pkv_beihilfe">Privat mit Beihilfe</option>
                        <option value="eu_ausland">EU-Auslandskrankenversicherung</option>
                        <option value="nicht_versichert">Nicht versichert (Notfallbehandlung)</option>
                      </select>
                      <p className="text-[10px] text-white/40 mt-1">Wichtig für Kostenübernahme und Zuzahlungsbefreiung</p>
                    </div>

                    {/* KRANKENKASSE */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Krankenkasse/Versicherung <span className="text-rose-400">*</span>
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" required>
                        <option value="">Bitte wählen...</option>
                        <optgroup label="Große Ersatzkassen">
                          <option value="tk">Techniker Krankenkasse (TK)</option>
                          <option value="barmer">BARMER</option>
                          <option value="dak">DAK-Gesundheit</option>
                          <option value="kkh">KKH Kaufmännische Krankenkasse</option>
                          <option value="hek">HEK - Hanseatische Krankenkasse</option>
                          <option value="hkk">hkk Krankenkasse</option>
                        </optgroup>
                        <optgroup label="Allgemeine Ortskrankenkassen (AOK)">
                          <option value="aok_bayern">AOK Bayern</option>
                          <option value="aok_bw">AOK Baden-Württemberg</option>
                          <option value="aok_plus">AOK PLUS (Sachsen/Thüringen)</option>
                          <option value="aok_nordost">AOK Nordost</option>
                          <option value="aok_nordwest">AOK NordWest</option>
                          <option value="aok_niedersachsen">AOK Niedersachsen</option>
                          <option value="aok_rheinland">AOK Rheinland/Hamburg</option>
                          <option value="aok_rheinlandpfalz">AOK Rheinland-Pfalz/Saarland</option>
                          <option value="aok_hessen">AOK Hessen</option>
                          <option value="aok_sachsenanhalt">AOK Sachsen-Anhalt</option>
                          <option value="aok_bremen">AOK Bremen/Bremerhaven</option>
                        </optgroup>
                        <optgroup label="Betriebskrankenkassen (BKK)">
                          <option value="bkk_mobil">BKK Mobil Oil</option>
                          <option value="bkk_vbu">BKK VBU</option>
                          <option value="siemens_bkk">Siemens-BKK</option>
                          <option value="bmw_bkk">BMW BKK</option>
                          <option value="bosch_bkk">Bosch BKK</option>
                        </optgroup>
                        <optgroup label="Innungskrankenkassen (IKK)">
                          <option value="ikk_classic">IKK classic</option>
                          <option value="ikk_gesundplus">IKK gesund plus</option>
                          <option value="ikk_nord">IKK Nord</option>
                          <option value="ikk_suedwest">IKK Südwest</option>
                          <option value="ikk_bb">IKK Brandenburg/Berlin</option>
                        </optgroup>
                        <optgroup label="Private Krankenversicherungen">
                          <option value="allianz_pkv">Allianz PKV</option>
                          <option value="debeka">Debeka</option>
                          <option value="dkv">DKV</option>
                          <option value="axa">AXA</option>
                          <option value="signal_iduna">Signal Iduna</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* IK-NUMMER */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        IK-Nummer der Krankenkasse
                        <span className="ml-2 text-[10px] text-white/40">(9-stellig)</span>
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="108018005"
                        pattern="[0-9]{9}"
                        maxLength="9"
                      />
                      <p className="text-[10px] text-white/40 mt-1">Institutionskennzeichen für Abrechnung</p>
                    </div>

                    {/* VERSICHERTENNUMMER */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Versichertennummer <span className="text-rose-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono"
                        placeholder="A123456789"
                        pattern="[A-Z][0-9]{9}"
                        maxLength="10"
                        required
                        onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                      />
                      <p className="text-[10px] text-white/40 mt-1">Krankenversichertennummer (KVNR) auf Ihrer Gesundheitskarte</p>
                    </div>

                    {/* VERSICHERTENSTATUS */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Versichertenstatus <span className="text-rose-400">*</span>
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" required>
                        <option value="">Bitte wählen...</option>
                        <option value="1">Mitglied</option>
                        <option value="3">Familienversicherter</option>
                        <option value="5">Rentner</option>
                      </select>
                      <p className="text-[10px] text-white/40 mt-1">Statusziffer für Abrechnungen</p>
                    </div>

                    {/* GÜLTIGKEIT */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Versichert seit
                      </label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                      />
                    </div>

                    {/* GÜLTIG BIS */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Gültig bis
                        <span className="ml-2 text-[10px] text-white/40">(bei befristeter Versicherung)</span>
                      </label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* ZUSATZVERSICHERUNGEN */}
                <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                  <h4 className="text-sm font-semibold text-indigo-300 mb-3">Zusatzversicherungen (optional)</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Zahnzusatzversicherung</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Krankenhaus-Zusatzversicherung</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Ambulante Zusatzversicherung</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Pflegezusatzversicherung</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Krankentagegeld</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Auslandsreise-Krankenversicherung</span>
                    </label>
                  </div>
                </div>

                {/* ZUZAHLUNGSBEFREIUNG */}
                <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">💊</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-emerald-300 mb-2">Zuzahlungsbefreiung (§ 62 SGB V)</h4>
                      <p className="text-xs text-white/60 mb-3">
                        Bei geringem Einkommen können Sie von Zuzahlungen befreit werden (2% bzw. 1% des Bruttoeinkommens).
                      </p>
                      
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" className="mt-0.5" />
                          <div className="text-xs text-white/70">
                            <p className="font-medium text-white/90 mb-1">Ich habe eine Zuzahlungsbefreiung</p>
                            <p>Belastungsgrenze wurde erreicht oder chronisch krank (1% Regelung)</p>
                          </div>
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-white/60 mb-1">Gültig von</label>
                            <input type="date" className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs" />
                          </div>
                          <div>
                            <label className="block text-xs text-white/60 mb-1">Gültig bis</label>
                            <input type="date" className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WAHLTARIFE & BONUSPROGRAMME */}
                <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <h4 className="text-sm font-semibold text-purple-300 mb-3">Wahltarife & Bonusprogramme</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <div>
                        <span className="text-sm text-white/80">Selbstbehalt-Tarif</span>
                        <p className="text-xs text-white/50">Prämienrückerstattung bei Nichtinanspruchnahme</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <div>
                        <span className="text-sm text-white/80">Hausarzttarif (§ 73b SGB V)</span>
                        <p className="text-xs text-white/50">Hausarzt als erster Ansprechpartner</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <div>
                        <span className="text-sm text-white/80">DMP (Disease-Management-Programm)</span>
                        <p className="text-xs text-white/50">Bei chronischen Erkrankungen</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <div>
                        <span className="text-sm text-white/80">Bonusprogramm aktiv</span>
                        <p className="text-xs text-white/50">Punkte sammeln für Gesundheitsaktivitäten</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* EUROPÄISCHE KRANKENVERSICHERUNG */}
                <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">🇪🇺</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-300 mb-2">Europäische Krankenversicherungskarte (EHIC)</h4>
                      <p className="text-xs text-white/60 mb-3">
                        Für Notfallbehandlungen im EU-Ausland. Auf Rückseite Ihrer Gesundheitskarte.
                      </p>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm text-white/80">EHIC vorhanden und gültig</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* BEITRAGSINFORMATIONEN */}
                <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <h4 className="text-sm font-semibold text-amber-300 mb-3">Beitragsinformationen</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Beitragssatz
                        <span className="ml-2 text-[10px] text-white/40">(inkl. Zusatzbeitrag)</span>
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.1"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="16.2"
                        />
                        <span className="flex items-center px-3 text-white/60">%</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Durchschnitt 2024: 16,2%</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Monatlicher Beitrag
                        <span className="ml-2 text-[10px] text-white/40">(bei Selbstzahler)</span>
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="200.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VERIFIZIERUNG */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 text-xl">✅</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-300">Automatische Versicherungsverifikation</p>
                      <p className="text-xs text-emerald-200/70">
                        Versicherungsstatus wird über das GKV-Netzwerk verifiziert (§ 291a SGB V)
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-medium hover:bg-emerald-500/30">
                      Status prüfen
                    </button>
                  </div>
                </div>

                {/* DATENSCHUTZ INFO */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                  <div className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">🔒</span>
                    <div className="text-xs text-white/50">
                      <p className="font-medium text-white/70 mb-1">Besonderer Datenschutz für Gesundheitsdaten:</p>
                      <ul className="space-y-1">
                        <li>• Art. 9 DSGVO (Besondere Kategorien personenbezogener Daten)</li>
                        <li>• § 203 StGB (Schweigepflicht)</li>
                        <li>• § 35 SGB I (Sozialgeheimnis)</li>
                        <li>• § 67 SGB X (Sozialdatenschutz)</li>
                        <li>• Keine Weitergabe ohne explizite Einwilligung</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'wohnung' && (
              <div className="space-y-6">
                {/* KDU HEADER */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🏠</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-300 mb-1">Kosten der Unterkunft (KdU) - § 22 SGB II / § 35 SGB XII</h4>
                      <p className="text-xs text-white/60">
                        Ihre Angaben sind entscheidend für die Berechnung von Wohngeld (WoGG), Bürgergeld und anderen 
                        wohnungsbezogenen Leistungen. Die Angemessenheit richtet sich nach örtlichen Richtwerten.
                      </p>
                    </div>
                  </div>
                </div>

                {/* WOHNSTATUS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-sm">🔑</span>
                      Aktueller Wohnstatus
                    </h4>
                    <span className="px-3 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full">
                      KDU-RELEVANT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* WOHNVERHÄLTNIS */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Wohnverhältnis <span className="text-rose-400">*</span>
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" required>
                        <option value="">Bitte wählen...</option>
                        <option value="miete">Mietwohnung/Mietshaus</option>
                        <option value="eigentum">Eigentumswohnung/Eigenheim</option>
                        <option value="untermiete">Untermiete/WG</option>
                        <option value="eltern">Bei Eltern/Familie</option>
                        <option value="sozialwohnung">Sozialwohnung (§ 5 WoFG)</option>
                        <option value="betreutes">Betreutes Wohnen</option>
                        <option value="heim">Wohnheim/Internat</option>
                        <option value="obdachlos">Obdachlos/ohne festen Wohnsitz</option>
                        <option value="sonstiges">Sonstiges</option>
                      </select>
                      <p className="text-[10px] text-white/40 mt-1">Wichtig für Angemessenheitsprüfung nach § 22 Abs. 1 SGB II</p>
                    </div>

                    {/* WOHNFLÄCHE */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Wohnfläche <span className="text-rose-400">*</span>
                        <span className="ml-2 text-[10px] text-white/40">(nach WoFlV)</span>
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="65.50"
                          required
                        />
                        <span className="flex items-center px-3 text-white/60">m²</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Angemessen: 1P=50m², 2P=65m², 3P=80m², 4P=95m²</p>
                    </div>

                    {/* ZIMMERANZAHL */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Anzahl Zimmer <span className="text-rose-400">*</span>
                        <span className="ml-2 text-[10px] text-white/40">(ohne Bad/Küche)</span>
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" required>
                        <option value="">Wählen...</option>
                        <option value="1">1 Zimmer</option>
                        <option value="1.5">1,5 Zimmer</option>
                        <option value="2">2 Zimmer</option>
                        <option value="2.5">2,5 Zimmer</option>
                        <option value="3">3 Zimmer</option>
                        <option value="3.5">3,5 Zimmer</option>
                        <option value="4">4 Zimmer</option>
                        <option value="5">5+ Zimmer</option>
                      </select>
                    </div>

                    {/* PERSONEN IM HAUSHALT */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Personen im Haushalt <span className="text-rose-400">*</span>
                      </label>
                      <input 
                        type="number" 
                        min="1"
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="2"
                        required
                      />
                      <p className="text-[10px] text-white/40 mt-1">Bedarfsgemeinschaft nach § 7 SGB II</p>
                    </div>

                    {/* EINZUGSDATUM */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Einzugsdatum
                      </label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* MIETKOSTEN DETAILS */}
                <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                  <h4 className="text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                    <span>💶</span>
                    Mietkosten & Nebenkosten (monatlich)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* KALTMIETE */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Kaltmiete/Grundmiete <span className="text-rose-400">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="450.00"
                          required
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Nettokaltmiete ohne Betriebskosten</p>
                    </div>

                    {/* BETRIEBSKOSTEN */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Betriebskosten-Vorauszahlung <span className="text-rose-400">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="120.00"
                          required
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Kalte Betriebskosten nach BetrKV</p>
                    </div>

                    {/* HEIZKOSTEN */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Heizkosten-Vorauszahlung <span className="text-rose-400">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="80.00"
                          required
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Heizung & Warmwasser</p>
                    </div>

                    {/* WARMMIETE GESAMT */}
                    <div>
                      <label className="block text-xs font-medium text-emerald-300 mb-1.5">
                        Warmmiete gesamt
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 font-semibold text-sm"
                          placeholder="650.00"
                          readOnly
                        />
                        <span className="flex items-center px-3 text-emerald-300">€</span>
                      </div>
                      <p className="text-[10px] text-emerald-300/60 mt-1">Kaltmiete + NK + Heizung</p>
                    </div>
                  </div>
                </div>

                {/* ZUSÄTZLICHE KOSTEN */}
                <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <h4 className="text-sm font-semibold text-purple-300 mb-3">Zusätzliche Wohnkosten (nicht in NK)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] text-white/60">Strom</label>
                      <div className="flex gap-1">
                        <input type="number" step="0.01" className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs" placeholder="45" />
                        <span className="text-xs text-white/40">€</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/60">Internet/Telefon</label>
                      <div className="flex gap-1">
                        <input type="number" step="0.01" className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs" placeholder="40" />
                        <span className="text-xs text-white/40">€</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/60">Garage/Stellplatz</label>
                      <div className="flex gap-1">
                        <input type="number" step="0.01" className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs" placeholder="50" />
                        <span className="text-xs text-white/40">€</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/60">Kabel/GEZ</label>
                      <div className="flex gap-1">
                        <input type="number" step="0.01" className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs" placeholder="18.36" />
                        <span className="text-xs text-white/40">€</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 mt-2">GEZ-Befreiung möglich bei Sozialleistungsbezug</p>
                </div>

                {/* HEIZUNGSART & ENERGIE */}
                <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <h4 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
                    <span>🔥</span>
                    Heizung & Energieversorgung
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Heizungsart <span className="text-rose-400">*</span>
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="">Bitte wählen...</option>
                        <option value="zentral">Zentralheizung</option>
                        <option value="fernwaerme">Fernwärme</option>
                        <option value="gas">Gasheizung</option>
                        <option value="oel">Ölheizung</option>
                        <option value="nachtspeicher">Nachtspeicher</option>
                        <option value="waermepumpe">Wärmepumpe</option>
                        <option value="pellets">Pelletheizung</option>
                        <option value="solar">Solarthermie</option>
                        <option value="ofen">Einzelöfen/Kamin</option>
                      </select>
                      <p className="text-[10px] text-white/40 mt-1">Wichtig für Heizkostenberechnung</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Warmwasser
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="zentral">Zentral (in Heizung)</option>
                        <option value="durchlauf">Durchlauferhitzer</option>
                        <option value="boiler">Boiler</option>
                        <option value="gastherme">Gastherme</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Energieausweis-Typ
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="">Nicht vorhanden</option>
                        <option value="verbrauch">Verbrauchsausweis</option>
                        <option value="bedarf">Bedarfsausweis</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Energieeffizienzklasse
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="">Unbekannt</option>
                        <option value="A+">A+ (&lt;30 kWh/m²a)</option>
                        <option value="A">A (30-50)</option>
                        <option value="B">B (50-75)</option>
                        <option value="C">C (75-100)</option>
                        <option value="D">D (100-130)</option>
                        <option value="E">E (130-160)</option>
                        <option value="F">F (160-200)</option>
                        <option value="G">G (200-250)</option>
                        <option value="H">H (&gt;250)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* VERMIETER INFO */}
                <div className="p-5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <h4 className="text-sm font-semibold text-rose-300 mb-3 flex items-center gap-2">
                    <span>🏢</span>
                    Vermieter/Hausverwaltung
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Name Vermieter/Verwaltung
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="z.B. Wohnungsgesellschaft mbH"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Telefon
                      </label>
                      <input 
                        type="tel" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="+49 30 123456"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        E-Mail
                      </label>
                      <input 
                        type="email" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="verwaltung@beispiel.de"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <div>
                          <span className="text-sm text-white/80">Direktzahlung durch Amt möglich</span>
                          <p className="text-xs text-white/50">§ 22 Abs. 7 SGB II - Miete wird direkt überwiesen</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* MIETVERTRAG */}
                <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <h4 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                    <span>📄</span>
                    Mietvertrag & Kündigungsfristen
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Vertragsart
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="unbefristet">Unbefristet</option>
                        <option value="befristet">Befristet</option>
                        <option value="staffel">Staffelmiete</option>
                        <option value="index">Indexmiete</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Befristet bis
                      </label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Kündigungsfrist
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="3">3 Monate (gesetzlich)</option>
                        <option value="1">1 Monat</option>
                        <option value="2">2 Monate</option>
                        <option value="6">6 Monate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Kaution
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="1350"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Max. 3 Kaltmieten (§ 551 BGB)</p>
                    </div>
                  </div>
                </div>

                {/* BARRIEREFREIHEIT */}
                <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                  <h4 className="text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                    <span>♿</span>
                    Barrierefreiheit & Ausstattung
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-xs text-white/80">Barrierefrei</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-xs text-white/80">Rollstuhlgerecht</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-xs text-white/80">Aufzug</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-xs text-white/80">Erdgeschoss</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-xs text-white/80">Behindertengerechtes Bad</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-xs text-white/80">Notrufsystem</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-xs text-white/80">Balkon/Terrasse</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-xs text-white/80">Garten</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-xs text-white/80">Keller</span>
                    </label>
                  </div>
                </div>

                {/* ANGEMESSENHEITSPRÜFUNG */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 text-xl">✅</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-300">Automatische Angemessenheitsprüfung</p>
                      <p className="text-xs text-emerald-200/70">
                        Prüfung nach örtlichen Richtwerten (AV-Wohnen) und Mietobergrenzen
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-medium hover:bg-emerald-500/30">
                      KdU prüfen
                    </button>
                  </div>
                </div>

                {/* DATENSCHUTZ INFO */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                  <div className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">🔒</span>
                    <div className="text-xs text-white/50">
                      <p className="font-medium text-white/70 mb-1">Datenschutz Wohndaten:</p>
                      <ul className="space-y-1">
                        <li>• Meldedaten nach BMG (Bundesmeldegesetz)</li>
                        <li>• Weitergabe nur an Behörden (§ 67 SGB X)</li>
                        <li>• Vermieter-Kontakt nur mit Einwilligung</li>
                        <li>• Speicherdauer: 6 Jahre (§ 84 SGB X)</li>
                      </ul>
                      <p className="mt-2">
                        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. e DSGVO i.V.m. § 22 SGB II
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'einkommen' && (
              <div className="space-y-6">
                {/* § 11 SGB II HEADER */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">💰</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-emerald-300 mb-1">Einkommen und Einnahmen - § 11 SGB II / § 82 SGB XII</h4>
                      <p className="text-xs text-white/60">
                        Alle Einnahmen in Geld oder Geldeswert sind anzugeben. Die Anrechnung erfolgt nach 
                        gesetzlichen Freibeträgen (§ 11b SGB II). Bruttoeinkommen wird auf Netto umgerechnet.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ERWERBSEINKOMMEN */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center text-sm">💼</span>
                      Erwerbseinkommen
                    </h4>
                    <span className="px-3 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-300 rounded-full">
                      FREIBETRÄGE NACH § 11B
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* BESCHÄFTIGUNGSSTATUS */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Beschäftigungsstatus <span className="text-rose-400">*</span>
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" required>
                        <option value="">Bitte wählen...</option>
                        <option value="vollzeit">Vollzeit (sozialversicherungspflichtig)</option>
                        <option value="teilzeit">Teilzeit (sozialversicherungspflichtig)</option>
                        <option value="minijob">Minijob (450€/520€)</option>
                        <option value="midijob">Midijob (520,01€ - 2.000€)</option>
                        <option value="selbstaendig">Selbständig/Freiberuflich</option>
                        <option value="beamter">Beamter/Pensionär</option>
                        <option value="azubi">Auszubildender</option>
                        <option value="student">Student/Werkstudent</option>
                        <option value="praktikum">Praktikant</option>
                        <option value="arbeitslos">Arbeitslos</option>
                        <option value="erwerbsunfaehig">Erwerbsunfähig</option>
                        <option value="rente">Rentner</option>
                        <option value="elternzeit">Elternzeit</option>
                        <option value="hausfrau">Hausfrau/Hausmann</option>
                      </select>
                      <p className="text-[10px] text-white/40 mt-1">Wichtig für Freibetragsberechnung nach § 11b SGB II</p>
                    </div>

                    {/* BRUTTOEINKOMMEN */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Bruttoeinkommen (monatlich)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="2500.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Vor Steuern und Sozialabgaben</p>
                    </div>

                    {/* NETTOEINKOMMEN */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Nettoeinkommen (monatlich)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="1650.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Nach Abzügen (Lohnsteuerbescheinigung)</p>
                    </div>

                    {/* STEUERKLASSE */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Steuerklasse
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="">Keine/Nicht relevant</option>
                        <option value="1">Klasse I - Ledig</option>
                        <option value="2">Klasse II - Alleinerziehend</option>
                        <option value="3">Klasse III - Verheiratet (höheres Einkommen)</option>
                        <option value="4">Klasse IV - Verheiratet (gleich)</option>
                        <option value="5">Klasse V - Verheiratet (niedrigeres Einkommen)</option>
                        <option value="6">Klasse VI - Zweitjob</option>
                      </select>
                    </div>

                    {/* ARBEITGEBER */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Arbeitgeber
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="Firma GmbH"
                      />
                    </div>
                  </div>
                </div>

                {/* SOZIALLEISTUNGEN */}
                <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <h4 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
                    <span>🏛️</span>
                    Sozialleistungen & Transfereinkommen
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Arbeitslosengeld I
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">§ 136ff SGB III</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Bürgergeld (ALG II)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Regelsatz 2024: 563€</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Wohngeld
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Krankengeld
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAMILIENBEZOGENE LEISTUNGEN */}
                <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <h4 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                    <span>👨‍👩‍👧‍👦</span>
                    Familienbezogene Leistungen
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Kindergeld (gesamt)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="250.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">2024: 250€ pro Kind</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Elterngeld
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">BEEG - max. 1.800€</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Unterhalt (erhalten)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Unterhaltsvorschuss
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">UVG - altersgestaffelt</p>
                    </div>
                  </div>
                </div>

                {/* RENTEN & PENSIONEN */}
                <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <h4 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
                    <span>🏛️</span>
                    Renten & Pensionen
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Altersrente
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Erwerbsminderungsrente
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Volle/Teilweise EM-Rente</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Witwenrente/Waisenrente
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Betriebsrente/Pension
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WEITERE EINKÜNFTE */}
                <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                  <h4 className="text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                    <span>💎</span>
                    Weitere Einkünfte
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Mieteinnahmen (netto)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Kapitalerträge
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Zinsen, Dividenden</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        BAföG/Berufsausbildungsbeihilfe
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Sonstige Einkünfte
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FREIBETRÄGE INFO */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="text-sm font-semibold text-emerald-300 mb-2">§ 11b SGB II - Freibeträge vom Einkommen</h4>
                  <div className="text-xs text-emerald-200/70 space-y-1">
                    <p>• Grundfreibetrag: 100€ bei Erwerbstätigkeit</p>
                    <p>• 20% von 100€ bis 1.000€ (max. 180€)</p>
                    <p>• 10% von 1.000€ bis 1.200€/1.500€ (max. 20€/50€)</p>
                    <p>• Gesamt max. 300€ (ohne Kinder) / 330€ (mit Kindern)</p>
                  </div>
                </div>

                {/* GESAMTEINKOMMEN */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-300">Gesamteinkommen (monatlich)</p>
                      <p className="text-xs text-emerald-200/70">
                        Summe aller Einkünfte vor Freibeträgen
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-300">0,00 €</p>
                      <p className="text-xs text-emerald-200/70">Wird automatisch berechnet</p>
                    </div>
                  </div>
                </div>

                {/* DATENSCHUTZ INFO */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                  <div className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">🔒</span>
                    <div className="text-xs text-white/50">
                      <p className="font-medium text-white/70 mb-1">Datenschutz bei Einkommensdaten:</p>
                      <ul className="space-y-1">
                        <li>• Steuerdaten unterliegen § 30 AO (Steuergeheimnis)</li>
                        <li>• Sozialleistungsdaten nach § 35 SGB I</li>
                        <li>• Keine Weitergabe ohne gesetzliche Grundlage</li>
                        <li>• Speicherdauer: 10 Jahre (§ 147 AO)</li>
                      </ul>
                      <p className="mt-2">
                        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. c DSGVO i.V.m. § 60 SGB I
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'partner' && (
              <div className="space-y-6">
                {/* BEDARFSGEMEINSCHAFT HEADER */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">👫</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-pink-300 mb-1">Partner/in und Bedarfsgemeinschaft - § 7 SGB II</h4>
                      <p className="text-xs text-white/60">
                        Partner bilden eine Bedarfsgemeinschaft wenn sie länger als ein Jahr zusammenleben, 
                        gemeinsame Kinder haben oder füreinander einstehen (Verantwortungs- und Einstehensgemeinschaft).
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAMILIENSTAND */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-sm">💑</span>
                      Familienstand & Partnerschaft
                    </h4>
                    <span className="px-3 py-1 text-xs font-medium bg-pink-500/20 text-pink-300 rounded-full">
                      BEDARFSGEMEINSCHAFT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* FAMILIENSTAND */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Familienstand <span className="text-rose-400">*</span>
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" required>
                        <option value="">Bitte wählen...</option>
                        <option value="ledig">Ledig</option>
                        <option value="verheiratet">Verheiratet</option>
                        <option value="eingetragene_partnerschaft">Eingetragene Lebenspartnerschaft</option>
                        <option value="getrennt_lebend">Getrennt lebend</option>
                        <option value="geschieden">Geschieden</option>
                        <option value="verwitwet">Verwitwet</option>
                        <option value="partnerschaft_aufgehoben">Lebenspartnerschaft aufgehoben</option>
                      </select>
                      <p className="text-[10px] text-white/40 mt-1">Gemäß Personenstandsgesetz (PStG)</p>
                    </div>

                    {/* PARTNERSCHAFT */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Leben Sie in einer Partnerschaft/Beziehung? <span className="text-rose-400">*</span>
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" required>
                        <option value="">Bitte wählen...</option>
                        <option value="nein">Nein, ich lebe allein</option>
                        <option value="ehe">Ja, in Ehe/eingetragener Partnerschaft</option>
                        <option value="zusammen">Ja, unverheiratet zusammenlebend</option>
                        <option value="getrennt">Ja, aber getrennt lebend</option>
                        <option value="fernbeziehung">Ja, aber getrennte Haushalte</option>
                      </select>
                      <p className="text-[10px] text-white/40 mt-1">Wichtig für Bedarfsgemeinschaft nach § 7 Abs. 3 SGB II</p>
                    </div>

                    {/* DATUM EHESCHLIESSUNG */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Datum Eheschließung/Partnerschaft
                      </label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                      />
                    </div>

                    {/* ZUSAMMENLEBEN SEIT */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Zusammenleben seit
                      </label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                      />
                      <p className="text-[10px] text-white/40 mt-1">&gt; 1 Jahr = Bedarfsgemeinschaft</p>
                    </div>
                  </div>
                </div>

                {/* PARTNER STAMMDATEN */}
                <div className="p-5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <h4 className="text-sm font-semibold text-rose-300 mb-3 flex items-center gap-2">
                    <span>👤</span>
                    Persönliche Daten Partner/in
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ANREDE */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Anrede
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="">Keine Angabe</option>
                        <option value="herr">Herr</option>
                        <option value="frau">Frau</option>
                        <option value="divers">Divers</option>
                      </select>
                    </div>

                    {/* TITEL */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Titel
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="z.B. Dr."
                      />
                    </div>

                    {/* VORNAME */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Vorname
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="Vorname"
                      />
                    </div>

                    {/* NACHNAME */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Nachname
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="Nachname"
                      />
                    </div>

                    {/* GEBURTSNAME */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Geburtsname
                        <span className="ml-2 text-[10px] text-white/40">(falls abweichend)</span>
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="Geburtsname"
                      />
                    </div>

                    {/* GEBURTSDATUM */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Geburtsdatum
                      </label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                      />
                    </div>

                    {/* STAATSANGEHÖRIGKEIT */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Staatsangehörigkeit
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="DE">Deutsch</option>
                        <option value="EU">EU-Bürger</option>
                        <option value="NON-EU">Nicht-EU</option>
                      </select>
                    </div>

                    {/* STEUER-ID */}
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Steuer-ID
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="11 Ziffern"
                        pattern="[0-9]{11}"
                        maxLength="11"
                      />
                    </div>
                  </div>
                </div>

                {/* PARTNER BESCHÄFTIGUNG */}
                <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <h4 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
                    <span>💼</span>
                    Beschäftigung & Einkommen Partner/in
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Beschäftigungsstatus Partner/in
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="">Bitte wählen...</option>
                        <option value="vollzeit">Vollzeit beschäftigt</option>
                        <option value="teilzeit">Teilzeit beschäftigt</option>
                        <option value="minijob">Minijob</option>
                        <option value="selbstaendig">Selbständig</option>
                        <option value="arbeitslos">Arbeitslos</option>
                        <option value="rente">Rentner/in</option>
                        <option value="studium">Student/in</option>
                        <option value="hausfrau">Hausfrau/Hausmann</option>
                        <option value="elternzeit">Elternzeit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Nettoeinkommen Partner/in
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Wird bei Bedarfsgemeinschaft angerechnet</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Sozialleistungen Partner/in
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GEMEINSAME KINDER */}
                <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <h4 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                    <span>👶</span>
                    Gemeinsame Kinder
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Wir haben gemeinsame Kinder</span>
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          Anzahl gemeinsame Kinder
                        </label>
                        <input 
                          type="number" 
                          min="0"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          davon minderjährig
                        </label>
                        <input 
                          type="number" 
                          min="0"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-white/40">
                      Gemeinsame Kinder begründen automatisch eine Bedarfsgemeinschaft (§ 7 Abs. 3 Nr. 2 SGB II)
                    </p>
                  </div>
                </div>

                {/* VERSICHERUNG & VORSORGE */}
                <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                  <h4 className="text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                    <span>🏥</span>
                    Versicherung Partner/in
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Partner/in ist über mich familienversichert</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Ich bin über Partner/in familienversichert</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Getrennte Krankenversicherungen</span>
                    </label>
                  </div>
                </div>

                {/* EHEGATTEN-SPLITTING */}
                <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <h4 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
                    <span>💰</span>
                    Steuerliche Veranlagung
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="veranlagung" value="zusammen" />
                      <div>
                        <span className="text-sm text-white/80">Zusammenveranlagung</span>
                        <p className="text-xs text-white/50">Ehegattensplitting nach § 26b EStG</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="veranlagung" value="getrennt" />
                      <div>
                        <span className="text-sm text-white/80">Getrennte Veranlagung</span>
                        <p className="text-xs text-white/50">§ 26a EStG</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="veranlagung" value="nicht_relevant" defaultChecked />
                      <div>
                        <span className="text-sm text-white/80">Nicht zutreffend</span>
                        <p className="text-xs text-white/50">Nicht verheiratet/verpartnert</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* UNTERHALTSPFLICHTEN */}
                <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <h4 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                    <span>⚖️</span>
                    Unterhaltsverpflichtungen
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Ich zahle Unterhalt an Ex-Partner/in</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Partner/in zahlt Unterhalt</span>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          Unterhalt gezahlt (monatlich)
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                            placeholder="0.00"
                          />
                          <span className="flex items-center px-3 text-white/60">€</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          Unterhalt erhalten (monatlich)
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                            placeholder="0.00"
                          />
                          <span className="flex items-center px-3 text-white/60">€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BEDARFSGEMEINSCHAFT INFO */}
                <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30">
                  <div className="flex items-start gap-3">
                    <span className="text-pink-400 text-xl">ℹ️</span>
                    <div>
                      <p className="text-sm font-medium text-pink-300">Bedarfsgemeinschaft nach § 7 SGB II</p>
                      <p className="text-xs text-pink-200/70 mt-1">
                        Sie bilden eine Bedarfsgemeinschaft wenn:
                      </p>
                      <ul className="text-xs text-pink-200/70 mt-2 space-y-1">
                        <li>• Sie verheiratet sind oder in eingetragener Partnerschaft leben</li>
                        <li>• Sie länger als ein Jahr zusammenleben</li>
                        <li>• Sie gemeinsame Kinder haben</li>
                        <li>• Sie gegenseitig füreinander einstehen</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* DATENSCHUTZ INFO */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                  <div className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">🔒</span>
                    <div className="text-xs text-white/50">
                      <p className="font-medium text-white/70 mb-1">Datenschutz bei Partnerschaftsdaten:</p>
                      <ul className="space-y-1">
                        <li>• Personenstandsdaten nach PStG geschützt</li>
                        <li>• Familienrechtliche Daten vertraulich (§ 35 SGB I)</li>
                        <li>• Weitergabe nur mit beidseitiger Einwilligung</li>
                        <li>• Getrennte Bearbeitung bei Trennung möglich</li>
                      </ul>
                      <p className="mt-2">
                        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'kinder' && (
              <div className="space-y-6">
                {/* KINDERGELD HEADER */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">👶</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-yellow-300 mb-1">Kinder und Kindergeld - § 32 EStG / § 62 ff. EStG</h4>
                      <p className="text-xs text-white/60">
                        Kindergeld wird für leibliche, adoptierte und Pflegekinder gezahlt. Berechtigung bis 18 Jahre, 
                        bei Ausbildung bis 25 Jahre. Ab 2024: 250€ pro Kind einheitlich.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ANZAHL KINDER */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center text-sm">👨‍👩‍👧‍👦</span>
                      Kindergeldberechtigte Kinder
                    </h4>
                    <span className="px-3 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-300 rounded-full">
                      250€ PRO KIND
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Anzahl Kinder gesamt <span className="text-rose-400">*</span>
                      </label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        davon unter 18 Jahre
                      </label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        davon in Ausbildung (18-25)
                      </label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* KIND 1 DETAILS */}
                <div className="p-5 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                  <h4 className="text-sm font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                    <span>👶</span>
                    Kind 1 - Stammdaten
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Vorname
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="Vorname des Kindes"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Nachname
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="Nachname"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Geburtsdatum
                      </label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Geschlecht
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="">Bitte wählen...</option>
                        <option value="m">Männlich</option>
                        <option value="w">Weiblich</option>
                        <option value="d">Divers</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Kindschaftsverhältnis
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="leiblich">Leibliches Kind</option>
                        <option value="adoptiert">Adoptivkind</option>
                        <option value="pflege">Pflegekind</option>
                        <option value="stief">Stiefkind</option>
                        <option value="enkel">Enkelkind</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Steuer-ID Kind
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="11 Ziffern"
                        pattern="[0-9]{11}"
                        maxLength="11"
                      />
                      <p className="text-[10px] text-white/40 mt-1">Pflicht für Kindergeld</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Wohnort des Kindes
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="bei_mir">Bei mir im Haushalt</option>
                        <option value="beim_anderen">Beim anderen Elternteil</option>
                        <option value="wechselmodell">Wechselmodell (50/50)</option>
                        <option value="eigene_wohnung">Eigene Wohnung (Ausbildung)</option>
                        <option value="heim">Heim/Internat</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* BILDUNG & BETREUUNG */}
                <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <h4 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
                    <span>🎓</span>
                    Bildung & Betreuung
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Aktuelle Bildungseinrichtung
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="">Bitte wählen...</option>
                        <option value="keine">Noch keine (unter 1 Jahr)</option>
                        <option value="krippe">Kinderkrippe (0-3 Jahre)</option>
                        <option value="kita">Kindergarten/KiTa (3-6 Jahre)</option>
                        <option value="vorschule">Vorschule</option>
                        <option value="grundschule">Grundschule</option>
                        <option value="mittelschule">Mittelschule</option>
                        <option value="realschule">Realschule</option>
                        <option value="gymnasium">Gymnasium</option>
                        <option value="gesamtschule">Gesamtschule</option>
                        <option value="foerderschule">Förderschule</option>
                        <option value="berufsschule">Berufsschule</option>
                        <option value="ausbildung">Betriebliche Ausbildung</option>
                        <option value="studium">Studium</option>
                        <option value="sonstiges">Sonstiges</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Klassenstufe/Semester
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="z.B. 5. Klasse"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Betreuungsbedarf
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="keine">Keine Betreuung</option>
                        <option value="halbtags">Halbtags (bis 14 Uhr)</option>
                        <option value="ganztags">Ganztags (bis 17 Uhr)</option>
                        <option value="hort">Hort/Nachmittagsbetreuung</option>
                        <option value="tagesmutter">Tagesmutter/-vater</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Monatliche Betreuungskosten
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Absetzbar nach § 10 EStG</p>
                    </div>
                  </div>
                </div>

                {/* UNTERHALT & SORGERECHT */}
                <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <h4 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                    <span>⚖️</span>
                    Sorgerecht & Unterhalt
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Sorgerecht
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="gemeinsam">Gemeinsames Sorgerecht</option>
                        <option value="allein_mutter">Alleiniges Sorgerecht Mutter</option>
                        <option value="allein_vater">Alleiniges Sorgerecht Vater</option>
                        <option value="vormundschaft">Vormundschaft</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Umgangsregelung
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="keine">Keine Regelung nötig</option>
                        <option value="wechselmodell">Wechselmodell</option>
                        <option value="residenzmodell">Residenzmodell mit Umgang</option>
                        <option value="kein_umgang">Kein Umgang</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Unterhalt (monatlich)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Nach Düsseldorfer Tabelle</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Unterhaltsvorschuss
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">UVG - vom Jugendamt</p>
                    </div>
                  </div>
                </div>

                {/* GESUNDHEIT & FÖRDERUNG */}
                <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <h4 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                    <span>🏥</span>
                    Gesundheit & besondere Förderung
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          Krankenversicherung Kind
                        </label>
                        <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                          <option value="familienversichert">Familienversichert über mich</option>
                          <option value="familienversichert_partner">Familienversichert über Partner</option>
                          <option value="selbst">Selbst versichert</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          Pflegegrad
                        </label>
                        <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                          <option value="0">Kein Pflegegrad</option>
                          <option value="1">Pflegegrad 1</option>
                          <option value="2">Pflegegrad 2</option>
                          <option value="3">Pflegegrad 3</option>
                          <option value="4">Pflegegrad 4</option>
                          <option value="5">Pflegegrad 5</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm text-white/80">Behinderung (GdB)</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm text-white/80">Chronische Krankheit</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm text-white/80">Therapien (Logo, Ergo, Physio)</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm text-white/80">Integrationshilfe/Schulbegleitung</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm text-white/80">Frühförderung</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* BILDUNGS- UND TEILHABEPAKET */}
                <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                  <h4 className="text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                    <span>🎒</span>
                    Bildungs- und Teilhabepaket (BuT)
                  </h4>
                  <div className="space-y-2">
                    <p className="text-xs text-white/60 mb-3">
                      Bei Bezug von Bürgergeld, Wohngeld oder Kinderzuschlag
                    </p>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <div>
                        <span className="text-sm text-white/80">Schulbedarf</span>
                        <p className="text-xs text-white/50">195€ pro Jahr (130€ + 65€)</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <div>
                        <span className="text-sm text-white/80">Mittagsverpflegung</span>
                        <p className="text-xs text-white/50">Eigenanteil 1€ pro Tag</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <div>
                        <span className="text-sm text-white/80">Klassenfahrten/Ausflüge</span>
                        <p className="text-xs text-white/50">Volle Übernahme</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <div>
                        <span className="text-sm text-white/80">Lernförderung</span>
                        <p className="text-xs text-white/50">Bei Versetzungsgefährdung</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <div>
                        <span className="text-sm text-white/80">Soziale Teilhabe</span>
                        <p className="text-xs text-white/50">15€ pro Monat (Sport, Musik, etc.)</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <div>
                        <span className="text-sm text-white/80">Schülerbeförderung</span>
                        <p className="text-xs text-white/50">Fahrkarte zur Schule</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* WEITERE KINDER BUTTON */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-300">Weitere Kinder hinzufügen</p>
                      <p className="text-xs text-amber-200/70">
                        Für jedes weitere Kind werden die gleichen Daten erfasst
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-amber-500/20 text-amber-300 rounded-lg text-xs font-medium hover:bg-amber-500/30">
                      + Kind hinzufügen
                    </button>
                  </div>
                </div>

                {/* KINDERGELD BERECHNUNG */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-300">Kindergeld-Anspruch (monatlich)</p>
                      <p className="text-xs text-emerald-200/70">
                        250€ × Anzahl Kinder (Stand 2024)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-300">0,00 €</p>
                      <p className="text-xs text-emerald-200/70">Wird automatisch berechnet</p>
                    </div>
                  </div>
                </div>

                {/* DATENSCHUTZ INFO */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                  <div className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">🔒</span>
                    <div className="text-xs text-white/50">
                      <p className="font-medium text-white/70 mb-1">Datenschutz bei Kinderdaten:</p>
                      <ul className="space-y-1">
                        <li>• Besonderer Schutz für Minderjährige (Art. 8 DSGVO)</li>
                        <li>• Einwilligung durch Sorgeberechtigte erforderlich</li>
                        <li>• Daten nur für Kindergeld und Sozialleistungen</li>
                        <li>• Löschung nach Zweckfortfall (§ 84 SGB X)</li>
                      </ul>
                      <p className="mt-2">
                        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. e DSGVO i.V.m. § 31 SGB I
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'vermoegen' && (
              <div className="space-y-6">
                {/* § 12 SGB II HEADER */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">💰</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-emerald-300 mb-1">Vermögensprüfung - § 12 SGB II Schonvermögen</h4>
                      <p className="text-xs text-white/60">
                        Ab 2024: Schonvermögen 15.000€ pro Person (+ 15.000€ Partner + 500€ pro Kind).
                        Altersvorsorge und selbstgenutzte Immobilie geschützt.
                      </p>
                    </div>
                  </div>
                </div>

                {/* BANKGUTHABEN */}
                <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <h4 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                    <span>🏦</span>
                    Bankguthaben & Bargeld
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Girokonto (Summe aller) <span className="text-rose-400">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                          required
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Sparkonto/Tagesgeld
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Festgeld/Termingeld
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Bargeld zu Hause
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Hausratsfreibetrag beachten</p>
                    </div>
                  </div>
                </div>

                {/* WERTPAPIERE & ANLAGEN */}
                <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <h4 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
                    <span>📈</span>
                    Wertpapiere & Anlagen
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Aktien/ETFs
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Anleihen/Fonds
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Bausparvertrag
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Kryptowährungen
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* IMMOBILIEN */}
                <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <h4 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                    <span>🏠</span>
                    Immobilien & Grundbesitz
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <div>
                        <span className="text-sm text-white/80">Selbstgenutzte Immobilie</span>
                        <p className="text-xs text-white/50">Angemessene Größe: GESCHÜTZT nach § 12 Abs. 3 Nr. 4 SGB II</p>
                      </div>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          Verkehrswert Eigenheim
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                            placeholder="0.00"
                          />
                          <span className="flex items-center px-3 text-white/60">€</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          Restschuld Immobilienkredit
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                            placeholder="0.00"
                          />
                          <span className="flex items-center px-3 text-white/60">€</span>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Weitere Immobilien (vermietete/unbebaute Grundstücke)</span>
                    </label>
                  </div>
                </div>

                {/* FAHRZEUGE */}
                <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <h4 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
                    <span>🚗</span>
                    Fahrzeuge
                  </h4>
                  <div className="space-y-3">
                    <p className="text-xs text-amber-200/70">
                      1 angemessenes KFZ pro erwerbsfähiger Person ist GESCHÜTZT (§ 12 Abs. 3 Nr. 2 SGB II)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          Anzahl Fahrzeuge
                        </label>
                        <input 
                          type="number" 
                          min="0"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          Wert Fahrzeug 1
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                            placeholder="0.00"
                          />
                          <span className="flex items-center px-3 text-white/60">€</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          Wert weitere Fahrzeuge
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                            placeholder="0.00"
                          />
                          <span className="flex items-center px-3 text-white/60">€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ALTERSVORSORGE */}
                <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                  <h4 className="text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                    <span>🛡️</span>
                    Altersvorsorge (GESCHÜTZT)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Riester-Rente
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-indigo-200/60 mt-1">§ 12 Abs. 2 Nr. 2 SGB II</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Betriebsrente/bAV
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-indigo-200/60 mt-1">Verwertungsausschluss beachten</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Lebensversicherung (Altersvorsorge)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Private Rentenversicherung
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SONSTIGE WERTE */}
                <div className="p-5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <h4 className="text-sm font-semibold text-rose-300 mb-3 flex items-center gap-2">
                    <span>💎</span>
                    Sonstige Wertgegenstände
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Schmuck/Gold/Edelmetalle
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Kunstgegenstände/Antiquitäten
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Forderungen/Darlehen an Dritte
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Geschäftsanteile/Beteiligungen
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SCHONVERMÖGEN BERECHNUNG */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-emerald-300">Schonvermögen-Prüfung</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-white/60">Gesamtvermögen:</p>
                        <p className="text-lg font-bold text-white">0,00 €</p>
                      </div>
                      <div>
                        <p className="text-white/60">Schonvermögen (15.000€ p.P.):</p>
                        <p className="text-lg font-bold text-emerald-300">15.000,00 €</p>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                      <p className="text-xs text-emerald-300">
                        ✓ Vermögen liegt unter Schongrenze
                      </p>
                    </div>
                  </div>
                </div>

                {/* DATENSCHUTZ INFO */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                  <div className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">🔒</span>
                    <div className="text-xs text-white/50">
                      <p className="font-medium text-white/70 mb-1">Datenschutz bei Vermögensdaten:</p>
                      <ul className="space-y-1">
                        <li>• Besonders sensible Finanzdaten nach Art. 9 DSGVO</li>
                        <li>• Automatische Prüfung Schonvermögen § 12 SGB II</li>
                        <li>• Keine Weitergabe an Dritte ohne Einwilligung</li>
                        <li>• Verschlüsselte Speicherung (AES-256)</li>
                      </ul>
                      <p className="mt-2">
                        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. c DSGVO i.V.m. § 60 SGB I
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'besonderes' && (
              <div className="space-y-6">
                {/* § 21 SGB II HEADER */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">♿</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-purple-300 mb-1">Mehrbedarf und Nachteilsausgleiche - § 21 SGB II / § 30 SGB XII</h4>
                      <p className="text-xs text-white/60">
                        Zusätzliche Leistungen bei Behinderung, Krankheit oder besonderen Lebensumständen.
                        Mehrbedarf bis zu 35% des Regelbedarfs möglich.
                      </p>
                    </div>
                  </div>
                </div>

                {/* BEHINDERUNG */}
                <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <h4 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                    <span>♿</span>
                    Behinderung & Schwerbehinderung
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Grad der Behinderung (GdB)
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="0">Keine Behinderung</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                        <option value="40">40</option>
                        <option value="50">50 (Schwerbehinderung)</option>
                        <option value="60">60</option>
                        <option value="70">70</option>
                        <option value="80">80</option>
                        <option value="90">90</option>
                        <option value="100">100</option>
                      </select>
                      <p className="text-[10px] text-white/40 mt-1">Ab GdB 50: Schwerbehindertenausweis</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Merkzeichen im Ausweis
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" />
                          <span className="text-xs text-white/80">G - Gehbehinderung</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" />
                          <span className="text-xs text-white/80">aG - Außergewöhnliche Gehbehinderung</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" />
                          <span className="text-xs text-white/80">B - Begleitperson</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" />
                          <span className="text-xs text-white/80">H - Hilflosigkeit</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" />
                          <span className="text-xs text-white/80">Bl - Blindheit</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" />
                          <span className="text-xs text-white/80">Gl - Gehörlosigkeit</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Art der Behinderung
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="">Bitte wählen...</option>
                        <option value="koerperlich">Körperliche Behinderung</option>
                        <option value="seelisch">Seelische Behinderung</option>
                        <option value="geistig">Geistige Behinderung</option>
                        <option value="sinnes">Sinnesbehinderung</option>
                        <option value="mehrfach">Mehrfachbehinderung</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Feststellung durch
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="">Keine Feststellung</option>
                        <option value="versorgungsamt">Versorgungsamt</option>
                        <option value="rentenbescheid">Rentenbescheid</option>
                        <option value="beantragt">Beantragt (noch offen)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-purple-500/10 rounded-lg">
                    <p className="text-xs text-purple-300">
                      💡 <strong>Mehrbedarf:</strong> 17% bei Gehbehinderung (Merkzeichen G/aG) und Erwerbsfähigkeit
                    </p>
                  </div>
                </div>

                {/* PFLEGEGRAD */}
                <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <h4 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
                    <span>🏥</span>
                    Pflegebedürftigkeit (SGB XI)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Pflegegrad
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="0">Kein Pflegegrad</option>
                        <option value="1">Pflegegrad 1 (geringe Beeinträchtigung)</option>
                        <option value="2">Pflegegrad 2 (erhebliche Beeinträchtigung)</option>
                        <option value="3">Pflegegrad 3 (schwere Beeinträchtigung)</option>
                        <option value="4">Pflegegrad 4 (schwerste Beeinträchtigung)</option>
                        <option value="5">Pflegegrad 5 (mit besonderen Anforderungen)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Art der Pflege
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="">Keine Pflege</option>
                        <option value="angehoerige">Pflege durch Angehörige</option>
                        <option value="ambulant">Ambulanter Pflegedienst</option>
                        <option value="tagespflege">Tagespflege</option>
                        <option value="kurzzeitpflege">Kurzzeitpflege</option>
                        <option value="vollstationaer">Vollstationäre Pflege</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Pflegegeld (monatlich)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Bei häuslicher Pflege</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Pflegesachleistung
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="0.00"
                        />
                        <span className="flex items-center px-3 text-white/60">€</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">Durch Pflegedienst</p>
                    </div>
                  </div>
                </div>

                {/* CHRONISCHE KRANKHEITEN */}
                <div className="p-5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <h4 className="text-sm font-semibold text-rose-300 mb-3 flex items-center gap-2">
                    <span>💊</span>
                    Chronische Krankheiten & Gesundheit
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <div>
                          <span className="text-sm text-white/80">Kostenaufwändige Ernährung erforderlich</span>
                          <p className="text-xs text-white/50">z.B. Diabetes, Zöliakie, Morbus Crohn</p>
                        </div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          Diagnose(n) für Mehrbedarf
                        </label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="z.B. Diabetes mellitus Typ 1"
                        />
                        <p className="text-[10px] text-white/40 mt-1">Ärztliches Attest erforderlich</p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          Monatliche Mehrkosten
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                            placeholder="0.00"
                          />
                          <span className="flex items-center px-3 text-white/60">€</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm text-white/80">HIV-Infektion/AIDS</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm text-white/80">Dialysepflichtige Nierenerkrankung</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm text-white/80">Multiple Sklerose</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm text-white/80">Krebserkrankung</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm text-white/80">Psychische Erkrankung</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* ERWERBSMINDERUNG */}
                <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <h4 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
                    <span>⚠️</span>
                    Erwerbsfähigkeit
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Erwerbsfähigkeit
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="voll">Voll erwerbsfähig (≥ 3h täglich)</option>
                        <option value="teilweise">Teilweise erwerbsmindert (3-6h)</option>
                        <option value="voll_gemindert">Voll erwerbsgemindert (&lt; 3h)</option>
                        <option value="eu_rente">EU-Rente bewilligt</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Befristung EM-Rente bis
                      </label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-amber-500/10 rounded-lg">
                    <p className="text-xs text-amber-300">
                      💡 <strong>Mehrbedarf:</strong> 35% bei voller Erwerbsminderung und Merkzeichen G
                    </p>
                  </div>
                </div>

                {/* SCHWANGERSCHAFT */}
                <div className="p-5 rounded-xl bg-pink-500/5 border border-pink-500/20">
                  <h4 className="text-sm font-semibold text-pink-300 mb-3 flex items-center gap-2">
                    <span>🤰</span>
                    Schwangerschaft & Alleinerziehung
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <div>
                        <span className="text-sm text-white/80">Schwanger ab 13. Woche</span>
                        <p className="text-xs text-white/50">Mehrbedarf: 17% des Regelbedarfs</p>
                      </div>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          Voraussichtlicher Geburtstermin
                        </label>
                        <input 
                          type="date" 
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          Schwangerschaftswoche
                        </label>
                        <input 
                          type="number" 
                          min="1"
                          max="42"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="z.B. 20"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <div>
                        <span className="text-sm text-white/80">Alleinerziehend</span>
                        <p className="text-xs text-white/50">Mehrbedarf: 12-60% je nach Anzahl/Alter der Kinder</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* HILFSMITTEL */}
                <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                  <h4 className="text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                    <span>🦽</span>
                    Hilfsmittel & Unterstützung
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Rollstuhl</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Gehhilfen (Rollator, Krücken)</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Hörgeräte</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Sehhilfen (über normale Brille hinaus)</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Pflegehilfsmittel</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Inkontinenzhilfen</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Kommunikationshilfen</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Assistenzhund</span>
                    </label>
                  </div>
                </div>

                {/* MEHRBEDARF BERECHNUNG */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-emerald-300">Mehrbedarf-Berechnung</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/60">Gehbehinderung (G):</span>
                        <span className="text-white">0,00 €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Kostenaufwändige Ernährung:</span>
                        <span className="text-white">0,00 €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Schwangerschaft:</span>
                        <span className="text-white">0,00 €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Alleinerziehend:</span>
                        <span className="text-white">0,00 €</span>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex justify-between">
                          <span className="font-semibold text-emerald-300">Gesamt-Mehrbedarf:</span>
                          <span className="font-bold text-emerald-300">0,00 €</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-emerald-200/60">
                      Maximaler Mehrbedarf: Summe aller Mehrbedarfe, jedoch max. Regelbedarf
                    </p>
                  </div>
                </div>

                {/* DATENSCHUTZ INFO */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                  <div className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">🔒</span>
                    <div className="text-xs text-white/50">
                      <p className="font-medium text-white/70 mb-1">Datenschutz bei Gesundheitsdaten:</p>
                      <ul className="space-y-1">
                        <li>• Besondere Kategorie nach Art. 9 DSGVO</li>
                        <li>• Verarbeitung nur mit ausdrücklicher Einwilligung</li>
                        <li>• Strikte Zweckbindung für Sozialleistungen</li>
                        <li>• Verschlüsselte Übertragung und Speicherung</li>
                        <li>• Keine Weitergabe ohne explizite Zustimmung</li>
                      </ul>
                      <p className="mt-2">
                        <strong>Rechtsgrundlage:</strong> Art. 9 Abs. 2 lit. a DSGVO i.V.m. § 67b SGB X
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'bildung' && (
              <div className="space-y-6">
                {/* BILDUNG HEADER */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🎓</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-indigo-300 mb-1">Bildung & Qualifikationen</h4>
                      <p className="text-xs text-white/60">
                        Schulabschlüsse, Berufsausbildung und Weiterbildungen für Jobcenter und Sozialleistungen.
                        Bildungsstand beeinflusst Vermittlung und Fördermaßnahmen.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SCHULABSCHLUSS */}
                <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                  <h4 className="text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                    <span>🏫</span>
                    Schulabschluss
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Höchster Schulabschluss <span className="text-rose-400">*</span>
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" required>
                        <option value="">Bitte wählen...</option>
                        <option value="ohne">Ohne Schulabschluss</option>
                        <option value="hauptschule">Hauptschulabschluss</option>
                        <option value="realschule">Realschulabschluss / Mittlere Reife</option>
                        <option value="fachhochschulreife">Fachhochschulreife</option>
                        <option value="abitur">Allgemeine Hochschulreife (Abitur)</option>
                        <option value="ausland">Ausländischer Schulabschluss</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Jahr des Abschlusses
                      </label>
                      <input 
                        type="number" 
                        min="1950"
                        max="2025"
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="z.B. 2015"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Name der Schule
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="z.B. Max-Planck-Gymnasium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Ort der Schule
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="z.B. Berlin"
                      />
                    </div>
                  </div>
                </div>

                {/* BERUFSAUSBILDUNG */}
                <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <h4 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
                    <span>🔧</span>
                    Berufsausbildung
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Art der Berufsausbildung
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="">Keine Berufsausbildung</option>
                        <option value="dual">Duale Ausbildung (Betrieb + Berufsschule)</option>
                        <option value="schulisch">Schulische Ausbildung</option>
                        <option value="berufsfachschule">Berufsfachschule</option>
                        <option value="fachschule">Fachschule</option>
                        <option value="meister">Meisterausbildung</option>
                        <option value="techniker">Technikerausbildung</option>
                        <option value="ausland">Ausländische Berufsausbildung</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Erlernter Beruf
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="z.B. Kaufmann/Kauffrau für Büromanagement"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Ausbildungsbetrieb
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="Name des Ausbildungsbetriebs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Abschlussjahr
                      </label>
                      <input 
                        type="number" 
                        min="1950"
                        max="2025"
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="z.B. 2018"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        IHK/HWK Prüfungsnote
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="">Keine Angabe</option>
                        <option value="1">Sehr gut (1)</option>
                        <option value="2">Gut (2)</option>
                        <option value="3">Befriedigend (3)</option>
                        <option value="4">Ausreichend (4)</option>
                        <option value="5">Nicht bestanden</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* STUDIUM */}
                <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <h4 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                    <span>🎓</span>
                    Hochschulstudium
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Akademischer Abschluss
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="">Kein Studium / Kein Abschluss</option>
                        <option value="bachelor">Bachelor</option>
                        <option value="master">Master</option>
                        <option value="diplom">Diplom</option>
                        <option value="magister">Magister</option>
                        <option value="staatsexamen">Staatsexamen</option>
                        <option value="promotion">Promotion (Dr.)</option>
                        <option value="habilitation">Habilitation (Prof.)</option>
                        <option value="studiert">Studiert (ohne Abschluss)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Studiengang / Fachrichtung
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="z.B. Betriebswirtschaftslehre"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Hochschule / Universität
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="z.B. Freie Universität Berlin"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Abschlussjahr
                      </label>
                      <input 
                        type="number" 
                        min="1950"
                        max="2025"
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="z.B. 2020"
                      />
                    </div>
                  </div>
                </div>

                {/* WEITERBILDUNGEN */}
                <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <h4 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                    <span>📚</span>
                    Weiterbildungen & Zertifikate
                  </h4>
                  <div className="space-y-3">
                    <p className="text-xs text-white/60">Relevante berufliche Weiterbildungen der letzten 10 Jahre</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          Weiterbildung / Zertifikat
                        </label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="z.B. SAP-Grundkurs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                          Jahr
                        </label>
                        <input 
                          type="number" 
                          min="2010"
                          max="2025"
                          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                          placeholder="z.B. 2022"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm text-white/80">Führerschein Klasse B</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm text-white/80">Führerschein Klasse C/CE (LKW)</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm text-white/80">Staplerschein</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm text-white/80">Erste-Hilfe-Kurs (aktuell)</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" />
                        <span className="text-sm text-white/80">Hygieneschulung</span>
                      </label>
                    </div>

                    <button className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-medium hover:bg-emerald-500/30">
                      + Weitere Weiterbildung hinzufügen
                    </button>
                  </div>
                </div>

                {/* SPRACHKENNTNISSE */}
                <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <h4 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
                    <span>🌍</span>
                    Sprachkenntnisse
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Deutsch
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="muttersprachlich">Muttersprache</option>
                        <option value="c2">C2 - Annähernd muttersprachlich</option>
                        <option value="c1">C1 - Fließend</option>
                        <option value="b2">B2 - Fließend in Wort und Schrift</option>
                        <option value="b1">B1 - Gute Kenntnisse</option>
                        <option value="a2">A2 - Grundkenntnisse</option>
                        <option value="a1">A1 - Anfänger</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Englisch
                      </label>
                      <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm">
                        <option value="">Keine Kenntnisse</option>
                        <option value="muttersprachlich">Muttersprache</option>
                        <option value="c2">C2 - Annähernd muttersprachlich</option>
                        <option value="c1">C1 - Fließend</option>
                        <option value="b2">B2 - Fließend in Wort und Schrift</option>
                        <option value="b1">B1 - Gute Kenntnisse</option>
                        <option value="a2">A2 - Grundkenntnisse</option>
                        <option value="a1">A1 - Anfänger</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
                        Weitere Sprache
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                        placeholder="z.B. Türkisch (B2)"
                      />
                    </div>
                  </div>
                </div>

                {/* EDV-KENNTNISSE */}
                <div className="p-5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <h4 className="text-sm font-semibold text-rose-300 mb-3 flex items-center gap-2">
                    <span>💻</span>
                    EDV- und Computerkenntnisse
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">MS Office (Word, Excel, PowerPoint)</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">E-Mail und Internet</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">SAP</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">DATEV</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Programmierung</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">CAD-Software</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" />
                      <span className="text-sm text-white/80">Social Media</span>
                    </label>
                  </div>
                </div>

                {/* ANERKENNUNG AUSLÄNDISCHER ABSCHLÜSSE */}
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" />
                    <div>
                      <p className="text-sm text-cyan-300 font-medium">Ausländischer Abschluss - Anerkennung beantragt/erhalten</p>
                      <p className="text-xs text-cyan-200/70">Nach Anerkennungsgesetz / IQ-Netzwerk</p>
                    </div>
                  </div>
                </div>

                {/* DATENSCHUTZ INFO */}
                <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                  <div className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">🔒</span>
                    <div className="text-xs text-white/50">
                      <p className="font-medium text-white/70 mb-1">Datenschutz bei Bildungsdaten:</p>
                      <ul className="space-y-1">
                        <li>• Verarbeitung für Arbeitsvermittlung § 281 SGB III</li>
                        <li>• Übermittlung an potenzielle Arbeitgeber nur mit Einwilligung</li>
                        <li>• Speicherung gemäß § 84 SGB X</li>
                      </ul>
                      <p className="mt-2">
                        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. e DSGVO i.V.m. § 50 SGB II
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!loading && !profil.dsgvo_einwilligung && activeSection !== 'einwilligungen' && (
            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-4">
              <span className="text-amber-400 text-xl">⚠️</span>
              <p className="text-sm text-amber-200 flex-1">
                <strong>Hinweis:</strong> Bitte akzeptieren Sie im Bereich "Datenschutz" die Datenverarbeitung, bevor Sie Ihr Profil speichern können.
              </p>
              <button 
                onClick={() => setActiveSection('einwilligungen')}
                className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-200 text-sm hover:bg-amber-500/30"
              >
                Zu Datenschutz →
              </button>
            </div>
          )}
        </div>

        <footer className="border-t border-white/10 px-8 py-3">
          <div className="flex items-center justify-between text-xs text-white/30">
            <span>© 2025 MiMiCheck - Alle Rechte vorbehalten</span>
            <span>Made with ❤️ in Deutschland</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

// Wrapper-Komponente mit Error Boundary
function ProfilSeiteSimple() {
  return (
    <ProfilErrorBoundary>
      <ProfilSeiteContent />
    </ProfilErrorBoundary>
  );
}

export default ProfilSeiteSimple;
