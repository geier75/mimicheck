# 🐛 DEBUG: Supabase 400 Error

**Error:** `Failed to load resource: the server responded with a status of 400 ()`
**URL:** `token?grant_type=password`
**Was es bedeutet:** Supabase Auth API lehnt die Anfrage ab

---

## **🔍 MÖGLICHE URSACHEN:**

### **1. FALSCHE CREDENTIALS** (Häufigste Ursache)

**Symptom:**
- 400 Error bei Login
- Anfrage wird abgelehnt

**Mögliche Gründe:**
- Email existiert nicht
- Passwort falsch
- Email-Format ungültig
- User ist gesperrt/disabled

**Lösung:**
1. Teste mit komplett NEUEM User (Registrierung, nicht Login)
2. Verwende einfache Email: `test-new@example.com`
3. Verwende starkes Passwort: `Test123456!`

---

### **2. SUPABASE PROJECT URL FALSCH**

**Symptom:**
- 400 Error bei jeder Auth-Anfrage
- Anfrage geht an falschen Server

**Check:**
```bash
# In mimicheck-landing/.env
grep VITE_SUPABASE_URL mimicheck-landing/.env
```

**Sollte sein:**
```
VITE_SUPABASE_URL=https://yjjauvmjyhlxcoumwqlj.supabase.co
```

**NICHT:**
- `http://` statt `https://`
- Falsche Project ID
- Lokale URL

---

### **3. SUPABASE ANON KEY FALSCH**

**Symptom:**
- 400 oder 401 Error
- Anfrage wird authentifiziert abgelehnt

**Check:**
```bash
grep VITE_SUPABASE_ANON_KEY mimicheck-landing/.env | head -c 50
```

**Fix:**
1. Gehe zu: https://supabase.com/dashboard/project/yjjauvmjyhlxcoumwqlj/settings/api
2. Kopiere "anon" / "public" Key
3. Ersetze in `.env`

---

### **4. EMAIL PROVIDER DEAKTIVIERT**

**Symptom:**
- 400 Error bei Signup/Login
- Supabase lehnt Email/Password Auth ab

**Check:**
1. Gehe zu: https://supabase.com/dashboard/project/yjjauvmjyhlxcoumwqlj/auth/providers
2. Klicke auf "Email"
3. Prüfe: "Enable Email provider" muss ✅ AN sein!

**Falls AUS:**
- Schalte AN
- Klicke "Save"
- Teste erneut

---

### **5. SIGNUPS DEAKTIVIERT**

**Symptom:**
- 400 Error bei Registrierung (Signup)
- Login könnte funktionieren

**Check:**
1. Gehe zu: https://supabase.com/dashboard/project/yjjauvmjyhlxcoumwqlj/auth/providers
2. Scrolle zu "Auth Settings"
3. Prüfe: "Enable sign ups" muss ✅ AN sein!

**Falls AUS:**
- Schalte AN
- Klicke "Save"
- Teste erneut

---

### **6. PASSWORT ZU SCHWACH**

**Symptom:**
- 400 Error bei Signup
- Response: "Password is too weak" oder ähnlich

**Supabase Anforderungen:**
- Mindestens 8 Zeichen
- (Optional: Groß-/Kleinbuchstaben, Zahlen, Sonderzeichen)

**Teste mit:**
```
Passwort: Test123456!
```

---

### **7. EMAIL-FORMAT UNGÜLTIG**

**Symptom:**
- 400 Error bei Signup/Login
- Supabase akzeptiert Email nicht

**Vermeide:**
- `test@test` (ohne TLD)
- `test+tag@domain` (falls + verboten)
- Umlaute in Email

**Verwende:**
- `test@example.com`
- `user@gmail.com`
- Einfache ASCII-Zeichen

---

### **8. CORS PROBLEM**

**Symptom:**
- 400 Error in Browser Console
- Preflight Request fehlgeschlagen

**Check in Supabase:**
1. Gehe zu: https://supabase.com/dashboard/project/yjjauvmjyhlxcoumwqlj/settings/api
2. Scrolle zu "CORS"
3. Stelle sicher dass `http://localhost:3000` erlaubt ist

**Oder in Code:**
- Prüfe ob `supabase.auth.signUp()` korrekt aufgerufen wird
- Prüfe ob korrekte Headers gesetzt sind

---

## **🧪 DEBUGGING SCHRITTE:**

