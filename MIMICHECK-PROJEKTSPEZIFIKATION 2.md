# 🎯 MiMiCheck - Vollständige Projektspezifikation

> **"Dein digitaler Antragshelfer"**
> 
> Ein KI-gestütztes System, das Nutzern hilft, staatliche Förderanträge zu finden und automatisch auszufüllen.

---

## 📋 INHALTSVERZEICHNIS

1. [Projektübersicht](#1-projektübersicht)
2. [Kernfunktionen](#2-kernfunktionen)
3. [User Flow](#3-user-flow)
4. [Technischer Stack](#4-technischer-stack)
5. [Datenmodelle](#5-datenmodelle)
6. [Seitenstruktur & Komponenten](#6-seitenstruktur--komponenten)
7. [API Endpoints](#7-api-endpoints)
8. [KI-Integration](#8-ki-integration)
9. [Implementierungsreihenfolge](#9-implementierungsreihenfolge)
10. [Dateien & Ordnerstruktur](#10-dateien--ordnerstruktur)

---

## 1. PROJEKTÜBERSICHT

### 1.1 Was ist MiMiCheck?

MiMiCheck ist eine Web-Anwendung, die:
1. **Nutzerdaten erfasst** (Einkommen, Familienstand, Wohnsituation, etc.)
2. **Fördermöglichkeiten analysiert** (Kindergeld, Wohngeld, BAföG, etc.)
3. **Passende Anträge empfiehlt** ("Du hast Anspruch auf X, Y, Z!")
4. **Anträge automatisch ausfüllt** (User lädt leeren Antrag hoch → KI füllt aus)

### 1.2 Zielgruppe

- Deutsche Bürger, die staatliche Förderungen beantragen möchten
- Besonders: Familien, Geringverdiener, Studenten, Rentner

### 1.3 Geschäftsmodell

- **Freemium**: Basis-Analyse kostenlos
- **Premium**: Automatisches Ausfüllen von Anträgen (Abo oder Pay-per-Use)

---

## 2. KERNFUNKTIONEN

### 2.1 Förderantrag-Finder (Anspruchsanalyse)

```
INPUT:  Nutzerdaten (Gehalt, Kinder, Miete, etc.)
OUTPUT: Liste passender Förderungen mit geschätztem Anspruch
```

**Analysierte Förderungen:**
| Förderung | Zielgruppe | Typischer Betrag |
|-----------|------------|------------------|
| Kindergeld | Eltern | 250€/Kind/Monat |
| Kinderzuschlag | Geringverdiener mit Kindern | bis 292€/Kind/Monat |
| Wohngeld | Mieter/Eigentümer mit geringem Einkommen | 100-600€/Monat |
| BAföG | Studenten/Schüler | bis 934€/Monat |
| Elterngeld | Eltern nach Geburt | 65-100% vom Netto |
| Arbeitslosengeld II (Bürgergeld) | Arbeitssuchende | ~563€ + Miete |
| Grundsicherung im Alter | Rentner | ~563€ + Miete |
| Bildung und Teilhabe | Familien mit Kindern | Sachleistungen |
| Lastenzuschuss | Eigentümer | Variable |
| Betreuungsgeld | Eltern | Regional verschieden |

### 2.2 Antrag-Upload & KI-Ausfüllung

```
FLOW:
1. User wählt Förderung aus empfohlener Liste
2. User besorgt leeren Antrag (Download-Link oder selbst scannen)
3. User lädt Antrag als PDF/Bild hoch
4. KI erkennt Formularfelder (OCR + Layout-Analyse)
5. KI füllt Felder mit gespeicherten Nutzerdaten aus
6. User überprüft & lädt ausgefüllten Antrag herunter
```

### 2.3 KI-Chat "Bürokratie-Lotse"

- Beantwortet Fragen zu Förderungen
- Erklärt Antragsverfahren
- Hilft bei Unklarheiten
- 24/7 verfügbar

### 2.4 Dokumenten-Verwaltung

- Hochgeladene Anträge speichern
- Ausgefüllte Anträge archivieren
- Status-Tracking (Eingereicht, In Bearbeitung, Bewilligt)

---

## 3. USER FLOW

### 3.1 Haupt-Flow (Happy Path)

```
┌─────────────────────────────────────────────────────────────────┐
│  1. LANDING PAGE                                                │
│     → User sieht Vorteile, klickt "Jetzt starten"              │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. REGISTRIERUNG / LOGIN                                       │
│     → Email + Passwort oder Social Login                        │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. ONBOARDING (Datenerfassung)                                 │
│     Schritt 1: Persönliche Daten (Name, Geburtsdatum, etc.)    │
│     Schritt 2: Familiensituation (Kinder, Partner)             │
│     Schritt 3: Einkommenssituation (Gehalt, Nebenjobs)         │
│     Schritt 4: Wohnsituation (Miete/Eigentum, Kosten)          │
│     Schritt 5: Besondere Umstände (Behinderung, Pflege)        │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. DASHBOARD                                                   │
│     → Übersicht: "Du hast Anspruch auf ca. X€/Monat"           │
│     → Liste empfohlener Förderungen mit Beträgen               │
│     → Quick Actions: "Jetzt Antrag ausfüllen"                  │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. FÖRDERUNG AUSWÄHLEN                                         │
│     → User klickt auf z.B. "Wohngeld"                          │
│     → Detailseite: Erklärung, Voraussetzungen, geschätzter     │
│       Betrag, nächste Schritte                                  │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. ANTRAG HOCHLADEN                                            │
│     Option A: Download-Link zum offiziellen Antrag             │
│     Option B: User scannt/fotografiert eigenen Antrag          │
│     → Upload als PDF oder Bild                                  │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. KI FÜLLT ANTRAG AUS                                         │
│     → OCR erkennt Formularfelder                               │
│     → KI mappt Nutzerdaten auf Felder                          │
│     → Preview: User sieht ausgefüllten Antrag                  │
│     → User kann manuell korrigieren                            │
└────────────────────────┬────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  8. DOWNLOAD & EINREICHEN                                       │
│     → User lädt ausgefüllten Antrag als PDF herunter           │
│     → Anleitung: "So reichst du den Antrag ein"                │
│     → Optional: Erinnerung für Nachverfolgung                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Seitenübersicht

| Route | Seite | Auth? | Beschreibung |
|-------|-------|-------|--------------|
| `/` | Home | Nein | Startseite mit CTA |
| `/auth` | Auth | Nein | Login/Registrierung |
| `/onboarding` | Onboarding | Ja | 5-Schritte Datenerfassung |
| `/dashboard` | Dashboard | Ja | Übersicht & Empfehlungen |
| `/anspruchsanalyse` | Analyse | Ja | Detaillierte Förder-Analyse |
| `/antraege` | Anträge | Ja | Liste aller Förderungen |
| `/antraege/:id` | Antrag-Detail | Ja | Einzelne Förderung |
| `/upload` | Upload | Ja | Antrag hochladen |
| `/ausfuellen/:id` | Ausfüllen | Ja | KI füllt Antrag aus |
| `/abrechnungen` | Dokumente | Ja | Gespeicherte Dokumente |
| `/chat` | KI-Chat | Ja | Bürokratie-Lotse |
| `/kontakt` | Kontakt | Nein | Support & Kontakt |
| `/pricing` | Preise | Nein | Abo-Modelle |
| `/impressum` | Impressum | Nein | Rechtliches |
| `/datenschutz` | Datenschutz | Nein | DSGVO |

---

## 4. TECHNISCHER STACK

### 4.1 Frontend

```
Framework:     React 18
Build Tool:    Vite 6
Routing:       React Router DOM 7
Styling:       Tailwind CSS 3.4
Forms:         React Hook Form
State:         React Context / Zustand
Internationalisierung: react-i18next
```

### 4.2 Backend & Datenbank

```
Backend:       Supabase (BaaS)
Datenbank:     PostgreSQL (via Supabase)
Auth:          Supabase Auth
Storage:       Supabase Storage (für PDFs/Bilder)
Realtime:      Supabase Realtime (für Chat)
```

### 4.3 KI-Services

```
LLM:           OpenAI GPT-4 / Anthropic Claude
OCR:           Google Cloud Vision / AWS Textract
PDF:           pdf-lib / PDF.js
Formular:      Eigenes Mapping-System
```

### 4.4 Hosting

```
Frontend:      Vercel / Netlify
Backend:       Supabase Cloud
Domain:        mimitechai.com (aus Screenshot)
```

---

## 5. DATENMODELLE

### 5.1 Supabase Tabellen

```sql
-- =============================================
-- USERS (wird von Supabase Auth verwaltet)
-- =============================================
-- auth.users ist automatisch vorhanden

-- =============================================
-- USER PROFILES (Erweiterte Nutzerdaten)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Persönliche Daten
  vorname TEXT,
  nachname TEXT,
  geburtsdatum DATE,
  geschlecht TEXT, -- 'männlich', 'weiblich', 'divers'
  staatsangehoerigkeit TEXT DEFAULT 'deutsch',
  steuer_id TEXT,
  
  -- Adresse
  strasse TEXT,
  hausnummer TEXT,
  plz TEXT,
  ort TEXT,
  bundesland TEXT,
  
  -- Kontakt
  telefon TEXT,
  
  -- Familienstand
  familienstand TEXT, -- 'ledig', 'verheiratet', 'geschieden', 'verwitwet'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0
);

-- =============================================
-- KINDER (Haushaltsmitglieder unter 25)
-- =============================================
CREATE TABLE kinder (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  vorname TEXT NOT NULL,
  nachname TEXT,
  geburtsdatum DATE NOT NULL,
  
  -- Status
  lebt_im_haushalt BOOLEAN DEFAULT TRUE,
  in_ausbildung BOOLEAN DEFAULT FALSE,
  eigenes_einkommen DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PARTNER (Ehepartner/Lebenspartner)
-- =============================================
CREATE TABLE partner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  vorname TEXT,
  nachname TEXT,
  geburtsdatum DATE,
  
  -- Einkommen
  brutto_einkommen DECIMAL(10,2) DEFAULT 0,
  netto_einkommen DECIMAL(10,2) DEFAULT 0,
  beschaeftigungsart TEXT, -- 'angestellt', 'selbststaendig', 'arbeitslos', 'rentner'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- EINKOMMEN (Alle Einkommensquellen)
-- =============================================
CREATE TABLE einkommen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Haupteinkommen
  beschaeftigungsart TEXT, -- 'angestellt', 'selbststaendig', 'arbeitslos', 'rentner', 'student'
  brutto_monatlich DECIMAL(10,2) DEFAULT 0,
  netto_monatlich DECIMAL(10,2) DEFAULT 0,
  arbeitgeber TEXT,
  
  -- Nebeneinkommen
  nebenjob_brutto DECIMAL(10,2) DEFAULT 0,
  
  -- Sonstige Einkünfte
  kindergeld DECIMAL(10,2) DEFAULT 0,
  unterhalt DECIMAL(10,2) DEFAULT 0,
  rente DECIMAL(10,2) DEFAULT 0,
  kapitalertraege DECIMAL(10,2) DEFAULT 0,
  sonstige_einkuenfte DECIMAL(10,2) DEFAULT 0,
  
  -- Steuerklasse
  steuerklasse INTEGER, -- 1-6
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WOHNSITUATION
-- =============================================
CREATE TABLE wohnsituation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Art
  wohnart TEXT, -- 'miete', 'eigentum', 'wohnrecht'
  
  -- Kosten
  kaltmiete DECIMAL(10,2) DEFAULT 0,
  nebenkosten DECIMAL(10,2) DEFAULT 0,
  heizkosten DECIMAL(10,2) DEFAULT 0,
  warmmiete_gesamt DECIMAL(10,2) DEFAULT 0,
  
  -- Details
  wohnflaeche INTEGER, -- in qm
  anzahl_zimmer INTEGER,
  anzahl_personen INTEGER,
  
  -- Bei Eigentum
  kreditrate DECIMAL(10,2) DEFAULT 0,
  grundsteuer DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BESONDERE UMSTÄNDE
-- =============================================
CREATE TABLE besondere_umstaende (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Behinderung
  schwerbehinderung BOOLEAN DEFAULT FALSE,
  grad_der_behinderung INTEGER, -- 0-100
  merkzeichen TEXT[], -- ['G', 'aG', 'H', 'Bl', etc.]
  
  -- Pflege
  pflegegrad INTEGER, -- 0-5
  pflegeperson BOOLEAN DEFAULT FALSE,
  
  -- Sonstiges
  alleinerziehend BOOLEAN DEFAULT FALSE,
  schwanger BOOLEAN DEFAULT FALSE,
  chronisch_krank BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FÖRDERUNGEN (Katalog aller Förderungen)
-- =============================================
CREATE TABLE foerderungen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basis-Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  kurzbeschreibung TEXT,
  langbeschreibung TEXT,
  
  -- Kategorisierung
  kategorie TEXT, -- 'familie', 'wohnen', 'bildung', 'soziales', 'arbeit'
  
  -- Antragsinfos
  zustaendige_behoerde TEXT,
  antrag_url TEXT, -- Link zum offiziellen Formular
  antrag_formular_id TEXT, -- ID für unser Formular-Mapping
  
  -- Voraussetzungen (als JSON für Flexibilität)
  voraussetzungen JSONB,
  
  -- Status
  aktiv BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER FÖRDERUNGEN (Empfehlungen pro User)
-- =============================================
CREATE TABLE user_foerderungen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  foerderung_id UUID REFERENCES foerderungen(id) ON DELETE CASCADE,
  
  -- Analyse-Ergebnisse
  anspruch_wahrscheinlich BOOLEAN DEFAULT FALSE,
  geschaetzter_betrag DECIMAL(10,2),
  berechnung_details JSONB,
  
  -- Status
  status TEXT DEFAULT 'empfohlen', -- 'empfohlen', 'interessiert', 'antrag_gestartet', 'eingereicht', 'bewilligt', 'abgelehnt'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, foerderung_id)
);

-- =============================================
-- DOKUMENTE (Hochgeladene & generierte PDFs)
-- =============================================
CREATE TABLE dokumente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  foerderung_id UUID REFERENCES foerderungen(id),
  
  -- Datei-Info
  dateiname TEXT NOT NULL,
  dateipfad TEXT NOT NULL, -- Supabase Storage Pfad
  dateityp TEXT, -- 'pdf', 'jpg', 'png'
  dateigroesse INTEGER,
  
  -- Typ
  dokument_typ TEXT, -- 'antrag_leer', 'antrag_ausgefuellt', 'nachweis', 'bescheid'
  
  -- KI-Verarbeitung
  ocr_text TEXT,
  erkannte_felder JSONB,
  ausgefuellte_felder JSONB,
  
  -- Status
  status TEXT DEFAULT 'hochgeladen', -- 'hochgeladen', 'verarbeitet', 'ausgefuellt', 'fehlgeschlagen'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CHAT NACHRICHTEN (Bürokratie-Lotse)
-- =============================================
CREATE TABLE chat_nachrichten (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Nachricht
  rolle TEXT NOT NULL, -- 'user', 'assistant'
  inhalt TEXT NOT NULL,
  
  -- Kontext
  foerderung_id UUID REFERENCES foerderungen(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES für Performance
-- =============================================
CREATE INDEX idx_profiles_user ON profiles(id);
CREATE INDEX idx_kinder_user ON kinder(user_id);
CREATE INDEX idx_einkommen_user ON einkommen(user_id);
CREATE INDEX idx_user_foerderungen_user ON user_foerderungen(user_id);
CREATE INDEX idx_dokumente_user ON dokumente(user_id);
CREATE INDEX idx_chat_user ON chat_nachrichten(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kinder ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner ENABLE ROW LEVEL SECURITY;
ALTER TABLE einkommen ENABLE ROW LEVEL SECURITY;
ALTER TABLE wohnsituation ENABLE ROW LEVEL SECURITY;
ALTER TABLE besondere_umstaende ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_foerderungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokumente ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_nachrichten ENABLE ROW LEVEL SECURITY;

-- User kann nur eigene Daten sehen
CREATE POLICY "Users can view own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own kinder" ON kinder
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own partner" ON partner
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own einkommen" ON einkommen
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wohnsituation" ON wohnsituation
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own besondere_umstaende" ON besondere_umstaende
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own user_foerderungen" ON user_foerderungen
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own dokumente" ON dokumente
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat" ON chat_nachrichten
  FOR ALL USING (auth.uid() = user_id);

-- Förderungen sind öffentlich lesbar
CREATE POLICY "Foerderungen are public" ON foerderungen
  FOR SELECT USING (true);
```

### 5.2 Förderungen Seed Data

```sql
-- Basis-Förderungen einfügen
INSERT INTO foerderungen (name, slug, kurzbeschreibung, kategorie, zustaendige_behoerde, voraussetzungen) VALUES

('Kindergeld', 'kindergeld', 
 'Monatliche Zahlung für jedes Kind bis 25 Jahre',
 'familie',
 'Familienkasse der Bundesagentur für Arbeit',
 '{"max_alter_kind": 25, "kind_in_ausbildung_oder_unter_18": true}'
),

('Kinderzuschlag', 'kinderzuschlag',
 'Zusätzliche Unterstützung für Familien mit geringem Einkommen',
 'familie',
 'Familienkasse der Bundesagentur für Arbeit',
 '{"min_einkommen": 900, "max_einkommen": "bedarfsabhaengig", "kinder_unter_25": true}'
),

('Wohngeld', 'wohngeld',
 'Zuschuss zu den Wohnkosten für Haushalte mit geringem Einkommen',
 'wohnen',
 'Wohngeldstelle der Stadt/Gemeinde',
 '{"max_einkommen": "nach_tabelle", "keine_transferleistungen": true}'
),

('Bürgergeld', 'buergergeld',
 'Grundsicherung für Arbeitssuchende',
 'soziales',
 'Jobcenter',
 '{"erwerbsfaehig": true, "hilfebeduerfttig": true}'
),

('BAföG', 'bafoeg',
 'Ausbildungsförderung für Studenten und Schüler',
 'bildung',
 'BAföG-Amt / Studentenwerk',
 '{"in_ausbildung": true, "max_alter": 45, "erstausbildung": true}'
),

('Elterngeld', 'elterngeld',
 '65-100% des Nettoeinkommens nach Geburt eines Kindes',
 'familie',
 'Elterngeldstelle des Bundeslandes',
 '{"kind_unter_14_monate": true, "erwerbstaetigkeit_reduziert": true}'
),

('Grundsicherung im Alter', 'grundsicherung-alter',
 'Unterstützung für Rentner mit geringem Einkommen',
 'soziales',
 'Sozialamt',
 '{"min_alter": 65, "rente_unter_bedarf": true}'
),

('Bildung und Teilhabe', 'bildung-teilhabe',
 'Unterstützung für Schulbedarf, Ausflüge, Mittagessen',
 'bildung',
 'Jobcenter oder Sozialamt',
 '{"transferleistungen_bezug": true, "kinder_unter_25": true}'
),

('Lastenzuschuss', 'lastenzuschuss',
 'Wohngeld für Eigentümer',
 'wohnen',
 'Wohngeldstelle',
 '{"eigentum": true, "selbst_bewohnt": true, "max_einkommen": "nach_tabelle"}'
),

('Unterhaltsvorschuss', 'unterhaltsvorschuss',
 'Staatliche Unterhaltszahlung wenn ein Elternteil nicht zahlt',
 'familie',
 'Jugendamt',
 '{"alleinerziehend": true, "kein_oder_wenig_unterhalt": true, "kind_unter_18": true}'
);
```

---

## 6. SEITENSTRUKTUR & KOMPONENTEN

### 6.1 Ordnerstruktur

```
src/
├── api/
│   ├── supabaseClient.js      # Supabase Initialisierung
│   ├── foerderungen.js        # Förderungs-API Calls
│   ├── profile.js             # Profil-API Calls
│   ├── dokumente.js           # Dokumenten-API Calls
│   └── ai.js                  # KI-Service Calls
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx        # Hauptnavigation
│   │   ├── Header.jsx         # Top Bar
│   │   ├── Footer.jsx         # Footer
│   │   └── Layout.jsx         # Wrapper mit Sidebar
│   │
│   ├── auth/
│   │   ├── LoginForm.jsx      # Login Formular
│   │   ├── RegisterForm.jsx   # Registrierung
│   │   ├── ProtectedRoute.jsx # Route Guard
│   │   └── AuthProvider.jsx   # Auth Context
│   │
│   ├── onboarding/
│   │   ├── OnboardingWizard.jsx     # Wizard Container
│   │   ├── StepPersoenlich.jsx      # Schritt 1
│   │   ├── StepFamilie.jsx          # Schritt 2
│   │   ├── StepEinkommen.jsx        # Schritt 3
│   │   ├── StepWohnung.jsx          # Schritt 4
│   │   ├── StepBesonderes.jsx       # Schritt 5
│   │   └── ProgressBar.jsx          # Fortschrittsanzeige
│   │
│   ├── dashboard/
│   │   ├── AnspruchOverview.jsx     # Gesamt-Übersicht
│   │   ├── FoerderungCard.jsx       # Einzelne Förderung
│   │   ├── FoerderungListe.jsx      # Liste aller Empfehlungen
│   │   └── QuickActions.jsx         # Schnellaktionen
│   │
│   ├── foerderungen/
│   │   ├── FoerderungDetail.jsx     # Detailseite
│   │   ├── Voraussetzungen.jsx      # Anforderungsliste
│   │   ├── BetragsRechner.jsx       # Geschätzter Betrag
│   │   └── AntragStarten.jsx        # CTA Button
│   │
│   ├── upload/
│   │   ├── FileUploader.jsx         # Drag & Drop Upload
│   │   ├── UploadPreview.jsx        # Vorschau
│   │   ├── OCRStatus.jsx            # Verarbeitungsstatus
│   │   └── FormularMapping.jsx      # Feld-Zuordnung
│   │
│   ├── ausfuellen/
│   │   ├── PDFViewer.jsx            # PDF Anzeige
│   │   ├── FeldEditor.jsx           # Feld bearbeiten
│   │   ├── AutofillStatus.jsx       # KI-Ausfüllstatus
│   │   └── DownloadButton.jsx       # PDF Download
│   │
│   ├── chat/
│   │   ├── ChatWindow.jsx           # Chat Container
│   │   ├── ChatMessage.jsx          # Einzelne Nachricht
│   │   ├── ChatInput.jsx            # Eingabefeld
│   │   └── ChatWidget.jsx           # Floating Widget
│   │
│   └── ui/                          # Basis-Komponenten
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Card.jsx
│       ├── Modal.jsx
│       ├── Toast.jsx
│       ├── Spinner.jsx
│       └── ...
│
├── pages/
│   ├── index.jsx              # Router Setup
│   ├── Home.jsx               # Startseite
│   ├── Auth.jsx               # Login/Register
│   ├── AuthBridge.jsx         # Token Handler
│   ├── Onboarding.jsx         # Onboarding Flow
│   ├── Dashboard.jsx          # Haupt-Dashboard
│   ├── Anspruchsanalyse.jsx   # Detaillierte Analyse
│   ├── Antraege.jsx           # Förderungsliste
│   ├── AntragDetail.jsx       # Einzelne Förderung
│   ├── Upload.jsx             # Antrag hochladen
│   ├── Ausfuellen.jsx         # KI füllt aus
│   ├── Abrechnungen.jsx       # Dokumente
│   ├── Chat.jsx               # Bürokratie-Lotse
│   ├── Kontakt.jsx            # Kontakt & Support
│   ├── Pricing.jsx            # Preise
│   ├── Impressum.jsx          # Impressum
│   └── Datenschutz.jsx        # Datenschutz
│
├── hooks/
│   ├── useAuth.js             # Auth State Hook
│   ├── useProfile.js          # Profil Daten Hook
│   ├── useFoerderungen.js     # Förderungen Hook
│   ├── useUpload.js           # Upload Hook
│   └── useChat.js             # Chat Hook
│
├── utils/
│   ├── anspruchsberechnung.js # Förder-Logik
│   ├── formatters.js          # Währung, Datum etc.
│   ├── validators.js          # Formular-Validierung
│   └── pdfUtils.js            # PDF Helfer
│
├── contexts/
│   ├── AuthContext.jsx        # Auth State
│   └── ProfileContext.jsx     # User Daten
│
└── styles/
    └── globals.css            # Tailwind + Custom CSS
```

### 6.2 Komponenten-Details

#### Sidebar.jsx
```jsx
const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Upload, label: 'Upload', path: '/upload' },
  { icon: FileText, label: 'Abrechnungen', path: '/abrechnungen' },
  { icon: ClipboardList, label: 'Anträge', path: '/antraege' },
  { icon: HelpCircle, label: 'Kontakt', path: '/kontakt' },
];
```

#### Dashboard Cards
```jsx
// Beispiel: FoerderungCard.jsx
<Card>
  <CardHeader>
    <Icon name={foerderung.kategorie} />
    <h3>{foerderung.name}</h3>
  </CardHeader>
  <CardBody>
    <p>{foerderung.kurzbeschreibung}</p>
    <Badge color={anspruch ? 'green' : 'gray'}>
      {anspruch ? `~${betrag}€/Monat` : 'Kein Anspruch'}
    </Badge>
  </CardBody>
  <CardFooter>
    <Button onClick={() => navigate(`/antraege/${foerderung.slug}`)}>
      Details ansehen
    </Button>
  </CardFooter>
</Card>
```

---

## 7. API ENDPOINTS

### 7.1 Supabase Queries (Frontend)

```javascript
// ===== PROFIL =====

// Profil laden
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Profil aktualisieren
const { error } = await supabase
  .from('profiles')
  .update({ vorname, nachname, ... })
  .eq('id', userId);

// ===== KINDER =====

// Kinder laden
const { data: kinder } = await supabase
  .from('kinder')
  .select('*')
  .eq('user_id', userId);

// Kind hinzufügen
const { error } = await supabase
  .from('kinder')
  .insert({ user_id: userId, vorname, geburtsdatum });

// ===== FÖRDERUNGEN =====

// Alle Förderungen laden
const { data: foerderungen } = await supabase
  .from('foerderungen')
  .select('*')
  .eq('aktiv', true);

// User-Empfehlungen laden
const { data: empfehlungen } = await supabase
  .from('user_foerderungen')
  .select(`
    *,
    foerderung:foerderungen(*)
  `)
  .eq('user_id', userId);

// ===== DOKUMENTE =====

// Dokument hochladen
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('dokumente')
  .upload(`${userId}/${filename}`, file);

// Dokument-Eintrag erstellen
const { error } = await supabase
  .from('dokumente')
  .insert({
    user_id: userId,
    dateiname: filename,
    dateipfad: uploadData.path,
    dateityp: file.type,
    dokument_typ: 'antrag_leer'
  });

// ===== CHAT =====

// Nachrichten laden
const { data: messages } = await supabase
  .from('chat_nachrichten')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: true });

// Nachricht senden
const { error } = await supabase
  .from('chat_nachrichten')
  .insert({ user_id: userId, rolle: 'user', inhalt: message });
```

### 7.2 Edge Functions (Backend-Logik)

```javascript
// supabase/functions/analyse-anspruch/index.ts
// Analysiert Nutzerdaten und berechnet Förder-Ansprüche

// supabase/functions/ocr-antrag/index.ts
// Sendet PDF an OCR-Service, extrahiert Felder

// supabase/functions/ausfuellen-antrag/index.ts
// Füllt PDF mit Nutzerdaten aus

// supabase/functions/chat-response/index.ts
// Generiert KI-Antworten für Bürokratie-Lotse
```

---

## 8. KI-INTEGRATION

### 8.1 Anspruchs-Analyse Logik

```javascript
// utils/anspruchsberechnung.js

export function berechneAnsprueche(userData) {
  const { profile, einkommen, kinder, wohnung, umstaende } = userData;
  const ergebnisse = [];

  // === KINDERGELD ===
  const kindergeldKinder = kinder.filter(k => {
    const alter = berechneAlter(k.geburtsdatum);
    return alter < 18 || (alter < 25 && k.in_ausbildung);
  });
  
  if (kindergeldKinder.length > 0) {
    ergebnisse.push({
      foerderung: 'kindergeld',
      anspruch: true,
      betrag: kindergeldKinder.length * 250,
      details: `${kindergeldKinder.length} Kind(er) berechtigt`
    });
  }

  // === KINDERZUSCHLAG ===
  const haushaltEinkommen = einkommen.netto_monatlich + (partner?.netto_einkommen || 0);
  if (kinder.length > 0 && haushaltEinkommen >= 900 && haushaltEinkommen < 4000) {
    ergebnisse.push({
      foerderung: 'kinderzuschlag',
      anspruch: true,
      betrag: kinder.length * 250, // Vereinfacht
      details: 'Einkommen im förderfähigen Bereich'
    });
  }

  // === WOHNGELD ===
  const wohngeldGrenze = berechneWohngeldGrenze(wohnung.anzahl_personen, wohnung.ort);
  if (haushaltEinkommen < wohngeldGrenze) {
    const wohngeldBetrag = berechneWohngeld(haushaltEinkommen, wohnung);
    ergebnisse.push({
      foerderung: 'wohngeld',
      anspruch: true,
      betrag: wohngeldBetrag,
      details: `Geschätzt basierend auf ${wohnung.warmmiete_gesamt}€ Warmmiete`
    });
  }

  // ... weitere Förderungen

  return ergebnisse;
}
```

### 8.2 OCR & Formular-Ausfüllung

```javascript
// api/ai.js

// OCR: Antrag analysieren
export async function analyseAntrag(fileUrl) {
  const response = await fetch('/api/ocr-antrag', {
    method: 'POST',
    body: JSON.stringify({ fileUrl })
  });
  
  return response.json();
  // Returns: { felder: [{ name: 'vorname', position: {...}, type: 'text' }, ...] }
}

// PDF ausfüllen
export async function fuelleAntragAus(dokumentId, felder) {
  const response = await fetch('/api/ausfuellen-antrag', {
    method: 'POST',
    body: JSON.stringify({ dokumentId, felder })
  });
  
  return response.json();
  // Returns: { ausgefuelltesPdf: 'url-zum-pdf' }
}
```

### 8.3 Chat-System (Bürokratie-Lotse)

```javascript
// api/chat.js

export async function sendeChatNachricht(nachricht, kontext) {
  const systemPrompt = `
    Du bist der "Bürokratie-Lotse" von MiMiCheck.
    Du hilfst Nutzern bei Fragen zu deutschen Sozialleistungen und Förderanträgen.
    
    Nutzer-Kontext:
    - Einkommen: ${kontext.einkommen}€/Monat
    - Kinder: ${kontext.anzahlKinder}
    - Wohnsituation: ${kontext.wohnart}
    
    Antworte freundlich, präzise und auf Deutsch.
    Verweise bei komplexen Fragen an offizielle Stellen.
  `;

  const response = await fetch('/api/chat-response', {
    method: 'POST',
    body: JSON.stringify({
      systemPrompt,
      userMessage: nachricht,
      history: kontext.chatHistory
    })
  });

  return response.json();
}
```

---

## 9. IMPLEMENTIERUNGSREIHENFOLGE

### Phase 1: Grundgerüst (Woche 1-2)

```
✅ Schritt 1.1: Projekt-Setup
   - Vite + React Setup
   - Tailwind CSS
   - Supabase Client
   - Routing

✅ Schritt 1.2: Auth-System
   - Login/Register Pages
   - Supabase Auth Integration
   - Protected Routes
   - AuthBridge (von Landing Page)

✅ Schritt 1.3: Basis-Layout
   - Sidebar Navigation
   - Header
   - Responsive Design
```

### Phase 2: Datenerfassung (Woche 3-4)

```
⬜ Schritt 2.1: Datenbank-Schema
   - Supabase Tabellen erstellen
   - RLS Policies
   - Seed Data (Förderungen)

⬜ Schritt 2.2: Onboarding-Wizard
   - 5-Schritte-Formular
   - React Hook Form Integration
   - Validierung
   - Daten speichern

⬜ Schritt 2.3: Profil-Verwaltung
   - Daten anzeigen
   - Daten bearbeiten
   - Kinder/Partner verwalten
```

### Phase 3: Förderungs-Analyse (Woche 5-6)

```
⬜ Schritt 3.1: Analyse-Logik
   - Anspruchsberechnung implementieren
   - Alle Förderungen abdecken
   - Unit Tests

⬜ Schritt 3.2: Dashboard
   - Übersicht-Karten
   - Empfehlungsliste
   - Geschätzte Beträge

⬜ Schritt 3.3: Förderungs-Details
   - Einzelseiten pro Förderung
   - Voraussetzungen-Check
   - Antragslinks
```

### Phase 4: Antrag-Ausfüllung (Woche 7-9)

```
⬜ Schritt 4.1: Upload-System
   - Drag & Drop
   - Supabase Storage
   - PDF/Bild Preview

⬜ Schritt 4.2: OCR-Integration
   - Google Vision / AWS Textract
   - Feld-Erkennung
   - Mapping-System

⬜ Schritt 4.3: PDF-Ausfüllung
   - pdf-lib Integration
   - Feld-Editor
   - Download generierter PDFs
```

### Phase 5: KI-Chat (Woche 10)

```
⬜ Schritt 5.1: Chat-Interface
   - Chat-Window
   - Message-History
   - Typing Indicator

⬜ Schritt 5.2: KI-Backend
   - OpenAI/Claude Integration
   - System-Prompts
   - Kontext-Handling
```

### Phase 6: Polish & Launch (Woche 11-12)

```
⬜ Schritt 6.1: UI/UX Polish
   - Animationen
   - Loading States
   - Error Handling

⬜ Schritt 6.2: Testing
   - E2E Tests
   - Edge Cases
   - Sicherheit

⬜ Schritt 6.3: Deployment
   - Vercel Setup
   - Domain
   - Monitoring
```

---

## 10. DATEIEN & ORDNERSTRUKTUR

### 10.1 Finale Struktur

```
mimitech-app/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── api/
│   │   ├── supabaseClient.js
│   │   ├── foerderungen.js
│   │   ├── profile.js
│   │   ├── dokumente.js
│   │   └── ai.js
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── dashboard/
│   │   ├── foerderungen/
│   │   ├── upload/
│   │   ├── ausfuellen/
│   │   ├── chat/
│   │   └── ui/
│   │
│   ├── pages/
│   │   └── [alle Seiten]
│   │
│   ├── hooks/
│   ├── utils/
│   ├── contexts/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── functions/
│   │   ├── analyse-anspruch/
│   │   ├── ocr-antrag/
│   │   ├── ausfuellen-antrag/
│   │   └── chat-response/
│   └── config.toml
│
├── .env
├── .env.local
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

### 10.2 Environment Variables

```bash
# .env.local

# Supabase
VITE_SUPABASE_URL=https://yjjauvmjyhlxcoumwqlj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# App URLs
VITE_APP_URL=http://localhost:8005
VITE_LANDING_URL=http://localhost:3000/landing

# KI Services (für Edge Functions)
OPENAI_API_KEY=sk-...
# oder
ANTHROPIC_API_KEY=sk-ant-...

# OCR Service
GOOGLE_VISION_API_KEY=...
# oder
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

---

## 📌 ZUSAMMENFASSUNG

**MiMiCheck** ist ein KI-gestützter Förderantrag-Helfer mit folgenden Hauptfunktionen:

1. **Datenerfassung**: User gibt persönliche/finanzielle Daten ein
2. **Analyse**: System berechnet Anspruch auf 10+ Förderungen
3. **Empfehlung**: User sieht "Du kannst X€/Monat bekommen"
4. **Antragsausfüllung**: User lädt Antrag hoch, KI füllt aus
5. **KI-Chat**: Bürokratie-Lotse beantwortet Fragen

**Tech-Stack**: React + Vite + Tailwind + Supabase + OpenAI/Claude

**Nächste Schritte**: Phase 2 starten → Datenbank-Schema + Onboarding-Wizard

---

*Erstellt für Visual Studio Code - Folge dieser Spezifikation Schritt für Schritt!*
