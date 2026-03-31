import React from 'react';

const BUNDESLAENDER = [
  { value: 'BW', label: 'Baden-Württemberg' },
  { value: 'BY', label: 'Bayern' },
  { value: 'BE', label: 'Berlin' },
  { value: 'BB', label: 'Brandenburg' },
  { value: 'HB', label: 'Bremen' },
  { value: 'HH', label: 'Hamburg' },
  { value: 'HE', label: 'Hessen' },
  { value: 'MV', label: 'Mecklenburg-Vorpommern' },
  { value: 'NI', label: 'Niedersachsen' },
  { value: 'NW', label: 'Nordrhein-Westfalen' },
  { value: 'RP', label: 'Rheinland-Pfalz' },
  { value: 'SL', label: 'Saarland' },
  { value: 'SN', label: 'Sachsen' },
  { value: 'ST', label: 'Sachsen-Anhalt' },
  { value: 'SH', label: 'Schleswig-Holstein' },
  { value: 'TH', label: 'Thüringen' }
];

export default function KontaktSection({ profil, handleChange }) {
  return (
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
            PFLICHTANGABE GEMÄß MELDEGESETZ
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
              {BUNDESLAENDER.map(bl => (
                <option key={bl.value} value={bl.value}>{bl.label}</option>
              ))}
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
              value={profil.landkreis || ''}
              onChange={handleChange('landkreis')}
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
            <input 
              type="checkbox" 
              checked={profil.abweichende_postanschrift || false}
              onChange={handleChange('abweichende_postanschrift')}
              className="w-4 h-4 rounded" 
            />
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
                value={profil.telefon_mobil || ''}
                onChange={handleChange('telefon_mobil')}
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
                value={profil.telefon_festnetz || ''}
                onChange={handleChange('telefon_festnetz')}
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
              value={profil.email || ''}
              onChange={handleChange('email')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
              placeholder="max.mustermann@email.de"
              required
            />
            <div className="mt-2 flex items-start gap-2">
              <input 
                type="checkbox"
                checked={profil.elektronische_zustellung || false}
                onChange={handleChange('elektronische_zustellung')}
                className="mt-0.5" 
              />
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
              value={profil.de_mail || ''}
              onChange={handleChange('de_mail')}
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
            <select 
              value={profil.erreichbarkeit || ''}
              onChange={handleChange('erreichbarkeit')}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="">Bitte wählen...</option>
              <option value="morgens">Montag - Freitag: 8-12 Uhr</option>
              <option value="nachmittags">Montag - Freitag: 13-17 Uhr</option>
              <option value="ganztags">Montag - Freitag: ganztags</option>
              <option value="flexibel">Flexibel</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/60 block mb-2">Bevorzugter Kontaktweg</label>
            <select 
              value={profil.bevorzugter_kontaktweg || ''}
              onChange={handleChange('bevorzugter_kontaktweg')}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="">Bitte wählen...</option>
              <option value="email">E-Mail</option>
              <option value="mobil">Mobiltelefon</option>
              <option value="festnetz">Festnetz</option>
              <option value="post">Briefpost</option>
              <option value="demail">De-Mail</option>
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
  );
}
