import React from 'react';

export default function BesonderesSection({ profil, handleChange }) {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-orange-300 mb-1">Besondere Lebensumstände</h4>
            <p className="text-xs text-white/60">
              Besondere Umstände können zu Mehrbedarfen führen (§ 21 SGB II, § 30 SGB XII).
              Alle Angaben sind freiwillig und werden streng vertraulich behandelt.
            </p>
          </div>
        </div>
      </div>

      {/* GESUNDHEIT */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-sm">🏥</span>
          Gesundheit & Behinderung
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20">
            <input 
              type="checkbox"
              checked={profil.schwerbehindert || false}
              onChange={handleChange('schwerbehindert')}
              className="mt-1"
            />
            <div>
              <p className="text-sm font-medium text-white">Schwerbehinderung</p>
              <p className="text-xs text-white/60">GdB ≥ 50 mit Schwerbehindertenausweis</p>
            </div>
          </label>

          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Grad der Behinderung (GdB)</label>
            <select 
              value={profil.gdb || ''}
              onChange={handleChange('gdb')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            >
              <option value="">Bitte wählen...</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
              <option value="60">60</option>
              <option value="70">70</option>
              <option value="80">80</option>
              <option value="90">90</option>
              <option value="100">100</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Merkzeichen</label>
            <input 
              type="text"
              value={profil.merkzeichen || ''}
              onChange={handleChange('merkzeichen')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="z.B. G, aG, B, H, Bl, Gl"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Pflegegrad</label>
            <select 
              value={profil.pflegegrad || ''}
              onChange={handleChange('pflegegrad')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            >
              <option value="">Kein Pflegegrad</option>
              <option value="1">Pflegegrad 1</option>
              <option value="2">Pflegegrad 2</option>
              <option value="3">Pflegegrad 3</option>
              <option value="4">Pflegegrad 4</option>
              <option value="5">Pflegegrad 5</option>
            </select>
          </div>
        </div>
      </div>

      {/* SCHWANGERSCHAFT */}
      <div className="p-5 rounded-xl bg-pink-500/5 border border-pink-500/20">
        <h4 className="text-sm font-semibold text-pink-300 mb-3">Schwangerschaft & Alleinerziehend</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={profil.schwanger || false}
              onChange={handleChange('schwanger')}
            />
            <div>
              <p className="text-sm text-white/90">Schwanger</p>
              <p className="text-xs text-white/50">Mehrbedarf ab 13. Woche: 17%</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={profil.alleinerziehend || false}
              onChange={handleChange('alleinerziehend')}
            />
            <div>
              <p className="text-sm text-white/90">Alleinerziehend</p>
              <p className="text-xs text-white/50">Mehrbedarf: 12-60% je nach Kinderanzahl</p>
            </div>
          </label>

          {profil.schwanger && (
            <div>
              <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Voraussichtlicher Entbindungstermin</label>
              <input 
                type="date"
                value={profil.entbindungstermin || ''}
                onChange={handleChange('entbindungstermin')}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* BESONDERE ERNÄHRUNG */}
      <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <h4 className="text-sm font-semibold text-amber-300 mb-3">Besondere Ernährungsbedarfe</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={profil.kostenaufwaendige_ernaehrung || false}
              onChange={handleChange('kostenaufwaendige_ernaehrung')}
            />
            <div>
              <p className="text-sm text-white/90">Kostenaufwändige Ernährung erforderlich</p>
              <p className="text-xs text-white/50">z.B. bei Diabetes, Niereninsuffizienz, Zöliakie</p>
            </div>
          </label>
        </div>
      </div>

      {/* WEITERE UMSTÄNDE */}
      <div className="p-5 rounded-xl bg-white/5 border border-white/10">
        <h4 className="text-sm font-semibold text-white mb-3">Weitere besondere Umstände</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={profil.dezentrale_warmwasser || false}
              onChange={handleChange('dezentrale_warmwasser')}
            />
            <div>
              <p className="text-sm text-white/90">Dezentrale Warmwassererzeugung</p>
              <p className="text-xs text-white/50">z.B. Durchlauferhitzer, Boiler</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={profil.erwerbsgemindert || false}
              onChange={handleChange('erwerbsgemindert')}
            />
            <div>
              <p className="text-sm text-white/90">Erwerbsminderung/Erwerbsunfähigkeit</p>
            </div>
          </label>
        </div>
      </div>

      {/* DATENSCHUTZ */}
      <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
        <div className="flex items-start gap-3">
          <span className="text-cyan-400 mt-0.5">🔒</span>
          <div className="text-xs text-white/50">
            <p className="font-medium text-white/70 mb-1">Besonderer Datenschutz:</p>
            <p>Gesundheitsdaten und Angaben zu besonderen Lebensumständen unterliegen dem besonderen Schutz 
            nach Art. 9 DSGVO. Die Verarbeitung erfolgt nur mit Ihrer ausdrücklichen Einwilligung.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
