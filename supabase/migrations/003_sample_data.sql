-- ============================================
-- MIMICHECK SAMPLE DATA (Optional)
-- ============================================
-- Datum: 14.11.2025
-- Beschreibung: Beispieldaten für Testing
-- ACHTUNG: Nur für Development/Testing!
-- ============================================

-- ============================================
-- HINWEIS:
-- Diese Datei ist OPTIONAL und sollte NUR
-- in Development-Umgebungen ausgeführt werden!
-- ============================================

-- Beispiel: Förderleistungen (Global, ohne user_id)
-- Diese können allen Usern als Empfehlungen angezeigt werden

INSERT INTO public.foerderleistungen (
  id,
  user_id,
  typ,
  titel,
  beschreibung,
  geschaetzter_betrag,
  zeitraum,
  status,
  berechtigung_wahrscheinlichkeit,
  behoerde,
  voraussetzungen,
  benoetigte_dokumente
) VALUES
  (
    uuid_generate_v4(),
    NULL, -- Global, für alle User
    'wohngeld',
    'Wohngeld',
    'Staatlicher Zuschuss zur Miete für Haushalte mit geringem Einkommen',
    350.00,
    'monatlich',
    'empfohlen',
    75,
    'Wohngeldstelle der Stadt/Gemeinde',
    '["Einkommen unter Grenzwert", "Hauptwohnsitz in Deutschland", "Keine anderen Transferleistungen"]'::jsonb,
    '["Einkommensnachweise", "Mietvertrag", "Personalausweis"]'::jsonb
  ),
  (
    uuid_generate_v4(),
    NULL,
    'kindergeld',
    'Kindergeld',
    'Monatliche Zahlung für jedes Kind bis 18 Jahre (bzw. 25 Jahre bei Ausbildung)',
    250.00,
    'monatlich',
    'empfohlen',
    90,
    'Familienkasse der Bundesagentur für Arbeit',
    '["Kind unter 18 Jahren", "Oder: Kind in Ausbildung bis 25 Jahre", "Wohnsitz in Deutschland"]'::jsonb,
    '["Geburtsurkunde", "Personalausweis", "Ggf. Ausbildungsnachweis"]'::jsonb
  ),
  (
    uuid_generate_v4(),
    NULL,
    'bafoeg',
    'BAföG',
    'Ausbildungsförderung für Schüler und Studenten',
    450.00,
    'monatlich',
    'empfohlen',
    60,
    'BAföG-Amt / Studentenwerk',
    '["In Ausbildung/Studium", "Einkommen der Eltern unter Grenzwert", "Unter 30 Jahre (bzw. 35 bei Master)"]'::jsonb,
    '["Einkommensnachweise der Eltern", "Immatrikulationsbescheinigung", "Personalausweis"]'::jsonb
  ),
  (
    uuid_generate_v4(),
    NULL,
    'energiehilfe',
    'Energiepreispauschale',
    'Einmalige Hilfe zur Entlastung bei gestiegenen Energiekosten',
    300.00,
    'einmalig',
    'empfohlen',
    85,
    'Finanzamt / Arbeitgeber',
    '["Wohnsitz in Deutschland", "Einkommen vorhanden"]'::jsonb,
    '["Steuererklärung", "Oder: Automatisch über Arbeitgeber"]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FERTIG! 🎉
-- ============================================
