-- ============================================
-- MIMICHECK SUPABASE SCHEMA - VOLLSTÄNDIG
-- ============================================
-- Datum: 14.11.2025
-- Version: 1.0
-- Beschreibung: Komplettes Datenbank-Schema für MimiCheck
-- ============================================

-- Extensions aktivieren
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USERS (erweitert Supabase Auth)
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basisdaten
  email TEXT,
  full_name TEXT,
  vorname TEXT,
  nachname TEXT,
  geburtsdatum DATE,
  
  -- Lebenssituation
  wohnart TEXT CHECK (wohnart IN ('miete', 'eigentum', NULL)),
  adresse TEXT,
  plz TEXT,
  stadt TEXT,
  
  -- Onboarding
  profile_completeness INTEGER DEFAULT 0 CHECK (profile_completeness >= 0 AND profile_completeness <= 100),
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  zustimmung BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'premium')),
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'basic', 'premium', 'enterprise')),
  stripe_customer_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_signed_in TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ABRECHNUNGEN (Nebenkostenabrechnungen)
-- ============================================

CREATE TABLE IF NOT EXISTS public.abrechnungen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Grunddaten
  titel TEXT NOT NULL,
  abrechnungszeitraum TEXT,
  adresse TEXT,
  
  -- Finanzielle Daten
  gesamtkosten DECIMAL(10, 2),
  vorauszahlungen DECIMAL(10, 2),
  nachzahlung DECIMAL(10, 2),
  guthaben DECIMAL(10, 2),
  rueckforderung_potential DECIMAL(10, 2) DEFAULT 0,
  
  -- Analyse
  analyse_status TEXT DEFAULT 'wartend' CHECK (analyse_status IN ('wartend', 'in_bearbeitung', 'abgeschlossen', 'fehler')),
  fehler_gefunden INTEGER DEFAULT 0,
  fehler_details JSONB, -- Array von Fehler-Strings
  ai_confidence INTEGER CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  
  -- Positionen (Kostenaufstellung)
  positionen JSONB, -- Array von {name, betrag, umlage, auffaellig}
  
  -- Dokumente
  file_url TEXT,
  file_key TEXT, -- Storage Key
  file_name TEXT,
  file_size INTEGER,
  file_mime_type TEXT,
  
  -- Timestamps
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analysiert_am TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 3. ANSPRUCHSPRÜFUNGEN (Förderprüfungen)
-- ============================================

CREATE TABLE IF NOT EXISTS public.anspruchspruefungen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Grunddaten
  titel TEXT NOT NULL,
  beschreibung TEXT,
  
  -- Status
  status TEXT DEFAULT 'offen' CHECK (status IN ('offen', 'in_pruefung', 'abgeschlossen', 'abgelehnt')),
  
  -- Ergebnis
  ergebnis JSONB, -- {berechtigt: boolean, betrag: number, details: string}
  empfohlene_leistungen JSONB, -- Array von Förderleistung-IDs
  
  -- Timestamps
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  geprueft_am TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 4. FÖRDERLEISTUNGEN (Staatliche Leistungen)
-- ============================================

CREATE TABLE IF NOT EXISTS public.foerderleistungen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Grunddaten
  typ TEXT NOT NULL CHECK (typ IN ('wohngeld', 'kindergeld', 'bafoeg', 'elterngeld', 'buergergeld', 'energiehilfe', 'steuererleichterung', 'sonstige')),
  titel TEXT NOT NULL,
  beschreibung TEXT,
  
  -- Finanzielle Daten
  geschaetzter_betrag DECIMAL(10, 2),
  zeitraum TEXT, -- z.B. "monatlich", "jährlich", "einmalig"
  
  -- Status
  status TEXT DEFAULT 'empfohlen' CHECK (status IN ('empfohlen', 'beantragt', 'bewilligt', 'abgelehnt')),
  berechtigung_wahrscheinlichkeit INTEGER CHECK (berechtigung_wahrscheinlichkeit >= 0 AND berechtigung_wahrscheinlichkeit <= 100),
  
  -- Antragsdaten
  antrag_url TEXT,
  behoerde TEXT,
  voraussetzungen JSONB, -- Array von Voraussetzungen
  benoetigte_dokumente JSONB, -- Array von Dokumenten
  
  -- Timestamps
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  beantragt_am TIMESTAMP WITH TIME ZONE,
  bewilligt_am TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 5. ANTRÄGE (Förderanträge)
-- ============================================

