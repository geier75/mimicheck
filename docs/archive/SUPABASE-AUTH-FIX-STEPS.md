# 🔧 SUPABASE AUTH FIX - SCHRITT FÜR SCHRITT

## **PROBLEM:**
"Invalid login credentials" oder "Email address is invalid"

---

## **LÖSUNG: SUPABASE DASHBOARD KONFIGURIEREN**

### **SCHRITT 1: Öffne Supabase Dashboard**

1. Gehe zu: https://supabase.com/dashboard
2. Wähle Projekt: `yjjauvmjyhlxcoumwqlj`
3. Linke Sidebar → **Authentication**

---

### **SCHRITT 2: Email Provider aktivieren**

1. Klicke auf **Providers** (in Authentication)
2. Finde **Email**
3. **Aktiviere** den Toggle (wenn nicht bereits aktiv)
4. **WICHTIG:** Deaktiviere **"Confirm email"** für Development!
   
   ```
   [x] Enable Email Provider
   [ ] Confirm email  ← MUSS DEAKTIVIERT SEIN FÜR DEVELOPMENT!
   ```

5. Klicke **Save**

---

### **SCHRITT 3: Email-Domain Restrictions prüfen**

1. In **Authentication** → **Settings**
2. Scrolle zu **"Email"** Section
3. Prüfe ob **"Allowed Email Domains"** leer ist
   - Falls Domains eingetragen sind → **LÖSCHE SIE** für Development
   - Oder füge hinzu: `example.com, gmail.com, localhost`

4. Klicke **Save**

---

### **SCHRITT 4: URL Configuration**

1. In **Authentication** → **URL Configuration**
2. **Site URL:** `http://localhost:8005`
3. **Redirect URLs:** Füge hinzu:
   ```
   http://localhost:8005/*
   http://localhost:3000/*
   ```
4. Klicke **Save**

---

### **SCHRITT 5: Erstelle manuell einen Test-User**

1. In **Authentication** → **Users**
2. Klicke **Add user** → **Create new user**
3. Email: `test@example.com`
4. Password: `Test123456!`
5. **Auto Confirm User:** ✅ **JA** (aktivieren!)
6. Klicke **Create user**

---

### **SCHRITT 6: Teste Login**

1. Öffne: `http://localhost:8005/auth`
2. Login mit:
   - Email: `test@example.com`
   - Passwort: `Test123456!`
3. Sollte jetzt funktionieren! ✅

---

## **ALTERNATIVE: LOKALES SUPABASE (Development)**

Falls du lokales Supabase nutzt:

### **1. Prüfe Supabase Status**
```bash
cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2
supabase status
```

### **2. Prüfe Config**
```bash
cat supabase/config.toml
```

### **3. Stelle sicher dass auth.enable_signup = true**
```toml
[auth]
enable_signup = true
enable_anonymous_sign_ins = false

[auth.email]
enable_signup = true
double_confirm_changes_enabled = false
enable_confirmations = false  # ← WICHTIG FÜR DEVELOPMENT!
```

### **4. Supabase neu starten**
```bash
supabase stop
supabase start
```

---

## **🧪 TEST NACH DEM FIX:**

### **Option 1: Browser**
```
http://localhost:8005/auth
```
- Klicke **"Sign Up"** Tab
- Email: `test@example.com`
- Passwort: `Test123456!`
- Registrieren

### **Option 2: Dev Quick Login**
```
http://localhost:8005/auth
```
- Klicke grünen Button: **"🔧 DEV: Quick Login"**
- Automatischer Login mit Test-User

---

## **📋 CHECKLISTE:**

- [ ] Email Provider aktiviert in Supabase Dashboard
- [ ] "Confirm email" DEAKTIVIERT
- [ ] Keine Email-Domain Restrictions
- [ ] Site URL gesetzt: `http://localhost:8005`
- [ ] Redirect URLs hinzugefügt
- [ ] Test-User manuell erstellt mit **Auto Confirm**
- [ ] Login getestet

---

## **❓ WENN ES IMMER NOCH NICHT FUNKTIONIERT:**

### **Prüfe Browser Console:**
```
F12 → Console Tab
```

Suche nach Fehlern wie:
- `Invalid login credentials`
- `Email not confirmed`
- `CORS error`

### **Prüfe Network Tab:**
```
F12 → Network Tab → Filter: Fetch/XHR
```

Suche nach Request zu:
- `supabase.co/auth/v1/signup`
- `supabase.co/auth/v1/token`

Prüfe Response:
- Status Code (sollte 200 sein)
- Error Message

---

## **🚨 KRITISCH: EMAIL-BESTÄTIGUNG**

Wenn **"Confirm email"** aktiviert ist:

### **Problem:**
- User wird erstellt
- Email wird NICHT versendet (keine SMTP Config)
- User kann sich NICHT einloggen ("Email not confirmed")

### **Lösung 1: Email-Bestätigung deaktivieren (Development)**
```
Supabase Dashboard → Authentication → Providers → Email
[ ] Confirm email  ← DEAKTIVIEREN!
```

### **Lösung 2: User manuell bestätigen**
```
Supabase Dashboard → Authentication → Users
→ Finde User
→ Klicke "..." → "Verify Email"
```

### **Lösung 3: SMTP konfigurieren (Production)**
```
Supabase Dashboard → Project Settings → Auth
→ SMTP Settings
→ Füge SMTP Server hinzu (z.B. SendGrid, Mailgun)
```

---

## **✅ NACH DEM FIX:**

Wenn alles klappt:
1. Registrierung funktioniert
2. Login funktioniert
3. Redirect zu `/onboarding` funktioniert
4. Session bleibt aktiv

**Viel Erfolg!** 🚀
