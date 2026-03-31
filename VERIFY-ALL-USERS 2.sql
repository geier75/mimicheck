-- ════════════════════════════════════════════════════════
-- 🔧 VERIFY ALL USERS - SUPABASE SQL
-- ════════════════════════════════════════════════════════
--
-- PROBLEM: "Invalid login credentials" beim Login
-- URSACHE: User existiert, aber Email ist nicht bestätigt
-- LÖSUNG: Alle User auf einmal bestätigen
--
-- WIE VERWENDEN:
-- 1. Öffne: https://supabase.com/dashboard/project/yjjauvmjyhlxcoumwqlj/sql
-- 2. Klicke "New query"
-- 3. Kopiere diesen Code
-- 4. Klicke "Run"
-- 5. Alle User sind jetzt verifiziert!
--
-- ════════════════════════════════════════════════════════

-- Zeige alle User VOR der Änderung
SELECT 
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Nicht bestätigt'
    ELSE '✅ Bestätigt'
  END as status,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- Bestätige alle unbestätigten User
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Zeige Ergebnis
SELECT 
  email,
  email_confirmed_at,
  '✅ JETZT BESTÄTIGT!' as status
FROM auth.users
ORDER BY created_at DESC;
