-- ============================================
-- ANTRÄGE TABELLE
-- ============================================
-- Speichert ausgefüllte Anträge und deren Status

CREATE TABLE IF NOT EXISTS public.antraege (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Antrags-Info
  antrag_id TEXT NOT NULL,
  antrag_name TEXT,
  antrag_category TEXT,
  
  -- Ausgefüllte Daten
  filled_data JSONB NOT NULL DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'filled', 'submitted', 'approved', 'rejected')),
  
  -- Metadata
  pdf_filename TEXT,
  pdf_url TEXT,
  estimated_amount NUMERIC(10, 2),
  eligibility_score INTEGER CHECK (eligibility_score >= 0 AND eligibility_score <= 100),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Index für schnelle User-Abfragen
CREATE INDEX IF NOT EXISTS idx_antraege_user_id ON public.antraege(user_id);
CREATE INDEX IF NOT EXISTS idx_antraege_status ON public.antraege(status);
CREATE INDEX IF NOT EXISTS idx_antraege_antrag_id ON public.antraege(antrag_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.antraege ENABLE ROW LEVEL SECURITY;

-- User kann eigene Anträge sehen
CREATE POLICY "Users can view own antraege"
ON public.antraege
FOR SELECT
USING (auth.uid() = user_id);

-- User kann eigene Anträge erstellen
CREATE POLICY "Users can create own antraege"
ON public.antraege
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- User kann eigene Anträge aktualisieren
CREATE POLICY "Users can update own antraege"
ON public.antraege
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- User kann eigene Anträge löschen
CREATE POLICY "Users can delete own antraege"
ON public.antraege
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER FÜR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_antraege_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER antraege_updated_at
BEFORE UPDATE ON public.antraege
FOR EACH ROW
EXECUTE FUNCTION update_antraege_updated_at();

-- ============================================
-- ANTRAGS-VORLAGEN TABELLE (Optional)
-- ============================================

CREATE TABLE IF NOT EXISTS public.antrag_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template Info
  antrag_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  
  -- Felder Definition
  fields JSONB NOT NULL DEFAULT '[]',
  
  -- Eligibility Kriterien
  eligibility_criteria JSONB DEFAULT '{}',
  
  -- Metadata
  estimated_amount NUMERIC(10, 2),
  processing_time TEXT,
  authority TEXT,
  official_link TEXT,
  pdf_template_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_antrag_templates_category ON public.antrag_templates(category);
CREATE INDEX IF NOT EXISTS idx_antrag_templates_active ON public.antrag_templates(is_active);

-- RLS für Templates (öffentlich lesbar)
ALTER TABLE public.antrag_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are publicly readable"
ON public.antrag_templates
FOR SELECT
USING (is_active = true);

-- Nur Admins können Templates erstellen/bearbeiten
CREATE POLICY "Only admins can manage templates"
ON public.antrag_templates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE auth_id = auth.uid()
    AND role = 'admin'
  )
);

-- ============================================
-- SAMPLE TEMPLATES EINFÜGEN
-- ============================================

INSERT INTO public.antrag_templates (antrag_id, name, category, description, fields, eligibility_criteria, estimated_amount, processing_time, authority, official_link)
VALUES
  (
    'wohngeld',
    'Wohngeld-Antrag',
    'wohnen',
    'Zuschuss zur Miete für Geringverdiener',
    '[
      {"id": "vorname", "label": "Vorname", "type": "text", "required": true},
      {"id": "nachname", "label": "Nachname", "type": "text", "required": true},
      {"id": "geburtsdatum", "label": "Geburtsdatum", "type": "date", "required": true},
      {"id": "strasse", "label": "Straße", "type": "text", "required": true},
      {"id": "hausnummer", "label": "Hausnummer", "type": "text", "required": true},
      {"id": "plz", "label": "PLZ", "type": "text", "required": true},
      {"id": "ort", "label": "Ort", "type": "text", "required": true},
      {"id": "monatliche_miete", "label": "Monatliche Miete (kalt)", "type": "number", "required": true},
      {"id": "wohnflaeche", "label": "Wohnfläche (qm)", "type": "number", "required": true},
      {"id": "haushalt_groesse", "label": "Anzahl Personen im Haushalt", "type": "number", "required": true},
      {"id": "monatliches_einkommen", "label": "Monatliches Nettoeinkommen", "type": "number", "required": true}
    ]'::jsonb,
    '{"maxEinkommen": 2000, "minMiete": 300, "maxMiete": 1500}'::jsonb,
    250.00,
    '4-6 Wochen',
    'Wohngeldstelle',
    'https://www.wohngeld.org'
  ),
  (
    'kindergeld',
    'Kindergeld-Antrag',
    'familie',
    '250€ pro Kind pro Monat',
    '[
      {"id": "vorname", "label": "Vorname", "type": "text", "required": true},
      {"id": "nachname", "label": "Nachname", "type": "text", "required": true},
      {"id": "geburtsdatum", "label": "Geburtsdatum", "type": "date", "required": true},
      {"id": "steuer_id", "label": "Steuer-ID", "type": "text", "required": true},
      {"id": "kinder_anzahl", "label": "Anzahl Kinder", "type": "number", "required": true}
    ]'::jsonb,
    '{"hasChildren": true}'::jsonb,
    250.00,
    '2-4 Wochen',
    'Familienkasse',
    'https://www.arbeitsagentur.de/familie-und-kinder/kindergeld'
  )
ON CONFLICT (antrag_id) DO NOTHING;

-- ============================================
-- VIEWS FÜR STATISTIKEN
-- ============================================

CREATE OR REPLACE VIEW antraege_statistics AS
SELECT
  user_id,
  COUNT(*) as total_antraege,
  COUNT(*) FILTER (WHERE status = 'submitted') as submitted_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  SUM(estimated_amount) FILTER (WHERE status = 'approved') as total_approved_amount,
  MAX(created_at) as last_antrag_date
FROM public.antraege
GROUP BY user_id;

-- ============================================
-- KOMMENTARE
-- ============================================

COMMENT ON TABLE public.antraege IS 'Speichert ausgefüllte Anträge der User';
COMMENT ON TABLE public.antrag_templates IS 'Vorlagen für verschiedene Antragstypen';
COMMENT ON COLUMN public.antraege.filled_data IS 'JSON mit ausgefüllten Feldern';
COMMENT ON COLUMN public.antraege.eligibility_score IS 'Anspruchswahrscheinlichkeit 0-100%';
