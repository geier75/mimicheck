import React from 'react';

export default function PartnerSection({ profil, handleChange }) {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
        <div className="flex items-start gap-3">
          <span className="text-xl">💑</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-purple-300 mb-1">Partnerschaftliche Lebenssituation</h4>
            <p className="text-xs text-white/60">
              Angaben zum Partner/zur Partnerin sind für die Bedarfsgemeinschaft (§ 7 SGB II) relevant.
            </p>
          </div>
        </div>
      </div>

      {/* FAMILIENSTAND */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-sm">1</span>
          Familienstand
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
              Familienstand <span className="text-rose-400">*</span>
            </label>
            <select 
              value={profil.familienstand || ''}
              onChange={handleChange('familienstand')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            >
              <option value="">Bitte wählen...</option>
              <option value="ledig">Ledig</option>
              <option value="verheiratet">Verheiratet</option>
              <option value="eingetragene_lp">Eingetragene Lebenspartnerschaft</option>
              <option value="geschieden">Geschieden</option>
              <option value="verwitwet">Verwitwet</option>
              <option value="getrennt_lebend">Getrennt lebend</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Datum der Eheschließung</label>
            <input 
              type="date"
              value={profil.heiratsdatum || ''}
              onChange={handleChange('heiratsdatum')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* PARTNER DATEN */}
      {(profil.familienstand === 'verheiratet' || profil.familienstand === 'eingetragene_lp') && (
        <div className="p-5 rounded-xl bg-white/5 border border-white/10">
          <h4 className="text-sm font-semibold text-white mb-4">Daten des Partners / der Partnerin</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Vorname</label>
              <input 
                type="text"
                value={profil.partner_vorname || ''}
                onChange={handleChange('partner_vorname')}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Nachname</label>
              <input 
                type="text"
                value={profil.partner_nachname || ''}
                onChange={handleChange('partner_nachname')}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Geburtsdatum</label>
              <input 
                type="date"
                value={profil.partner_geburtsdatum || ''}
                onChange={handleChange('partner_geburtsdatum')}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Steuer-ID</label>
              <input 
                type="text"
                value={profil.partner_steuer_id || ''}
                onChange={handleChange('partner_steuer_id')}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                placeholder="11-stellig"
              />
            </div>
          </div>
        </div>
      )}

      {/* PARTNER EINKOMMEN */}
      {(profil.familienstand === 'verheiratet' || profil.familienstand === 'eingetragene_lp') && (
        <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
          <h4 className="text-sm font-semibold text-blue-300 mb-3">Einkommen des Partners</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Beschäftigungsstatus</label>
              <select 
                value={profil.partner_beschaeftigung || ''}
                onChange={handleChange('partner_beschaeftigung')}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              >
                <option value="">Bitte wählen...</option>
                <option value="angestellt">Angestellt</option>
                <option value="selbststaendig">Selbstständig</option>
                <option value="arbeitslos">Arbeitssuchend</option>
                <option value="rentner">Rentner/in</option>
                <option value="hausfrau">Hausfrau/-mann</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Monatl. Einkommen (Netto, €)</label>
              <input 
                type="number"
                value={profil.partner_einkommen || ''}
                onChange={handleChange('partner_einkommen')}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
        </div>
      )}

      {/* BEDARFSGEMEINSCHAFT */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 text-xl">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-300">Bedarfsgemeinschaft</p>
            <p className="text-xs text-amber-200/70">
              Bei Bürgergeld bilden Ehepartner/Lebenspartner automatisch eine Bedarfsgemeinschaft. 
              Das Einkommen beider Partner wird bei der Berechnung berücksichtigt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
