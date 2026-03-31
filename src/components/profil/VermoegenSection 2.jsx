import React from 'react';

export default function VermoegenSection({ profil, handleChange }) {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
        <div className="flex items-start gap-3">
          <span className="text-xl">💰</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-yellow-300 mb-1">Vermögensangaben nach SGB II</h4>
            <p className="text-xs text-white/60">
              Vermögen wird gemäß § 12 SGB II bei der Berechnung von Sozialleistungen berücksichtigt. 
              Es gelten Freibeträge (Schonvermögen).
            </p>
          </div>
        </div>
      </div>

      {/* GELDVERMÖGEN */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center text-sm">🏦</span>
          Geldvermögen
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
              Bargeld & Bankguthaben (€)
            </label>
            <input 
              type="number"
              value={profil.vermoegen_bank || ''}
              onChange={handleChange('vermoegen_bank')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Wertpapiere/Aktien (€)</label>
            <input 
              type="number"
              value={profil.vermoegen_wertpapiere || ''}
              onChange={handleChange('vermoegen_wertpapiere')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Lebensversicherungen (Rückkaufswert, €)</label>
            <input 
              type="number"
              value={profil.vermoegen_lebensversicherung || ''}
              onChange={handleChange('vermoegen_lebensversicherung')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Bausparverträge (€)</label>
            <input 
              type="number"
              value={profil.vermoegen_bauspar || ''}
              onChange={handleChange('vermoegen_bauspar')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* IMMOBILIEN */}
      <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <h4 className="text-sm font-semibold text-blue-300 mb-3">Immobilien & Grundstücke</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Eigene Immobilie (Verkehrswert, €)</label>
            <input 
              type="number"
              value={profil.vermoegen_immobilie || ''}
              onChange={handleChange('vermoegen_immobilie')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Wohnfläche der Immobilie (m²)</label>
            <input 
              type="number"
              value={profil.immobilie_wohnflaeche || ''}
              onChange={handleChange('immobilie_wohnflaeche')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox"
                checked={profil.selbst_genutzte_immobilie || false}
                onChange={handleChange('selbst_genutzte_immobilie')}
              />
              <div>
                <p className="text-sm text-white/90">Selbst genutzte Immobilie</p>
                <p className="text-xs text-white/50">Wird unter bestimmten Voraussetzungen als Schonvermögen anerkannt</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* FAHRZEUGE */}
      <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20">
        <h4 className="text-sm font-semibold text-purple-300 mb-3">Fahrzeuge</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">PKW (Zeitwert, €)</label>
            <input 
              type="number"
              value={profil.vermoegen_kfz || ''}
              onChange={handleChange('vermoegen_kfz')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="0.00"
              step="0.01"
            />
            <p className="text-xs text-white/40 mt-1">Freibetrag: 15.500€ für angemessenes Fahrzeug</p>
          </div>
        </div>
      </div>

      {/* SCHONVERMÖGEN INFO */}
      <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <h4 className="text-sm font-semibold text-emerald-300 mb-3">Schonvermögen (Freibeträge) 2024</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-lg font-bold text-emerald-400">15.000€</p>
            <p className="text-xs text-white/60">pro erwerbsfähiger Person</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-lg font-bold text-emerald-400">15.000€</p>
            <p className="text-xs text-white/60">zusätzlich für Partner/in</p>
          </div>
        </div>
        <p className="text-xs text-white/50 mt-3">
          Diese Beträge gelten für Bürgergeld-Empfänger in den ersten 12 Monaten (Karenzzeit). 
          Danach gilt ein reduzierter Freibetrag.
        </p>
      </div>
    </div>
  );
}
