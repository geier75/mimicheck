import React from 'react';

export default function BankSection({ profil, handleChange }) {
  // Auto-Format IBAN
  const formatIBAN = (e) => {
    let value = e.target.value.replace(/\s/g, '').toUpperCase();
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formatted;
    handleChange('iban')({ target: { value: formatted } });
  };

  return (
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
              value={profil.kontoinhaber || ''}
              onChange={handleChange('kontoinhaber')}
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
              value={profil.iban || ''}
              onChange={formatIBAN}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 font-mono"
              placeholder="DE89 3704 0044 0532 0130 00"
              maxLength="27"
              required
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
              value={profil.bic || ''}
              onChange={handleChange('bic')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 font-mono"
              placeholder="COBADEFFXXX"
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
              value={profil.bank_name || ''}
              onChange={handleChange('bank_name')}
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
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Kontotyp</label>
            <select 
              value={profil.kontotyp || 'girokonto'}
              onChange={handleChange('kontotyp')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            >
              <option value="girokonto">Girokonto (Standard)</option>
              <option value="sparkonto">Sparkonto</option>
              <option value="gemeinschaftskonto">Gemeinschaftskonto</option>
              <option value="geschaeftskonto">Geschäftskonto</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Verwendungszweck</label>
            <select 
              value={profil.bank_verwendungszweck || 'alle'}
              onChange={handleChange('bank_verwendungszweck')}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
            >
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
              value={profil.weitere_kontoinhaber || ''}
              onChange={handleChange('weitere_kontoinhaber')}
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
                <input 
                  type="checkbox"
                  checked={profil.sepa_mandat || false}
                  onChange={handleChange('sepa_mandat')}
                  className="mt-0.5" 
                />
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
            <input 
              type="radio" 
              name="payment" 
              value="bank"
              checked={(profil.auszahlungsweg || 'bank') === 'bank'}
              onChange={handleChange('auszahlungsweg')}
            />
            <div>
              <p className="text-sm text-white/90">Banküberweisung (Standard)</p>
              <p className="text-xs text-white/50">1-2 Werktage, kostenlos</p>
            </div>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="radio" 
              name="payment" 
              value="postbank"
              checked={profil.auszahlungsweg === 'postbank'}
              onChange={handleChange('auszahlungsweg')}
            />
            <div>
              <p className="text-sm text-white/90">Postbank Bareinzahlung</p>
              <p className="text-xs text-white/50">Für Personen ohne Bankkonto, Gebühr: 2,50€</p>
            </div>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="radio" 
              name="payment" 
              value="scheck"
              checked={profil.auszahlungsweg === 'scheck'}
              onChange={handleChange('auszahlungsweg')}
            />
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
  );
}
