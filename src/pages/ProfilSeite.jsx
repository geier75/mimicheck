import React, { useState } from 'react';
import { User, MapPin, CreditCard, Heart, Home, Briefcase, Users, PiggyBank, Shield, ChevronRight, Check, AlertCircle, Save, Lock, Sparkles, Baby, GraduationCap, Info } from 'lucide-react';

export default function ProfilSeite() {
  const [activeSection, setActiveSection] = useState('persoenlich');
  const [profil, setProfil] = useState({
    persoenlich: { anrede: '', vorname: '', nachname: '', geburtsdatum: '', steuer_id: '' },
    kontakt: { strasse: '', hausnummer: '', plz: '', ort: '', email: '' },
    bank: { kontoinhaber: '', iban: '' },
    einwilligungen: { dsgvo_einwilligung: false }
  });

  const sections = [
    { id: 'persoenlich', label: 'Persönliche Daten', icon: User },
    { id: 'kontakt', label: 'Kontakt & Adresse', icon: MapPin },
    { id: 'bank', label: 'Bankverbindung', icon: CreditCard },
    { id: 'krankenversicherung', label: 'Krankenversicherung', icon: Heart },
    { id: 'wohnung', label: 'Wohnsituation', icon: Home },
    { id: 'einkommen', label: 'Einkommen', icon: Briefcase },
    { id: 'partner', label: 'Partner/in', icon: Users },
    { id: 'kinder', label: 'Kinder', icon: Baby },
    { id: 'vermoegen', label: 'Vermögen', icon: PiggyBank },
    { id: 'besonderes', label: 'Besondere Umstände', icon: AlertCircle },
    { id: 'bildung', label: 'Bildung', icon: GraduationCap },
    { id: 'einwilligungen', label: 'Datenschutz', icon: Shield }
  ];

  const updateField = (section, field, value) => {
    setProfil(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const currentSection = sections.find(s => s.id === activeSection);
  const Icon = currentSection?.icon || User;

  const renderContent = () => {
    if (activeSection === 'persoenlich') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Anrede</label>
            <select value={profil.persoenlich.anrede} onChange={(e) => updateField('persoenlich', 'anrede', e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50">
              <option value="" className="bg-slate-900">Bitte wählen...</option>
              <option value="herr" className="bg-slate-900">Herr</option>
              <option value="frau" className="bg-slate-900">Frau</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Vorname <span className="text-rose-400">*</span></label>
            <input type="text" value={profil.persoenlich.vorname} onChange={(e) => updateField('persoenlich', 'vorname', e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Nachname <span className="text-rose-400">*</span></label>
            <input type="text" value={profil.persoenlich.nachname} onChange={(e) => updateField('persoenlich', 'nachname', e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Geburtsdatum <span className="text-rose-400">*</span></label>
            <input type="date" value={profil.persoenlich.geburtsdatum} onChange={(e) => updateField('persoenlich', 'geburtsdatum', e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Steuer-ID <span className="text-rose-400">*</span></label>
            <input type="text" placeholder="11-stellig" value={profil.persoenlich.steuer_id} onChange={(e) => updateField('persoenlich', 'steuer_id', e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-500/50" />
          </div>
        </div>
      );
    }
    
    if (activeSection === 'kontakt') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Straße <span className="text-rose-400">*</span></label>
            <input type="text" value={profil.kontakt.strasse} onChange={(e) => updateField('kontakt', 'strasse', e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Hausnummer</label>
            <input type="text" value={profil.kontakt.hausnummer} onChange={(e) => updateField('kontakt', 'hausnummer', e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">PLZ <span className="text-rose-400">*</span></label>
            <input type="text" value={profil.kontakt.plz} onChange={(e) => updateField('kontakt', 'plz', e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Ort <span className="text-rose-400">*</span></label>
            <input type="text" value={profil.kontakt.ort} onChange={(e) => updateField('kontakt', 'ort', e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">E-Mail</label>
            <input type="email" value={profil.kontakt.email} onChange={(e) => updateField('kontakt', 'email', e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50" />
          </div>
        </div>
      );
    }

    if (activeSection === 'bank') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Kontoinhaber <span className="text-rose-400">*</span></label>
              <input type="text" value={profil.bank.kontoinhaber} onChange={(e) => updateField('bank', 'kontoinhaber', e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">IBAN <span className="text-rose-400">*</span></label>
              <input type="text" placeholder="DE00 0000 0000 0000 0000 00" value={profil.bank.iban} onChange={(e) => updateField('bank', 'iban', e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-500/50" />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-sm text-emerald-300 flex items-start gap-2">
              <Info size={18} className="shrink-0 mt-0.5" />
              Ihre Bankverbindung wird für die Auszahlung von Kindergeld, Wohngeld und anderen Leistungen benötigt.
            </p>
          </div>
        </div>
      );
    }

    if (activeSection === 'einwilligungen') {
      return (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-800 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center shrink-0">
                <Shield size={28} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Datenschutz nach EU-Standards</h4>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>✓ AES-256 Verschlüsselung aller Daten</li>
                  <li>✓ Server ausschließlich in Deutschland</li>
                  <li>✓ EU AI Act konform</li>
                </ul>
              </div>
            </div>
          </div>
          <div className={`p-5 rounded-xl border transition-all cursor-pointer ${profil.einwilligungen.dsgvo_einwilligung ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}
            onClick={() => updateField('einwilligungen', 'dsgvo_einwilligung', !profil.einwilligungen.dsgvo_einwilligung)}>
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 ${profil.einwilligungen.dsgvo_einwilligung ? 'bg-gradient-to-r from-cyan-500 to-teal-500 border-transparent' : 'border-white/20'}`}>
                {profil.einwilligungen.dsgvo_einwilligung && <Check size={12} className="text-white" />}
              </div>
              <div>
                <span className="text-sm text-white/90 font-medium">Einwilligung zur Datenverarbeitung (DSGVO) *</span>
                <p className="text-xs text-white/40 mt-1">Ich willige ein, dass meine Daten zur Antragsbearbeitung gespeichert werden.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <Sparkles size={48} className="mx-auto mb-4 text-cyan-400/50" />
        <h3 className="text-lg font-medium text-white/80 mb-2">Sektion: {currentSection?.label}</h3>
        <p className="text-sm text-white/40">Diese Sektion wird noch implementiert.</p>
      </div>
    );
  };

  return (
    <div className="min-h-full bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-cyan-400" />
            <span className="text-xs text-cyan-300">EU AI Act & DSGVO konform</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Mein Profil
          </h1>
          <p className="text-white/60 mt-2">Einmal erfassen – alle Anträge ausfüllen.</p>
        </div>

        <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-white/60">Profil-Vollständigkeit</span>
            <span className="text-sm font-bold text-cyan-400">25%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" style={{ width: '25%' }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {sections.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm transition-all ${activeSection === s.id ? 'bg-gradient-to-r from-cyan-500/15 to-teal-500/10 border border-cyan-500/30 text-white font-medium' : 'text-white/70 hover:bg-white/5'}`}>
                  <s.icon size={18} className={activeSection === s.id ? 'text-cyan-400' : 'text-white/40'} />
                  {s.label}
                  {activeSection === s.id && <ChevronRight size={14} className="ml-auto text-cyan-400" />}
                </button>
              ))}
            </nav>
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex flex-wrap gap-2 text-[10px] text-white/40">
                <span className="flex items-center gap-1 px-2 py-1 rounded bg-white/5"><Shield size={10} /> DSGVO</span>
                <span className="flex items-center gap-1 px-2 py-1 rounded bg-white/5"><Lock size={10} /> AES-256</span>
                <span className="flex items-center gap-1 px-2 py-1 rounded bg-white/5"><Sparkles size={10} /> EU AI Act</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center">
                    <Icon size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">{currentSection?.label}</h2>
                </div>
                <button disabled={!profil.einwilligungen.dsgvo_einwilligung}
                  className="px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 text-sm bg-gradient-to-r from-cyan-500 to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Save size={16} /> Speichern
                </button>
              </div>
              {renderContent()}
              {!profil.einwilligungen.dsgvo_einwilligung && activeSection !== 'einwilligungen' && (
                <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-4">
                  <AlertCircle size={20} className="text-amber-400 shrink-0" />
                  <p className="text-sm text-amber-200"><strong>Hinweis:</strong> Bitte akzeptieren Sie im Bereich "Datenschutz" die Datenverarbeitung.</p>
                  <button onClick={() => setActiveSection('einwilligungen')} className="ml-auto px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-200 text-sm hover:bg-amber-500/30 whitespace-nowrap">
                    Zu Datenschutz →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/30">
          © 2025 MiMiCheck - Made with ❤️ in Deutschland
        </div>
      </div>
    </div>
  );
}