### **SCHRITT 1: Browser DevTools öffnen**

1. Öffne: `http://localhost:3000/landing#auth`
2. Drücke F12
3. Gehe zu Tab "Network"
4. Filter auf "Fetch/XHR"

---

### **SCHRITT 2: Login/Signup versuchen**

Fülle Formular aus und klicke "Anmelden" oder "Registrieren"

---

### **SCHRITT 3: Network Request anschauen**

**Finde den fehlgeschlagenen Request:**
- Name: `token?grant_type=password` oder `signup` oder `signin`
- Status: 400 (rot)

**Klicke darauf!**

---

### **SCHRITT 4: Prüfe Request Details**

**Tab "Headers":**
```
Request URL: https://yjjauvmjyhlxcoumwqlj.supabase.co/auth/v1/token?grant_type=password
Request Method: POST
Status Code: 400 Bad Request
```

**Tab "Payload" oder "Request":**
```json
{
  "email": "test@example.com",
  "password": "Test123456!"
}
```

**Tab "Response":**
```json
{
  "error": "Invalid login credentials",
  "error_description": "Email not confirmed"
}
```

**→ Das ist die ECHTE Fehlermeldung!**

---

### **SCHRITT 5: Interpretiere den Response**

**Häufige Error Messages:**

| Error Message | Bedeutung | Lösung |
|---------------|-----------|--------|
| `Invalid login credentials` | User existiert nicht ODER Email nicht bestätigt | User verifizieren oder neu registrieren |
| `Email not confirmed` | Email muss bestätigt werden | Email-Bestätigung in Supabase ausschalten |
| `User already registered` | Email schon verwendet | Andere Email oder zu Login wechseln |
| `Password is too weak` | Passwort erfüllt Anforderungen nicht | Stärkeres Passwort (min. 8 Zeichen) |
| `Email address is invalid` | Email-Format falsch | Einfache Email wie test@example.com |
| `Signups not allowed` | Registrierung ist deaktiviert | In Supabase Dashboard aktivieren |

---

## **✅ QUICK FIX - PROBIERE DAS:**

### **FIX 1: Neuen User mit korrekten Daten**

1. Öffne: `http://localhost:3000/landing#auth`
2. Tab: **"Registrieren"** (nicht "Anmelden"!)
3. Email: `brand-new-test@example.com`
4. Passwort: `SuperSecret123!`
5. Klicke "Registrieren"

---

### **FIX 2: Email-Bestätigung ausschalten**

```
1. Öffne: https://supabase.com/dashboard/project/yjjauvmjyhlxcoumwqlj/auth/providers
2. Klicke "Email"
3. "Confirm email" → AUS ❌
4. "Save"
5. Teste mit neuem User
```

---

### **FIX 3: Bestehenden User verifizieren**

```sql
-- Öffne: https://supabase.com/dashboard/project/yjjauvmjyhlxcoumwqlj/sql
-- Führe aus:
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
```

---

### **FIX 4: Prüfe Environment Variables**

```bash
cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2/mimicheck-landing
cat .env | grep VITE_SUPABASE
```

**Sollte zeigen:**
```
VITE_SUPABASE_URL=https://yjjauvmjyhlxcoumwqlj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**Falls falsch:**
```bash
# Korrigiere die .env
nano .env
# Oder verwende das Fix-Script:
../FIX-LANDING-ENV.sh
```

---

## **📸 WAS ICH VON DIR BRAUCHE:**

**Um das Problem genau zu fixen, sende mir:**

1. **Screenshot vom Network Tab:**
   - Der fehlgeschlagene Request (400)
   - Tab "Response" aufgeklappt
   
2. **Console Logs:**
   - Was steht in der Browser Console?
   - Gibt es rote Errors?

3. **Welche Credentials hast du verwendet?**
   - Email: ?
   - Passwort Länge: ?
   - "Anmelden" oder "Registrieren"?

**Dann kann ich das Problem SOFORT lösen!** 🎯

---

## **🚀 AM WAHRSCHEINLICHSTEN:**

**Basierend auf dem Fehler, ist es wahrscheinlich:**

1. ❌ Email nicht bestätigt (trotz User-Erstellung)
2. ❌ "Confirm email" ist noch AN in Supabase
3. ❌ Du versuchst LOGIN mit einem User der nicht existiert

**→ Lösung:** Email-Bestätigung ausschalten + neuen User registrieren
