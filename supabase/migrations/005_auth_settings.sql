-- =====================================================
-- Migration: Auth Settings für automatische Bestätigung
-- =====================================================

-- Auth Config für lokale Entwicklung
-- WICHTIG: Diese Settings nur für Development verwenden!

-- Deaktiviere Email-Bestätigung für neue User
ALTER TABLE auth.users 
ALTER COLUMN email_confirmed_at 
SET DEFAULT now();

-- Funktion für automatische Email-Bestätigung
CREATE OR REPLACE FUNCTION auth.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatisch Email bestätigen
  NEW.email_confirmed_at = now();
  NEW.confirmed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für neue User
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.auto_confirm_email();

-- Update existing users to be confirmed
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmed_at = COALESCE(confirmed_at, now())
WHERE email_confirmed_at IS NULL;

-- Auth Session Settings
-- Erhöhe Session-Dauer für Development
UPDATE auth.config
SET 
  jwt_exp = 7200, -- 2 Stunden statt 1 Stunde
  refresh_token_rotation_enabled = false,
  security_captcha_enabled = false
WHERE id = 1;

-- Vereinfachte Password Policy für Development
INSERT INTO auth.config (id, site_url, jwt_exp, refresh_token_rotation_enabled, security_captcha_enabled)
VALUES (1, 'http://localhost:8005', 7200, false, false)
ON CONFLICT (id) DO UPDATE
SET 
  site_url = 'http://localhost:8005',
  jwt_exp = 7200,
  refresh_token_rotation_enabled = false,
  security_captcha_enabled = false;

-- Grant permissions für Public Access (nur Development!)
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated;

-- Log für Debugging
CREATE TABLE IF NOT EXISTS public.auth_debug_log (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT,
  user_email TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Log-Funktion
CREATE OR REPLACE FUNCTION public.log_auth_event(
  p_event_type TEXT,
  p_user_email TEXT,
  p_details JSONB DEFAULT '{}'::JSONB
) RETURNS void AS $$
BEGIN
  INSERT INTO public.auth_debug_log (event_type, user_email, details)
  VALUES (p_event_type, p_user_email, p_details);
END;
$$ LANGUAGE plpgsql;

-- Test User für Development
DO $$
BEGIN
  -- Erstelle Test-User falls nicht vorhanden
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'test@localhost.test'
  ) THEN
    -- Füge Test-User direkt ein (umgeht normale Auth)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated', 
      'test@localhost.test',
      crypt('Test123456!', gen_salt('bf')),
      now(),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "Test User"}'::jsonb
    );
    
    RAISE NOTICE 'Test user created: test@localhost.test / Test123456!';
  END IF;
END $$;

-- Hilfsfunktion: Liste alle User
CREATE OR REPLACE FUNCTION public.list_all_users()
RETURNS TABLE (
  email TEXT,
  created_at TIMESTAMPTZ,
  email_confirmed BOOLEAN,
  last_sign_in TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.users.email::TEXT,
    auth.users.created_at,
    (auth.users.email_confirmed_at IS NOT NULL) as email_confirmed,
    auth.users.last_sign_in_at
  FROM auth.users
  ORDER BY auth.users.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.list_all_users() TO anon, authenticated;

COMMENT ON FUNCTION public.list_all_users() IS 'Development only: Liste alle registrierten User';

-- =====================================================
-- WICHTIG: Diese Migration ist NUR für Development!
-- Für Production müssen diese Settings entfernt werden!
-- =====================================================
