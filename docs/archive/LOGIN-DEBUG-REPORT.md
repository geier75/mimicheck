# 🔍 LOGIN-PROBLEM DIAGNOSE

**Datum:** 14.11.2025, 19:50 Uhr  
**Status:** ANALYSE LÄUFT

---

## 📋 SYSTEM-CHECK

### **1. Supabase Konfiguration ✅**
```
✅ .env.local existiert
✅ VITE_SUPABASE_URL konfiguriert
✅ VITE_SUPABASE_ANON_KEY konfiguriert
✅ supabaseClient.js korrekt

URL: https://yjjauvmjyhlxcoumwqlj.supabase.co
```

### **2. Auth-Komponenten ✅**
```
✅ Auth.jsx existiert (Login/Signup)
✅ AuthBridge.jsx existiert (OAuth Callback)
✅ Onboarding.jsx existiert (Nach Login)
✅ ProtectedRoute.jsx existiert
```

### **3. Auth-Flow ✅**
```
FLOW:
1. User geht zu /auth
2. Gibt Email + Passwort ein
3. supabase.auth.signInWithPassword()
4. Bei Erfolg → /onboarding
5. Onboarding → /Dashboard

CODE (Auth.jsx Zeile 16):
res = await supabase.auth.signInWithPassword({ email, password });
```

---

## 🐛 MÖGLICHE PROBLEME

### **Problem 1: Supabase Auth nicht aktiviert**
```
SYMPTOM:
- Login-Button funktioniert nicht
- Keine Fehlermeldung
- Keine Weiterleitung

URSACHE:
- Email Auth in Supabase deaktiviert
- Oder: Email Confirmation erforderlich

LÖSUNG:
→ Supabase Dashboard → Authentication → Providers
→ Email aktivieren
→ "Confirm email" deaktivieren (für Testing)
```

### **Problem 2: Kein User in Datenbank**
```
SYMPTOM:
- "Invalid login credentials" Fehler

URSACHE:
- Noch kein User angelegt
- Oder: Falsches Passwort

LÖSUNG:
→ Registrieren statt Login
→ Oder: User in Supabase Dashboard anlegen
```

### **Problem 3: CORS / Network Error**
```
SYMPTOM:
- Network Error in Console
- Request blocked

URSACHE:
- Supabase URL falsch
- Oder: CORS nicht konfiguriert

LÖSUNG:
→ Supabase Dashboard → Settings → API
→ Site URL hinzufügen: http://localhost:8005
```

### **Problem 4: Session Persistence**
```
SYMPTOM:
- Login erfolgreich, aber sofort wieder ausgeloggt

URSACHE:
- localStorage blocked
- Oder: Session nicht gespeichert

LÖSUNG:
→ Browser-Einstellungen prüfen
→ Cookies/LocalStorage erlauben
```

---

## 🔧 DEBUGGING-SCHRITTE

### **SCHRITT 1: Browser Console öffnen**
```
1. Browser öffnen (http://localhost:8005)
2. F12 drücken (DevTools)
3. Console Tab öffnen
4. Zu /auth navigieren
5. Login versuchen
6. Fehler in Console lesen
```

### **SCHRITT 2: Network Tab prüfen**
```
1. DevTools → Network Tab
2. Login versuchen
3. Supabase Request suchen
4. Status Code prüfen:
   - 200 = OK
   - 400 = Bad Request (falsche Daten)
   - 401 = Unauthorized (falsche Credentials)
   - 500 = Server Error
```

### **SCHRITT 3: Supabase Dashboard prüfen**
```
1. https://supabase.com/dashboard
2. Projekt öffnen: yjjauvmjyhlxcoumwqlj
3. Authentication → Users
4. Gibt es Users?
5. Authentication → Providers
6. Email aktiviert?
```

---

## 🚀 QUICK-FIX OPTIONEN

### **OPTION 1: Test-User anlegen (Schnell)**
```sql
-- In Supabase SQL Editor:
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@mimicheck.de',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

### **OPTION 2: Email Confirmation deaktivieren**
```
Supabase Dashboard:
→ Authentication → Settings
→ "Enable email confirmations" = OFF
→ Speichern

DANN:
→ Registrieren mit beliebiger Email
→ Sofort einloggen (kein Email-Check)
```

### **OPTION 3: Auth Debug Mode**
```javascript
// In Auth.jsx nach Zeile 19 einfügen:
console.log('Auth Response:', res);
console.log('User:', res.data?.user);
console.log('Session:', res.data?.session);
console.log('Error:', res.error);
```

---

## 📊 NÄCHSTE SCHRITTE

**JETZT:**
```
1. Browser öffnen → http://localhost:8005/auth
2. Console öffnen (F12)
3. Login versuchen
4. Fehler screenshotten
5. Mir zeigen
```

**DANN:**
```
Basierend auf Fehler:
→ Supabase konfigurieren
→ Oder: Test-User anlegen
→ Oder: Code fixen
```

---

## 🎯 WAS ICH BRAUCHE

**VON DIR:**
```
1. Screenshot vom Login-Screen
2. Screenshot von Browser Console (Fehler)
3. Oder: Genaue Fehlermeldung kopieren
4. Oder: "Es passiert gar nichts" beschreiben
```

**DANN KANN ICH:**
```
✅ Exaktes Problem identifizieren
✅ Schnelle Lösung implementieren
✅ Login reparieren
```

---

**BROWSER JETZT ÖFFNEN:**
→ http://localhost:8005/auth

**ODER SAGE MIR:**
- "zeig mir den login screen"
- "mach einen test user"
- "fix es einfach"
