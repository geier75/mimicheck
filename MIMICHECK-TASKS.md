# ✅ MiMiCheck - TASK LISTE FÜR VISUAL STUDIO CODE

> Arbeite diese Liste von oben nach unten ab. Hake ab was fertig ist.

---

## 🗄️ PHASE 2: DATENBANK (JETZT STARTEN!)

### Task 2.1: Supabase Tabellen erstellen

**Öffne:** Supabase Dashboard → SQL Editor

**Führe aus:** (Copy & Paste)

```sql
-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  vorname TEXT,
  nachname TEXT,
  geburtsdatum DATE,
  geschlecht TEXT,
  staatsangehoerigkeit TEXT DEFAULT 'deutsch',
  steuer_id TEXT,
  strasse TEXT,
  hausnummer TEXT,
  plz TEXT,
  ort TEXT,
  bundesland TEXT,
  telefon TEXT,
  familienstand TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- =============================================
-- KINDER
-- =============================================
CREATE TABLE IF NOT EXISTS kinder (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vorname TEXT NOT NULL,
  nachname TEXT,
  geburtsdatum DATE NOT NULL,
  lebt_im_haushalt BOOLEAN DEFAULT TRUE,
  in_ausbildung BOOLEAN DEFAULT FALSE,
  eigenes_einkommen DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE kinder ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own kinder" ON kinder FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- PARTNER
-- =============================================
CREATE TABLE IF NOT EXISTS partner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vorname TEXT,
  nachname TEXT,
  geburtsdatum DATE,
  brutto_einkommen DECIMAL(10,2) DEFAULT 0,
  netto_einkommen DECIMAL(10,2) DEFAULT 0,
  beschaeftigungsart TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE partner ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own partner" ON partner FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- EINKOMMEN
-- =============================================
CREATE TABLE IF NOT EXISTS einkommen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  beschaeftigungsart TEXT,
  brutto_monatlich DECIMAL(10,2) DEFAULT 0,
  netto_monatlich DECIMAL(10,2) DEFAULT 0,
  arbeitgeber TEXT,
  nebenjob_brutto DECIMAL(10,2) DEFAULT 0,
  kindergeld DECIMAL(10,2) DEFAULT 0,
  unterhalt DECIMAL(10,2) DEFAULT 0,
  rente DECIMAL(10,2) DEFAULT 0,
  kapitalertraege DECIMAL(10,2) DEFAULT 0,
  sonstige_einkuenfte DECIMAL(10,2) DEFAULT 0,
  steuerklasse INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE einkommen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own einkommen" ON einkommen FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- WOHNSITUATION
-- =============================================
CREATE TABLE IF NOT EXISTS wohnsituation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  wohnart TEXT,
  kaltmiete DECIMAL(10,2) DEFAULT 0,
  nebenkosten DECIMAL(10,2) DEFAULT 0,
  heizkosten DECIMAL(10,2) DEFAULT 0,
  warmmiete_gesamt DECIMAL(10,2) DEFAULT 0,
  wohnflaeche INTEGER,
  anzahl_zimmer INTEGER,
  anzahl_personen INTEGER,
  kreditrate DECIMAL(10,2) DEFAULT 0,
  grundsteuer DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wohnsituation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own wohnsituation" ON wohnsituation FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- BESONDERE UMSTÄNDE
-- =============================================
CREATE TABLE IF NOT EXISTS besondere_umstaende (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  schwerbehinderung BOOLEAN DEFAULT FALSE,
  grad_der_behinderung INTEGER,
  merkzeichen TEXT[],
  pflegegrad INTEGER,
  pflegeperson BOOLEAN DEFAULT FALSE,
  alleinerziehend BOOLEAN DEFAULT FALSE,
  schwanger BOOLEAN DEFAULT FALSE,
  chronisch_krank BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE besondere_umstaende ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own besondere_umstaende" ON besondere_umstaende FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- FÖRDERUNGEN (Katalog)
-- =============================================
CREATE TABLE IF NOT EXISTS foerderungen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  kurzbeschreibung TEXT,
  langbeschreibung TEXT,
  kategorie TEXT,
  zustaendige_behoerde TEXT,
  antrag_url TEXT,
  voraussetzungen JSONB,
  aktiv BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Förderungen sind öffentlich lesbar
ALTER TABLE foerderungen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Foerderungen are public" ON foerderungen FOR SELECT USING (true);

-- =============================================
-- USER FÖRDERUNGEN (Empfehlungen)
-- =============================================
CREATE TABLE IF NOT EXISTS user_foerderungen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  foerderung_id UUID REFERENCES foerderungen(id) ON DELETE CASCADE,
  anspruch_wahrscheinlich BOOLEAN DEFAULT FALSE,
  geschaetzter_betrag DECIMAL(10,2),
  berechnung_details JSONB,
  status TEXT DEFAULT 'empfohlen',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, foerderung_id)
);

ALTER TABLE user_foerderungen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own user_foerderungen" ON user_foerderungen FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- DOKUMENTE
-- =============================================
CREATE TABLE IF NOT EXISTS dokumente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  foerderung_id UUID REFERENCES foerderungen(id),
  dateiname TEXT NOT NULL,
  dateipfad TEXT NOT NULL,
  dateityp TEXT,
  dateigroesse INTEGER,
  dokument_typ TEXT,
  ocr_text TEXT,
  erkannte_felder JSONB,
  ausgefuellte_felder JSONB,
  status TEXT DEFAULT 'hochgeladen',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dokumente ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own dokumente" ON dokumente FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- CHAT NACHRICHTEN
-- =============================================
CREATE TABLE IF NOT EXISTS chat_nachrichten (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rolle TEXT NOT NULL,
  inhalt TEXT NOT NULL,
  foerderung_id UUID REFERENCES foerderungen(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_nachrichten ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own chat" ON chat_nachrichten FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_kinder_user ON kinder(user_id);
CREATE INDEX IF NOT EXISTS idx_einkommen_user ON einkommen(user_id);
CREATE INDEX IF NOT EXISTS idx_user_foerderungen_user ON user_foerderungen(user_id);
CREATE INDEX IF NOT EXISTS idx_dokumente_user ON dokumente(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_nachrichten(user_id);
```