CREATE TABLE IF NOT EXISTS public.antraege (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  foerderleistung_id UUID REFERENCES public.foerderleistungen(id) ON DELETE SET NULL,
  
  -- Grunddaten
  typ TEXT NOT NULL,
  titel TEXT NOT NULL,
  beschreibung TEXT,
  
  -- Status
  status TEXT DEFAULT 'entwurf' CHECK (status IN ('entwurf', 'eingereicht', 'in_bearbeitung', 'bewilligt', 'abgelehnt')),
  
  -- Formulardaten
  formular_daten JSONB, -- Alle ausgefüllten Felder
  ai_vorschlaege JSONB, -- KI-Vorschläge für Felder
  
  -- Dokumente
  dokumente JSONB, -- Array von {url, filename, mimeType}
  
  -- Finanzielle Daten
  geschaetzter_betrag DECIMAL(10, 2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  eingereicht_am TIMESTAMP WITH TIME ZONE,
  bewilligt_am TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 6. DOKUMENTE (File Uploads)
-- ============================================

CREATE TABLE IF NOT EXISTS public.dokumente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Verknüpfungen (optional)
  abrechnung_id UUID REFERENCES public.abrechnungen(id) ON DELETE CASCADE,
  antrag_id UUID REFERENCES public.antraege(id) ON DELETE CASCADE,
  
  -- Datei-Metadaten
  filename TEXT NOT NULL,
  file_key TEXT NOT NULL, -- Storage Key (z.B. "user_123/abrechnung_456.pdf")
  file_url TEXT NOT NULL, -- Public URL
  mime_type TEXT,
  file_size INTEGER, -- in Bytes
  
  -- Typ
  dokument_typ TEXT CHECK (dokument_typ IN ('abrechnung', 'antrag', 'nachweis', 'sonstige')),
  
  -- Timestamps
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. CONTACT REQUESTS (Landing Page)
-- ============================================

CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Kontaktdaten
  name TEXT,
  email TEXT NOT NULL,
  message TEXT,
  
  -- Metadata
  source TEXT DEFAULT 'landing_page',
  status TEXT DEFAULT 'neu' CHECK (status IN ('neu', 'bearbeitet', 'abgeschlossen')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. NOTIFICATIONS (Benachrichtigungen)
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Nachricht
  titel TEXT NOT NULL,
  nachricht TEXT,
  typ TEXT CHECK (typ IN ('info', 'erfolg', 'warnung', 'fehler')),
  
  -- Status
  gelesen BOOLEAN DEFAULT FALSE,
  
  -- Verknüpfung (optional)
  link TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  gelesen_am TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- INDEXES für Performance
-- ============================================

-- User Profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.users(email);

-- Abrechnungen
CREATE INDEX IF NOT EXISTS idx_abrechnungen_user_id ON public.abrechnungen(user_id);
CREATE INDEX IF NOT EXISTS idx_abrechnungen_status ON public.abrechnungen(analyse_status);
CREATE INDEX IF NOT EXISTS idx_abrechnungen_created ON public.abrechnungen(created_date DESC);

-- Anspruchsprüfungen
CREATE INDEX IF NOT EXISTS idx_anspruchspruefungen_user_id ON public.anspruchspruefungen(user_id);
CREATE INDEX IF NOT EXISTS idx_anspruchspruefungen_status ON public.anspruchspruefungen(status);

-- Förderleistungen
CREATE INDEX IF NOT EXISTS idx_foerderleistungen_user_id ON public.foerderleistungen(user_id);
CREATE INDEX IF NOT EXISTS idx_foerderleistungen_typ ON public.foerderleistungen(typ);
CREATE INDEX IF NOT EXISTS idx_foerderleistungen_status ON public.foerderleistungen(status);

-- Anträge
CREATE INDEX IF NOT EXISTS idx_antraege_user_id ON public.antraege(user_id);
CREATE INDEX IF NOT EXISTS idx_antraege_status ON public.antraege(status);
CREATE INDEX IF NOT EXISTS idx_antraege_foerderleistung ON public.antraege(foerderleistung_id);

-- Dokumente
CREATE INDEX IF NOT EXISTS idx_dokumente_user_id ON public.dokumente(user_id);
CREATE INDEX IF NOT EXISTS idx_dokumente_abrechnung ON public.dokumente(abrechnung_id);
CREATE INDEX IF NOT EXISTS idx_dokumente_antrag ON public.dokumente(antrag_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_gelesen ON public.notifications(gelesen);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) aktivieren
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abrechnungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anspruchspruefungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foerderleistungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.antraege ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokumente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- USER PROFILES
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

-- ABRECHNUNGEN
CREATE POLICY "Users can view own abrechnungen"
  ON public.abrechnungen FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own abrechnungen"
  ON public.abrechnungen FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own abrechnungen"
  ON public.abrechnungen FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own abrechnungen"
  ON public.abrechnungen FOR DELETE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- ANSPRUCHSPRÜFUNGEN
CREATE POLICY "Users can view own anspruchspruefungen"
  ON public.anspruchspruefungen FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own anspruchspruefungen"
  ON public.anspruchspruefungen FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own anspruchspruefungen"
  ON public.anspruchspruefungen FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own anspruchspruefungen"
  ON public.anspruchspruefungen FOR DELETE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- FÖRDERLEISTUNGEN
CREATE POLICY "Users can view own foerderleistungen"
  ON public.foerderleistungen FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR user_id IS NULL);

CREATE POLICY "Users can create own foerderleistungen"
  ON public.foerderleistungen FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR user_id IS NULL);

CREATE POLICY "Users can update own foerderleistungen"
  ON public.foerderleistungen FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR user_id IS NULL);

CREATE POLICY "Users can delete own foerderleistungen"
  ON public.foerderleistungen FOR DELETE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- ANTRÄGE
CREATE POLICY "Users can view own antraege"
  ON public.antraege FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own antraege"
  ON public.antraege FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own antraege"
  ON public.antraege FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own antraege"
  ON public.antraege FOR DELETE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- DOKUMENTE
CREATE POLICY "Users can view own dokumente"
  ON public.dokumente FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own dokumente"
  ON public.dokumente FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own dokumente"
  ON public.dokumente FOR DELETE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- CONTACT REQUESTS (Öffentlich schreibbar)
CREATE POLICY "Anyone can create contact requests"
  ON public.contact_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view contact requests"
  ON public.contact_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'));

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: updated_at automatisch aktualisieren
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_abrechnungen_updated_at
  BEFORE UPDATE ON public.abrechnungen
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anspruchspruefungen_updated_at
  BEFORE UPDATE ON public.anspruchspruefungen
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foerderleistungen_updated_at
  BEFORE UPDATE ON public.foerderleistungen
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_antraege_updated_at
  BEFORE UPDATE ON public.antraege
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: User Profile automatisch erstellen
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: User Profile bei Signup erstellen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FERTIG! 🎉
-- ============================================
