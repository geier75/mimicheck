import React from 'react';

export default function BildungSection({ profil, handleChange }) {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
        <div className="flex items-start gap-3">
          <span className="text-xl">🎓</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-indigo-300 mb-1">Bildung & Qualifikation</h4>
            <p className="text-xs text-white/60">
              Angaben zu Bildung und Ausbildung sind relevant für BAföG, Bildungsgutscheine und Weiterbildungsförderung.
            </p>
          </div>
        </div>
      </div>

      {/* SCHULBILDUNG */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center text-sm">📚</span>
          Schulbildung
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">
              Höchster Schulabschluss
            </label>
            <select 
              value={profil.schulabschluss || ''}
              onChange={handleChange('schulabschluss')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            >
              <option value="">Bitte wählen...</option>
              <option value="ohne">Ohne Schulabschluss</option>
              <option value="hauptschule">Hauptschulabschluss</option>
              <option value="realschule">Realschulabschluss / Mittlere Reife</option>
              <option value="fachabitur">Fachhochschulreife</option>
              <option value="abitur">Allgemeine Hochschulreife (Abitur)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Abschlussjahr</label>
            <input 
              type="number"
              value={profil.schulabschluss_jahr || ''}
              onChange={handleChange('schulabschluss_jahr')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="z.B. 2018"
              min="1950"
              max="2030"
            />
          </div>
        </div>
      </div>

      {/* BERUFSAUSBILDUNG */}
      <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <h4 className="text-sm font-semibold text-blue-300 mb-3">Berufsausbildung</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Berufsabschluss</label>
            <select 
              value={profil.berufsabschluss || ''}
              onChange={handleChange('berufsabschluss')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            >
              <option value="">Bitte wählen...</option>
              <option value="ohne">Ohne Berufsausbildung</option>
              <option value="ausbildung">Abgeschlossene Berufsausbildung</option>
              <option value="meister">Meister/Techniker/Fachwirt</option>
              <option value="bachelor">Bachelor</option>
              <option value="master">Master/Diplom/Magister</option>
              <option value="promotion">Promotion</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Ausgebildeter Beruf</label>
            <input 
              type="text"
              value={profil.ausbildungsberuf || ''}
              onChange={handleChange('ausbildungsberuf')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="z.B. Kaufmann/-frau für Büromanagement"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Abschlussjahr</label>
            <input 
              type="number"
              value={profil.berufsabschluss_jahr || ''}
              onChange={handleChange('berufsabschluss_jahr')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              placeholder="z.B. 2020"
            />
          </div>
        </div>
      </div>

      {/* AKTUELLER STATUS */}
      <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <h4 className="text-sm font-semibold text-emerald-300 mb-3">Aktueller Bildungsstatus</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={profil.aktuell_in_ausbildung || false}
              onChange={handleChange('aktuell_in_ausbildung')}
            />
            <div>
              <p className="text-sm text-white/90">Aktuell in Ausbildung</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={profil.aktuell_student || false}
              onChange={handleChange('aktuell_student')}
            />
            <div>
              <p className="text-sm text-white/90">Aktuell Student/in</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={profil.aktuell_weiterbildung || false}
              onChange={handleChange('aktuell_weiterbildung')}
            />
            <div>
              <p className="text-sm text-white/90">In Weiterbildung/Umschulung</p>
            </div>
          </label>
        </div>

        {(profil.aktuell_student || profil.aktuell_in_ausbildung) && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Bildungseinrichtung</label>
              <input 
                type="text"
                value={profil.bildungseinrichtung || ''}
                onChange={handleChange('bildungseinrichtung')}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                placeholder="z.B. TU Berlin, IHK München"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Studiengang/Ausbildung</label>
              <input 
                type="text"
                value={profil.studiengang || ''}
                onChange={handleChange('studiengang')}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                placeholder="z.B. Informatik B.Sc."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Voraussichtliches Ende</label>
              <input 
                type="date"
                value={profil.ausbildung_ende || ''}
                onChange={handleChange('ausbildung_ende')}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* FÖRDERUNGSMÖGLICHKEITEN */}
      <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <h4 className="text-sm font-semibold text-amber-300 mb-3">Mögliche Bildungsförderungen</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-sm font-medium text-white">BAföG</p>
            <p className="text-xs text-white/60">Für Studenten und Schüler ab Klasse 10</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-sm font-medium text-white">Berufsausbildungsbeihilfe</p>
            <p className="text-xs text-white/60">Für Auszubildende mit eigenem Haushalt</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-sm font-medium text-white">Bildungsgutschein</p>
            <p className="text-xs text-white/60">Für berufliche Weiterbildung</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-sm font-medium text-white">Aufstiegs-BAföG</p>
            <p className="text-xs text-white/60">Für Meister, Techniker, Fachwirt</p>
          </div>
        </div>
      </div>

      {/* INFO */}
      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
        <div className="flex items-center gap-3">
          <span className="text-indigo-400 text-xl">💡</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-indigo-300">Automatische Förderprüfung</p>
            <p className="text-xs text-indigo-200/70">
              Nach Eingabe aller Daten prüfen wir automatisch Ihre Ansprüche auf Bildungsförderungen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