**Status:** ⬜ TODO

---

### Task 2.2: Förderungen Seed Data

**Führe aus:** (nach Task 2.1)

```sql
INSERT INTO foerderungen (name, slug, kurzbeschreibung, kategorie, zustaendige_behoerde, antrag_url, voraussetzungen) VALUES

('Kindergeld', 'kindergeld', 
 'Monatliche Zahlung von 250€ für jedes Kind bis 25 Jahre',
 'familie',
 'Familienkasse der Bundesagentur für Arbeit',
 'https://www.arbeitsagentur.de/familie-und-kinder/kindergeld-beantragen',
 '{"max_alter_kind": 25, "kind_in_ausbildung_oder_unter_18": true}'::jsonb
),

('Kinderzuschlag', 'kinderzuschlag',
 'Bis zu 292€ pro Kind für Familien mit geringem Einkommen',
 'familie',
 'Familienkasse der Bundesagentur für Arbeit',
 'https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag',
 '{"min_einkommen": 900, "kinder_unter_25": true}'::jsonb
),

('Wohngeld', 'wohngeld',
 'Zuschuss zu den Wohnkosten für Haushalte mit geringem Einkommen',
 'wohnen',
 'Wohngeldstelle der Stadt/Gemeinde',
 'https://www.bmwsb.bund.de/Webs/BMWSB/DE/themen/stadt-wohnen/wohnraumfoerderung/wohngeld/wohngeld-node.html',
 '{"keine_transferleistungen": true}'::jsonb
),

('Bürgergeld', 'buergergeld',
 'Grundsicherung für Arbeitssuchende (ca. 563€ + Miete)',
 'soziales',
 'Jobcenter',
 'https://www.arbeitsagentur.de/arbeitslosengeld-2',
 '{"erwerbsfaehig": true, "hilfebeduerfttig": true}'::jsonb
),

('BAföG', 'bafoeg',
 'Ausbildungsförderung bis 934€/Monat für Studenten und Schüler',
 'bildung',
 'BAföG-Amt / Studentenwerk',
 'https://www.bafoeg.bund.de/',
 '{"in_ausbildung": true, "max_alter": 45}'::jsonb
),

('Elterngeld', 'elterngeld',
 '65-100% des Nettoeinkommens für 12-14 Monate nach Geburt',
 'familie',
 'Elterngeldstelle des Bundeslandes',
 'https://familienportal.de/familienportal/familienleistungen/elterngeld',
 '{"kind_unter_14_monate": true}'::jsonb
),

('Grundsicherung im Alter', 'grundsicherung-alter',
 'Unterstützung für Rentner mit geringem Einkommen',
 'soziales',
 'Sozialamt',
 'https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Grundsicherung/grundsicherung_node.html',
 '{"min_alter": 65, "rente_unter_bedarf": true}'::jsonb
),

('Bildung und Teilhabe', 'bildung-teilhabe',
 'Schulbedarf, Ausflüge, Mittagessen für Kinder aus einkommensschwachen Familien',
 'bildung',
 'Jobcenter oder Sozialamt',
 'https://www.bmas.de/DE/Arbeit/Grundsicherung-Buergergeld/Bildungspaket/bildungspaket.html',
 '{"transferleistungen_bezug": true, "kinder_in_schule": true}'::jsonb
),

('Unterhaltsvorschuss', 'unterhaltsvorschuss',
 'Staatliche Unterhaltszahlung für Alleinerziehende',
 'familie',
 'Jugendamt',
 'https://familienportal.de/familienportal/familienleistungen/unterhaltsvorschuss',
 '{"alleinerziehend": true, "kind_unter_18": true}'::jsonb
),

('Lastenzuschuss', 'lastenzuschuss',
 'Wohngeld für selbstnutzende Eigentümer',
 'wohnen',
 'Wohngeldstelle',
 'https://www.bmwsb.bund.de/Webs/BMWSB/DE/themen/stadt-wohnen/wohnraumfoerderung/wohngeld/wohngeld-node.html',
 '{"eigentum": true, "selbst_bewohnt": true}'::jsonb
);
```

