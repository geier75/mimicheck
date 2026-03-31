import React from 'react';

export default function EinwilligungenSection({ profil, setProfil, handleSave, saving }) {
  const toggleField = (field) => () => {
    setProfil(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="space-y-6">
      {/* EU COMPLIANCE HEADER */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center shrink-0">
            <span className="text-2xl">🛡️</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-3">Datenschutz nach höchsten EU-Standards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <div>
                    <span className="text-sm font-medium text-white">AES-256 Verschlüsselung</span>
                    <p className="text-xs text-white/60">Militärische Sicherheitsstandards</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <div>
                    <span className="text-sm font-medium text-white">Server in Deutschland</span>
                    <p className="text-xs text-white/60">100% EU-Rechtsraum</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <div>
                    <span className="text-sm font-medium text-white">EU AI Act konform</span>
                    <p className="text-xs text-white/60">Transparente KI-Verarbeitung</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <div>
                    <span className="text-sm font-medium text-white">Löschung jederzeit möglich</span>
                    <p className="text-xs text-white/60">Volle Kontrolle über Ihre Daten</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DSGVO EINWILLIGUNG */}
      <ConsentCard
        checked={profil.dsgvo_einwilligung}
        onClick={toggleField('dsgvo_einwilligung')}
        title="Einwilligung zur Datenverarbeitung (DSGVO Art. 6)"
        required
        badge="PFLICHT"
        badgeColor="emerald"
        description="Ich willige ein, dass meine personenbezogenen Daten zur Bearbeitung meiner Anträge und zur Identifikation passender Förderungen verarbeitet werden."
        details={
          <>
            <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO</p>
            <p className="mt-1">Speicherdauer: Bis zu 10 Jahre nach Antragstellung (gesetzliche Aufbewahrungspflicht)</p>
            <p className="mt-1">Widerruf: Jederzeit möglich unter datenschutz@mimicheck.de</p>
          </>
        }
      />

      {/* EU AI ACT EINWILLIGUNG */}
      <ConsentCard
        checked={profil.ki_verarbeitung_einwilligung}
        onClick={toggleField('ki_verarbeitung_einwilligung')}
        title="KI-gestützte Verarbeitung (EU AI Act konform)"
        badge="OPTIONAL"
        badgeColor="cyan"
        description="Ich willige ein, dass eine KI meine Daten analysiert, um passende Förderungen zu identifizieren und Anträge automatisch vorzuausfüllen. Die finale Prüfung erfolgt stets durch mich."
        extraContent={
          <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
            <p className="text-xs text-cyan-300 font-medium mb-2">🤖 KI-Transparenz gemäß EU AI Act:</p>
            <ul className="text-xs text-white/60 space-y-1">
              <li>• Verwendetes Modell: GPT-4 / Claude 3.5</li>
              <li>• Zweck: Formularerkennung & Antragsoptimierung</li>
              <li>• Risikokategorie: Minimal (keine Entscheidungsautonomie)</li>
              <li>• Menschliche Aufsicht: 100% (Sie prüfen alle Vorschläge)</li>
            </ul>
          </div>
        }
      />

      {/* DATENWEITERGABE */}
      <ConsentCard
        checked={profil.datenweitergabe_behoerden}
        onClick={toggleField('datenweitergabe_behoerden')}
        title="Datenübermittlung an Behörden"
        badge="EMPFOHLEN"
        badgeColor="purple"
        description="Ich willige ein, dass meine Daten verschlüsselt an zuständige Behörden (Jobcenter, Familienkasse, Wohngeldamt) übermittelt werden dürfen."
        extraContent={
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 bg-white/5 rounded-lg">
              <p className="text-xs text-white/60">Übertragung via:</p>
              <p className="text-xs font-medium text-white/80">🔒 Ende-zu-Ende verschlüsselt</p>
            </div>
            <div className="p-2 bg-white/5 rounded-lg">
              <p className="text-xs text-white/60">Protokoll:</p>
              <p className="text-xs font-medium text-white/80">📋 Vollständig nachvollziehbar</p>
            </div>
          </div>
        }
      />

      {/* IHRE RECHTE */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>⚖️</span> Ihre Rechte nach DSGVO
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <RightItem icon="📋" title="Auskunftsrecht" description="Jederzeit Einsicht in gespeicherte Daten" />
            <RightItem icon="✏️" title="Berichtigung" description="Korrektur falscher Daten" />
            <RightItem icon="🗑️" title="Löschung" description="Recht auf Vergessenwerden" />
          </div>
          <div className="space-y-3">
            <RightItem icon="⏸️" title="Einschränkung" description="Verarbeitung temporär stoppen" />
            <RightItem icon="📦" title="Datenportabilität" description="Daten in maschinenlesbarem Format" />
            <RightItem icon="🚫" title="Widerspruch" description="Gegen Profiling & Direktmarketing" />
          </div>
        </div>
      </div>

      {/* KONTAKT DATENSCHUTZ */}
      <div className="p-6 rounded-xl bg-slate-800 border border-white/10">
        <h4 className="text-base font-semibold text-white mb-3">Datenschutzbeauftragter</h4>
        <div className="space-y-2">
          <p className="text-sm text-white/70">Dr. Michael Schmidt (TÜV-zertifiziert)</p>
          <p className="text-sm text-white/70">📧 datenschutz@mimicheck.de</p>
          <p className="text-sm text-white/70">📞 +49 30 12345678</p>
          <p className="text-sm text-white/70 mt-3">
            Aufsichtsbehörde: Der Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI)
          </p>
        </div>
      </div>

      {/* SAVE STATUS */}
      {profil.dsgvo_einwilligung && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
          <span className="text-emerald-400 text-xl">✅</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-300">Einwilligungen erteilt</p>
            <p className="text-xs text-emerald-200/70">Sie können nun Ihr Profil speichern und Anträge stellen.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium text-sm disabled:opacity-50"
          >
            {saving ? 'Speichern...' : 'Profil speichern'}
          </button>
        </div>
      )}
    </div>
  );
}

// Hilfkomponente für Einwilligungskarten
function ConsentCard({ checked, onClick, title, required, badge, badgeColor, description, details, extraContent }) {
  const colorClasses = {
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', checkbox: 'from-emerald-500 to-teal-500', badge: 'bg-emerald-500/20 text-emerald-300' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', checkbox: 'from-cyan-500 to-blue-500', badge: 'bg-cyan-500/20 text-cyan-300' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', checkbox: 'from-purple-500 to-pink-500', badge: 'bg-purple-500/20 text-purple-300' }
  };
  const colors = colorClasses[badgeColor] || colorClasses.emerald;

  return (
    <div 
      className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
        checked ? `${colors.bg} ${colors.border}` : 'bg-white/5 border-white/10 hover:border-white/20'
      }`} 
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${
          checked ? `bg-gradient-to-r ${colors.checkbox} border-transparent` : 'border-white/20'
        }`}>
          {checked && <span className="text-white text-xs">✓</span>}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base font-semibold text-white">{title}</span>
            {required && <span className="text-rose-400">*</span>}
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${colors.badge}`}>{badge}</span>
          </div>
          <p className="text-sm text-white/70 mb-3">{description}</p>
          {details && (
            <details className="text-xs text-white/50">
              <summary className="cursor-pointer hover:text-white/70">Weitere Details anzeigen</summary>
              <div className="mt-2 p-3 bg-white/5 rounded-lg">{details}</div>
            </details>
          )}
          {extraContent}
        </div>
      </div>
    </div>
  );
}

// Hilfkomponente für Rechte
function RightItem({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-white/60">{description}</p>
      </div>
    </div>
  );
}
