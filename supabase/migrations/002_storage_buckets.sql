-- ============================================
-- MIMICHECK STORAGE BUCKETS
-- ============================================
-- Datum: 14.11.2025
-- Beschreibung: Storage Buckets für Datei-Uploads
-- ============================================

-- ============================================
-- 1. STORAGE BUCKETS erstellen
-- ============================================

-- Bucket für Abrechnungen (PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('abrechnungen', 'abrechnungen', false)
ON CONFLICT (id) DO NOTHING;

-- Bucket für Antrags-Dokumente
INSERT INTO storage.buckets (id, name, public)
VALUES ('antraege', 'antraege', false)
ON CONFLICT (id) DO NOTHING;

-- Bucket für Nachweise (z.B. Einkommensnachweise)
INSERT INTO storage.buckets (id, name, public)
VALUES ('nachweise', 'nachweise', false)
ON CONFLICT (id) DO NOTHING;

-- Bucket für Profilbilder (optional, public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. STORAGE POLICIES
-- ============================================

-- ABRECHNUNGEN BUCKET
-- Users können eigene Dateien hochladen
CREATE POLICY "Users can upload own abrechnungen"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'abrechnungen' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users können eigene Dateien lesen
CREATE POLICY "Users can read own abrechnungen"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'abrechnungen' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users können eigene Dateien löschen
CREATE POLICY "Users can delete own abrechnungen"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'abrechnungen' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ANTRÄGE BUCKET
-- Users können eigene Dateien hochladen
CREATE POLICY "Users can upload own antraege"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'antraege' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users können eigene Dateien lesen
CREATE POLICY "Users can read own antraege"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'antraege' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users können eigene Dateien löschen
CREATE POLICY "Users can delete own antraege"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'antraege' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- NACHWEISE BUCKET
-- Users können eigene Dateien hochladen
CREATE POLICY "Users can upload own nachweise"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'nachweise' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users können eigene Dateien lesen
CREATE POLICY "Users can read own nachweise"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'nachweise' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users können eigene Dateien löschen
CREATE POLICY "Users can delete own nachweise"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'nachweise' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- AVATARS BUCKET (Public)
-- Users können eigene Avatare hochladen
CREATE POLICY "Users can upload own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Jeder kann Avatare lesen (public bucket)
CREATE POLICY "Anyone can read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Users können eigene Avatare löschen
CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- FERTIG! 🎉
-- ============================================
