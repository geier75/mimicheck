import React from 'react';

export default function EinkommenSection({ profil, handleChange }) {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <span className="text-xl">💼</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-300 mb-1">Einkommensangaben nach SGB</h4>
            <p className="text-xs text-white/60">
              Ihre Einkommensdaten werden gemäß § 82 SGB XII und § 11 SGB II erfasst für die Berechnung von Sozialleistungen.
            </p>
          </div>
        </div>
      </div>

      {/* BESCHÄFTIGUNGSSTATUS */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-sm">1</span>
          Beschäftigungsstatus
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
              Aktueller Status <span className="text-rose-400">*</span>
            </label>
            <select 
              value={profil.beschaeftigungsstatus || ''}
              onChange={handleChange('beschaeftigungsstatus')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            >
              <option value="">Bitte wählen...</option>
              <option value="angestellt">Angestellt</option>
              <option value="selbststaendig">Selbstständig</option>
              <option value="beamter">Beamte/r</option>
              <option value="arbeitslos">Arbeitssuchend</option>
              <option value="rentner">Rentner/in</option>
              <option value="student">Student/in</option>
              <option value="elternzeit">Elternzeit</option>
              <option value="minijob">Minijob (450€)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Beschäftigt seit</label>
            <input 
              type="date"
              value={profil.beschaeftigt_seit || ''}
              onChange={handleChange('beschaeftigt_seit')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Arbeitgeber</label>
            <input 
              type="text"
              value={profil.arbeitgeber || ''}
              onChange={handleChange('arbeitgeber')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="Name des Arbeitgebers"
            />
          </div>
        </div>
      </div>

      {/* EINKOMMEN */}
      <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <h4 className="text-sm font-semibold text-emerald-300 mb-3">Monatliches Einkommen (Brutto)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
              Gehalt/Lohn (€) <span className="text-rose-400">*</span>
            </label>
            <input 
              type="number"
              value={profil.einkommen_brutto || ''}
              onChange={handleChange('einkommen_brutto')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Netto-Einkommen (€)</label>
            <input 
              type="number"
              value={profil.einkommen_netto || ''}
              onChange={handleChange('einkommen_netto')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Nebeneinkünfte (€)</label>
            <input 
              type="number"
              value={profil.nebeneinkuenfte || ''}
              onChange={handleChange('nebeneinkuenfte')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* SOZIALLEISTUNGEN */}
      <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <h4 className="text-sm font-semibold text-amber-300 mb-3">Aktuelle Sozialleistungen</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={profil.bezieht_alg1 || false}
              onChange={handleChange('bezieht_alg1')}
            />
            <div>
              <p className="text-sm text-white/90">Arbeitslosengeld I (ALG I)</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={profil.bezieht_buergergeld || false}
              onChange={handleChange('bezieht_buergergeld')}
            />
            <div>
              <p className="text-sm text-white/90">Bürgergeld (ALG II)</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={profil.bezieht_wohngeld || false}
              onChange={handleChange('bezieht_wohngeld')}
            />
            <div>
              <p className="text-sm text-white/90">Wohngeld</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={profil.bezieht_kindergeld || false}
              onChange={handleChange('bezieht_kindergeld')}
            />
            <div>
              <p className="text-sm text-white/90">Kindergeld</p>
            </div>
          </label>
        </div>
      </div>

      {/* INFO */}
      <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
        <div className="flex items-start gap-3">
          <span className="text-cyan-400 mt-0.5">ℹ️</span>
          <div className="text-xs text-white/50">
            <p className="font-medium text-white/70 mb-1">Hinweis:</p>
            <p>Alle Einkommensangaben werden für die Berechnung von Sozialleistungsansprüchen benötigt.
            Bitte halten Sie aktuelle Gehaltsabrechnungen bereit.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
