#!/bin/bash

echo "🔐 SUPABASE AUTH KONFIGURATION"
echo "=============================="
echo ""
echo "Dieses Script konfiguriert Supabase für automatische Email-Bestätigung"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📋 Option 1: Remote Supabase Dashboard${NC}"
echo "1. Gehe zu: https://app.supabase.com/project/yjjauvmjyhlxcoumwqlj/auth/users"
echo "2. Klicke auf 'Policies'"
echo "3. Setze 'Enable email confirmations' auf OFF"
echo "4. Setze 'Enable email change confirmations' auf OFF"
echo ""

echo -e "${BLUE}📋 Option 2: Lokale Supabase CLI${NC}"
echo "Führe diese Befehle aus:"
echo ""

echo -e "${YELLOW}# 1. Migration ausführen${NC}"
echo "supabase migration up --db-url postgresql://postgres:[YOUR-PASSWORD]@db.yjjauvmjyhlxcoumwqlj.supabase.co:5432/postgres"
echo ""

echo -e "${YELLOW}# 2. Test-User erstellen${NC}"
echo "supabase db push --db-url postgresql://postgres:[YOUR-PASSWORD]@db.yjjauvmjyhlxcoumwqlj.supabase.co:5432/postgres"
echo ""

echo -e "${BLUE}📋 Option 3: Direkte SQL-Ausführung${NC}"
echo "1. Gehe zu: https://app.supabase.com/project/yjjauvmjyhlxcoumwqlj/editor"
echo "2. Führe folgendes SQL aus:"
echo ""

cat << 'SQL'
-- Deaktiviere Email-Bestätigung für alle neuen User
ALTER TABLE auth.users 
ALTER COLUMN email_confirmed_at 
SET DEFAULT now();

-- Bestätige alle existierenden User
UPDATE auth.users 
SET email_confirmed_at = now(),
    confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- Erstelle Test-User
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'test@mimicheck.de',
  crypt('Test123456!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email"}'::jsonb,
  '{"name": "Test User"}'::jsonb
) ON CONFLICT (email) DO NOTHING;
SQL

echo ""
echo -e "${GREEN}✅ Nach der Konfiguration:${NC}"
echo "- Neue User werden automatisch bestätigt"
echo "- Keine Email-Bestätigung mehr nötig"
echo "- Login funktioniert sofort nach Registrierung"
echo ""
echo -e "${YELLOW}⚠️  WICHTIG: Nur für Development!${NC}"
echo "Für Production muss Email-Bestätigung aktiviert sein!"
echo ""