**Status:** ⬜ TODO

---

### Task 2.3: Storage Bucket erstellen

**Öffne:** Supabase Dashboard → Storage

1. Klicke "New bucket"
2. Name: `dokumente`
3. Public: ❌ Nein (Private)
4. Klicke "Create bucket"

**Dann SQL für Policy:**

```sql
-- Storage Policy für dokumente bucket
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dokumente' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'dokumente' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'dokumente' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Status:** ⬜ TODO

---

## 📝 PHASE 2.2: ONBOARDING WIZARD

### Task 2.4: Erstelle Onboarding-Komponenten

**Erstelle Datei:** `src/components/onboarding/OnboardingWizard.jsx`

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepPersoenlich from './StepPersoenlich';
import StepFamilie from './StepFamilie';
import StepEinkommen from './StepEinkommen';
import StepWohnung from './StepWohnung';
import StepBesonderes from './StepBesonderes';
import ProgressBar from './ProgressBar';

const STEPS = [
  { id: 1, title: 'Persönliche Daten', component: StepPersoenlich },
  { id: 2, title: 'Familie', component: StepFamilie },
  { id: 3, title: 'Einkommen', component: StepEinkommen },
  { id: 4, title: 'Wohnsituation', component: StepWohnung },
  { id: 5, title: 'Besonderes', component: StepBesonderes },
];

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  const handleNext = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Onboarding abgeschlossen
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    // TODO: Daten an Supabase senden
    console.log('Onboarding Data:', formData);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <ProgressBar 
          currentStep={currentStep} 
          totalSteps={STEPS.length}
          stepTitles={STEPS.map(s => s.title)}
        />
        
        <div className="mt-8 bg-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {STEPS[currentStep - 1].title}
          </h2>
          
          <CurrentStepComponent 
            data={formData}
            onNext={handleNext}
            onBack={handleBack}
            isFirst={currentStep === 1}
            isLast={currentStep === STEPS.length}
          />
        </div>
      </div>
    </div>
  );
}
```

**Status:** ⬜ TODO

---

### Task 2.5: Erstelle Step-Komponenten

**Erstelle:** `src/components/onboarding/StepPersoenlich.jsx`

