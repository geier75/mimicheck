import React from 'react';

export default function WohnungSection({ profil, handleChange }) {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <span className="text-xl">🏠</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-300 mb-1">Wohnsituation nach WoGG</h4>
            <p className="text-xs text-white/60">
              Ihre Wohndaten werden gemäß Wohngeldgesetz (WoGG) und Sozialgesetzbuch II (SGB II) erfasst.
            </p>
          </div>
        </div>
      </div>

      {/* WOHNVERHÄLTNIS */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-sm">1</span>
          Wohnverhältnis
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
              Wohnstatus <span className="text-rose-400">*</span>
            </label>
            <select 
              value={profil.wohnstatus || ''}
              onChange={handleChange('wohnstatus')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            >
              <option value="">Bitte wählen...</option>
              <option value="miete">Zur Miete</option>
              <option value="eigentum">Eigentum</option>
              <option value="wohnrecht">Wohnrecht / Nießbrauch</option>
              <option value="untermiete">Untermiete</option>
              <option value="obdachlos">Ohne feste Unterkunft</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Einzugsdatum</label>
            <input 
              type="date"
              value={profil.einzugsdatum || ''}
              onChange={handleChange('einzugsdatum')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
              Wohnfläche (m²) <span className="text-rose-400">*</span>
            </label>
            <input 
              type="number"
              value={profil.wohnflaeche || ''}
              onChange={handleChange('wohnflaeche')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="z.B. 65"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Anzahl Zimmer</label>
            <input 
              type="number"
              value={profil.anzahl_zimmer || ''}
              onChange={handleChange('anzahl_zimmer')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="z.B. 3"
            />
          </div>
        </div>
      </div>

      {/* MIETKOSTEN */}
      <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <h4 className="text-sm font-semibold text-blue-300 mb-3">Miet- und Wohnkosten</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
              Kaltmiete (€/Monat) <span className="text-rose-400">*</span>
            </label>
            <input 
              type="number"
              value={profil.kaltmiete || ''}
              onChange={handleChange('kaltmiete')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
              Nebenkosten (€/Monat)
            </label>
            <input 
              type="number"
              value={profil.nebenkosten || ''}
              onChange={handleChange('nebenkosten')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
              Heizkosten (€/Monat)
            </label>
            <input 
              type="number"
              value={profil.heizkosten || ''}
              onChange={handleChange('heizkosten')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
        <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg">
          <p className="text-xs text-emerald-300">
            💡 Warmmiete gesamt: <strong>{((parseFloat(profil.kaltmiete) || 0) + (parseFloat(profil.nebenkosten) || 0) + (parseFloat(profil.heizkosten) || 0)).toFixed(2)} €</strong>
          </p>
        </div>
      </div>

      {/* HAUSHALTSGRÖSSE */}
      <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20">
        <h4 className="text-sm font-semibold text-purple-300 mb-3">Haushaltsgröße</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
              Personen im Haushalt <span className="text-rose-400">*</span>
            </label>
            <input 
              type="number"
              value={profil.personen_haushalt || ''}
              onChange={handleChange('personen_haushalt')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="z.B. 2"
              min="1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
              Davon Kinder unter 18
            </label>
            <input 
              type="number"
              value={profil.kinder_haushalt || ''}
              onChange={handleChange('kinder_haushalt')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="0"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* WOHNGELD INFO */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 text-xl">💰</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-300">Wohngeld-Prüfung</p>
            <p className="text-xs text-emerald-200/70">
              Nach Eingabe aller Daten können wir Ihren Wohngeldanspruch prüfen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
