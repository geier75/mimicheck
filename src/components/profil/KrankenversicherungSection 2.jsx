import React from 'react';

const VERSICHERUNGSARTEN = [
  { value: 'gkv', label: 'Gesetzliche Krankenversicherung (GKV)' },
  { value: 'pkv', label: 'Private Krankenversicherung (PKV)' },
  { value: 'familienversicherung', label: 'Familienversicherung' },
  { value: 'beihilfe', label: 'Beihilfe + PKV' }
];

const KRANKENKASSEN = [
  'AOK', 'BARMER', 'Techniker Krankenkasse', 'DAK-Gesundheit', 
  'IKK classic', 'KKH', 'hkk', 'Andere'
];

export default function KrankenversicherungSection({ profil, handleChange }) {
  return (
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

      {/* VERSICHERUNGSART */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-sm">1</span>
          Versicherungsstatus
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
              Versicherungsart <span className="text-rose-400">*</span>
            </label>
            <select 
              value={profil.versicherungsart || ''}
              onChange={handleChange('versicherungsart')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            >
              <option value="">Bitte wählen...</option>
              {VERSICHERUNGSARTEN.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
              Krankenkasse/Versicherer <span className="text-rose-400">*</span>
            </label>
            <select 
              value={profil.krankenkasse || ''}
              onChange={handleChange('krankenkasse')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            >
              <option value="">Bitte wählen...</option>
              {KRANKENKASSEN.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
              Versicherungsnummer
            </label>
            <input 
              type="text"
              value={profil.versicherungsnummer || ''}
              onChange={handleChange('versicherungsnummer')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="z.B. A123456789"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
              Versichert seit
            </label>
            <input 
              type="date"
              value={profil.versichert_seit || ''}
              onChange={handleChange('versichert_seit')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* BEITRAGSSATZ */}
      <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <h4 className="text-sm font-semibold text-blue-300 mb-3">Beitragsinformationen</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Monatlicher Beitrag (€)</label>
            <input 
              type="number"
              value={profil.kv_beitrag || ''}
              onChange={handleChange('kv_beitrag')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Zusatzbeitrag (%)</label>
            <input 
              type="number"
              value={profil.kv_zusatzbeitrag || ''}
              onChange={handleChange('kv_zusatzbeitrag')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="1.6"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Pflegeversicherung</label>
            <select 
              value={profil.pflegeversicherung || ''}
              onChange={handleChange('pflegeversicherung')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            >
              <option value="">Bitte wählen...</option>
              <option value="mit_kinder">Mit Kindern (3,4%)</option>
              <option value="ohne_kinder">Ohne Kinder (4,0%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* BEFREIUNGEN */}
      <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <h4 className="text-sm font-semibold text-amber-300 mb-3">Befreiungen & Ermäßigungen</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={profil.zuzahlungsbefreiung || false}
              onChange={handleChange('zuzahlungsbefreiung')}
            />
            <div>
              <p className="text-sm text-white/90">Zuzahlungsbefreiung</p>
              <p className="text-xs text-white/50">Bei Überschreitung der Belastungsgrenze (2% des Einkommens)</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={profil.chronisch_krank || false}
              onChange={handleChange('chronisch_krank')}
            />
            <div>
              <p className="text-sm text-white/90">Chronisch krank</p>
              <p className="text-xs text-white/50">Belastungsgrenze reduziert auf 1% des Einkommens</p>
            </div>
          </label>
        </div>
      </div>

      {/* DATENSCHUTZ */}
      <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
        <div className="flex items-start gap-3">
          <span className="text-cyan-400 mt-0.5">🔒</span>
          <div className="text-xs text-white/50">
            <p className="font-medium text-white/70 mb-1">Datenschutz bei Gesundheitsdaten:</p>
            <p>Gesundheitsdaten unterliegen besonderem Schutz nach Art. 9 DSGVO und § 203 StGB (ärztliche Schweigepflicht).
            Die Verarbeitung erfolgt ausschließlich zum Zweck der Antragstellung nach § 284 SGB V.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