```jsx
import { useForm } from 'react-hook-form';

export default function StepPersoenlich({ data, onNext, isFirst }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: data
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Vorname *</label>
          <input
            {...register('vorname', { required: 'Pflichtfeld' })}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
          />
          {errors.vorname && <p className="text-red-400 text-sm">{errors.vorname.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nachname *</label>
          <input
            {...register('nachname', { required: 'Pflichtfeld' })}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Geburtsdatum *</label>
        <input
          type="date"
          {...register('geburtsdatum', { required: 'Pflichtfeld' })}
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Familienstand</label>
        <select
          {...register('familienstand')}
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
        >
          <option value="">Bitte wählen</option>
          <option value="ledig">Ledig</option>
          <option value="verheiratet">Verheiratet</option>
          <option value="geschieden">Geschieden</option>
          <option value="verwitwet">Verwitwet</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm text-gray-400 mb-1">Straße</label>
          <input
            {...register('strasse')}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nr.</label>
          <input
            {...register('hausnummer')}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">PLZ</label>
          <input
            {...register('plz')}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm text-gray-400 mb-1">Ort</label>
          <input
            {...register('ort')}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
          />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
          type="submit"
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-6 rounded-lg"
        >
          Weiter →
        </button>
      </div>
    </form>
  );
}
```

**Weitere Steps analog erstellen:**
- `StepFamilie.jsx` - Kinder hinzufügen, Partner
- `StepEinkommen.jsx` - Gehalt, Nebeneinkünfte
- `StepWohnung.jsx` - Miete/Eigentum, Kosten
- `StepBesonderes.jsx` - Behinderung, Pflege, etc.

**Status:** ⬜ TODO

---

## 📊 PHASE 3: DASHBOARD & ANALYSE

### Task 3.1: Anspruchsberechnung implementieren

**Erstelle:** `src/utils/anspruchsberechnung.js`

```javascript
/**
 * Berechnet alle Förderansprüche basierend auf Nutzerdaten
 */
export function berechneAnsprueche(userData) {
  const ergebnisse = [];
  
  // Kindergeld
  const kindergeldResult = berechneKindergeld(userData);
  if (kindergeldResult) ergebnisse.push(kindergeldResult);
  
  // Kinderzuschlag
  const kizResult = berechneKinderzuschlag(userData);
  if (kizResult) ergebnisse.push(kizResult);
  
  // Wohngeld
  const wohngeldResult = berechneWohngeld(userData);
  if (wohngeldResult) ergebnisse.push(wohngeldResult);
  
  // ... weitere Förderungen
  
  return ergebnisse;
}

function berechneKindergeld(userData) {
  const { kinder } = userData;
  if (!kinder || kinder.length === 0) return null;
  
  const berechtigteKinder = kinder.filter(kind => {
    const alter = berechneAlter(kind.geburtsdatum);
    return alter < 18 || (alter < 25 && kind.in_ausbildung);
  });
  
  if (berechtigteKinder.length === 0) return null;
  
  return {
    foerderung_slug: 'kindergeld',
    anspruch: true,
    geschaetzter_betrag: berechtigteKinder.length * 250,
    details: {
      anzahl_kinder: berechtigteKinder.length,
      betrag_pro_kind: 250
    }
  };
}

function berechneKinderzuschlag(userData) {
  const { kinder, einkommen, partner } = userData;
  if (!kinder || kinder.length === 0) return null;
  
  const haushaltsEinkommen = (einkommen?.netto_monatlich || 0) + 
                             (partner?.netto_einkommen || 0);
  
  // Mindestens 900€ Einkommen erforderlich
  if (haushaltsEinkommen < 900) return null;
  
  // Grob: Kein Anspruch wenn zu hohes Einkommen
  const maxEinkommen = 3000 + (kinder.length * 500);
  if (haushaltsEinkommen > maxEinkommen) return null;
  
  const betrag = kinder.length * 250; // Vereinfacht, max 292€
  
  return {
    foerderung_slug: 'kinderzuschlag',
    anspruch: true,
    geschaetzter_betrag: betrag,
    details: {
      haushaltseinkommen: haushaltsEinkommen,
      anzahl_kinder: kinder.length
    }
  };
}

function berechneWohngeld(userData) {
  const { einkommen, partner, wohnung } = userData;
  if (!wohnung) return null;
  
  const haushaltsEinkommen = (einkommen?.netto_monatlich || 0) + 
                             (partner?.netto_einkommen || 0);
  
  // Wohngeld-Tabelle (vereinfacht)
  const personenImHaushalt = wohnung.anzahl_personen || 1;
  const maxEinkommen = 1500 + (personenImHaushalt - 1) * 500;
  
  if (haushaltsEinkommen > maxEinkommen) return null;
  
  // Grobe Schätzung
  const warmmiete = wohnung.warmmiete_gesamt || 0;
  const geschaetzterBetrag = Math.min(warmmiete * 0.3, 400);
  
  return {
    foerderung_slug: 'wohngeld',
    anspruch: true,
    geschaetzter_betrag: Math.round(geschaetzterBetrag),
    details: {
      warmmiete: warmmiete,
      haushaltseinkommen: haushaltsEinkommen
    }
  };
}

// Hilfsfunktionen
function berechneAlter(geburtsdatum) {
  const heute = new Date();
  const geburt = new Date(geburtsdatum);
  let alter = heute.getFullYear() - geburt.getFullYear();
  const m = heute.getMonth() - geburt.getMonth();
  if (m < 0 || (m === 0 && heute.getDate() < geburt.getDate())) {
    alter--;
  }
  return alter;
}

export { berechneAlter };
```

