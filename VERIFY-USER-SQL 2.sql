-- ════════════════════════════════════════════════════════
-- 🔧 USER VERIFIZIEREN - QUICK FIX
-- ════════════════════════════════════════════════════════
--
-- PROBLEM: 422 bei Signup (User existiert) + 400 bei Login
-- URSACHE: User existiert, aber Email ist nicht bestätigt
-- LÖSUNG: Alle unbestätigten User verifizieren
--
-- WIE VERWENDEN:
-- 1. Öffne: https://supabase.com/dashboard/project/yjjauvmjyhlxcoumwqlj/sql
-- 2. Klicke "New query"
-- 3. Kopiere diesen Code
-- 4. Klicke "Run"
-- 5. Teste Login erneut!
--
-- ════════════════════════════════════════════════════════

-- SCHRITT 1: Zeige alle User und ihren Status
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

-- SCHRITT 2: Verifiziere ALLE unbestätigten User
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- SCHRITT 3: Zeige Ergebnis
SELECT 
  email,
  email_confirmed_at,
  '✅ JETZT BESTÄTIGT!' as status
FROM auth.users
ORDER BY created_at DESC;

-- ════════════════════════════════════════════════════════
-- ✅ FERTIG!
-- Teste jetzt Login auf Port 3000 mit: oezkelle.h@gmail.com
-- ════════════════════════════════════════════════════════