**Status:** ⬜ TODO

---

### Task 3.2: Dashboard-Komponenten erstellen

**Erstelle:** `src/components/dashboard/AnspruchOverview.jsx`

```jsx
export default function AnspruchOverview({ ansprueche }) {
  const gesamtBetrag = ansprueche.reduce((sum, a) => 
    sum + (a.anspruch ? a.geschaetzter_betrag : 0), 0
  );
  
  const anzahlAnsprueche = ansprueche.filter(a => a.anspruch).length;

  return (
    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-white">
      <h2 className="text-lg font-medium opacity-90">Dein geschätzter Anspruch</h2>
      
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-5xl font-bold">{gesamtBetrag}</span>
        <span className="text-2xl">€/Monat</span>
      </div>
      
      <p className="mt-2 opacity-80">
        Basierend auf {anzahlAnsprueche} möglichen Förderungen
      </p>
      
      <button className="mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg">
        Details ansehen →
      </button>
    </div>
  );
}
```

**Status:** ⬜ TODO

---

### Task 3.3: FoerderungCard erstellen

**Erstelle:** `src/components/dashboard/FoerderungCard.jsx`

```jsx
import { useNavigate } from 'react-router-dom';

const KATEGORIE_ICONS = {
  familie: '👨‍👩‍👧',
  wohnen: '🏠',
  bildung: '📚',
  soziales: '🤝',
  arbeit: '💼'
};

const KATEGORIE_COLORS = {
  familie: 'from-pink-500 to-rose-500',
  wohnen: 'from-green-500 to-emerald-500',
  bildung: 'from-blue-500 to-indigo-500',
  soziales: 'from-purple-500 to-violet-500',
  arbeit: 'from-orange-500 to-amber-500'
};

export default function FoerderungCard({ foerderung, anspruchsDaten }) {
  const navigate = useNavigate();
  const hatAnspruch = anspruchsDaten?.anspruch;
  const betrag = anspruchsDaten?.geschaetzter_betrag || 0;

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-cyan-500 transition-all">
      {/* Header mit Gradient */}
      <div className={`h-2 bg-gradient-to-r ${KATEGORIE_COLORS[foerderung.kategorie] || 'from-gray-500 to-gray-600'}`} />
      
      <div className="p-5">
        {/* Icon & Name */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">{KATEGORIE_ICONS[foerderung.kategorie] || '📋'}</span>
          <h3 className="text-lg font-semibold text-white">{foerderung.name}</h3>
        </div>
        
        {/* Beschreibung */}
        <p className="mt-2 text-gray-400 text-sm line-clamp-2">
          {foerderung.kurzbeschreibung}
        </p>
        
        {/* Anspruch Badge */}
        <div className="mt-4">
          {hatAnspruch ? (
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              ~{betrag}€/Monat möglich
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-gray-700 text-gray-400 px-3 py-1 rounded-full text-sm">
              <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
              Prüfung erforderlich
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <button
          onClick={() => navigate(`/antraege/${foerderung.slug}`)}
          className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
        >
          Details ansehen
        </button>
      </div>
    </div>
  );
}
```

**Status:** ⬜ TODO

---

## 📤 PHASE 4: UPLOAD & KI-AUSFÜLLUNG

### Task 4.1: FileUploader Komponente

**Erstelle:** `src/components/upload/FileUploader.jsx`

```jsx
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../api/supabaseClient';

export default function FileUploader({ onUploadComplete, foerderungId }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      // 1. Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      // 2. Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('dokumente')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      setProgress(50);

      // 3. Create database entry
      const { data: docData, error: docError } = await supabase
        .from('dokumente')
        .insert({
          user_id: user.id,
          foerderung_id: foerderungId,
          dateiname: file.name,
          dateipfad: filePath,
          dateityp: file.type,
          dateigroesse: file.size,
          dokument_typ: 'antrag_leer',
          status: 'hochgeladen'
        })
        .select()
        .single();

      if (docError) throw docError;
      setProgress(100);

      onUploadComplete?.(docData);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Fehler beim Hochladen: ' + error.message);
    } finally {
      setUploading(false);
    }
  }, [foerderungId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-colors
        ${isDragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 hover:border-gray-500'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      {uploading ? (
        <div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
          <p className="text-gray-400">Wird hochgeladen... {progress}%</p>
        </div>
      ) : isDragActive ? (
        <div>
          <p className="text-cyan-400 text-lg">Datei hier ablegen...</p>
        </div>
      ) : (
        <div>
          <div className="text-5xl mb-4">📄</div>
          <p className="text-white text-lg mb-2">
            Antrag hier ablegen oder klicken zum Auswählen
          </p>
          <p className="text-gray-500 text-sm">
            PDF oder Bild (max. 10MB)
          </p>
        </div>
      )}
    </div>
  );
}
```

**Status:** ⬜ TODO

---

### Task 4.2: npm packages installieren

```bash
npm install react-dropzone pdf-lib @react-pdf-viewer/core
```

**Status:** ⬜ TODO

---

## 💬 PHASE 5: KI-CHAT

### Task 5.1: Chat-Komponente

**Erstelle:** `src/components/chat/ChatWindow.jsx`

```jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../api/supabaseClient';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initial-Nachricht
  useEffect(() => {
    setMessages([{
      id: 'welcome',
      rolle: 'assistant',
      inhalt: 'Hallo! Ich bin der Bürokratie-Lotse 🧭\n\nIch helfe dir bei Fragen zu Förderanträgen. Was möchtest du wissen?',
      created_at: new Date().toISOString()
    }]);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    // User message hinzufügen
    const userMessage = {
      id: Date.now(),
      rolle: 'user',
      inhalt: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // TODO: Ersetzen mit echtem KI-Call
      // Simulierte Antwort
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assistantMessage = {
        id: Date.now() + 1,
        rolle: 'assistant',
        inhalt: `Das ist eine gute Frage! Lass mich dir dabei helfen...\n\n(Hier würde die KI-Antwort stehen)`,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-800 rounded-xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold flex items-center gap-2">
          🧭 Bürokratie-Lotse
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </h3>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {loading && (
          <div className="flex gap-2 text-gray-400">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce delay-100">●</span>
            <span className="animate-bounce delay-200">●</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <ChatInput onSend={handleSend} disabled={loading} />
    </div>
  );
}
```

**Status:** ⬜ TODO

---

## ✅ CHECKLISTE ÜBERSICHT

### Phase 1: Grundgerüst ✅ (bereits vorhanden)
- [x] Projekt-Setup (Vite, React, Tailwind)
- [x] Supabase Client
- [x] Auth-System
- [x] Basis-Layout mit Sidebar

### Phase 2: Datenbank
- [ ] Task 2.1: Tabellen erstellen
- [ ] Task 2.2: Förderungen Seed Data
- [ ] Task 2.3: Storage Bucket
- [ ] Task 2.4: OnboardingWizard
- [ ] Task 2.5: Step-Komponenten

### Phase 3: Dashboard
- [ ] Task 3.1: Anspruchsberechnung
- [ ] Task 3.2: AnspruchOverview
- [ ] Task 3.3: FoerderungCard

### Phase 4: Upload
- [ ] Task 4.1: FileUploader
- [ ] Task 4.2: npm packages

### Phase 5: Chat
- [ ] Task 5.1: ChatWindow

---

## 🚀 SO ARBEITEST DU DAMIT

1. **Öffne Visual Studio Code**
2. **Öffne das Projekt:** `File → Open Folder → mimitech-app`
3. **Arbeite Tasks von oben nach unten ab**
4. **Teste nach jedem Task:** `npm run dev`
5. **Hake ab was fertig ist**

---

*Erstellt am 25. November 2025*
*Für: MiMiCheck - Dein digitaler Antragshelfer*
