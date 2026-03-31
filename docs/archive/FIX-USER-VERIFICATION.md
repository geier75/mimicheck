# 🔧 FIX: Invalid Login Credentials

**Problem:** User wurde registriert, aber Login sagt "Invalid login credentials"
**Ursache:** Email ist nicht bestätigt in Supabase

---

## **✅ LÖSUNG: USER MANUELL BESTÄTIGEN**

### **SCHRITT 1: Öffne Supabase Dashboard**

```
https://supabase.com/dashboard/project/yjjauvmjyhlxcoumwqlj/auth/users
```

---

### **SCHRITT 2: Finde deinen User**

**Suche nach der Email die du verwendet hast**

Du solltest den User in der Liste sehen.

---

### **SCHRITT 3: Prüfe Status**

**Spalte: "Email Confirmed"**

Wenn dort steht:
- ❌ **"No"** oder **"-"** → User ist nicht bestätigt
- ✅ **"Yes"** → User ist bestätigt (Problem liegt woanders)

---

### **SCHRITT 4: User bestätigen**

**Klicke auf den User** (auf die Email)

**Im User-Detail Panel:**
1. Klicke auf **"..."** (3 Punkte oben rechts)
2. Wähle **"Verify Email"** oder **"Confirm Email"**
3. Bestätige

**ODER:**

Klicke in der Hauptliste auf **"..."** neben dem User → **"Verify Email"**

---

### **SCHRITT 5: Teste Login erneut**

1. Gehe zu: `http://localhost:3000/landing#auth`
2. Wähle Tab: **"Anmelden"** (Login, nicht Sign Up!)
3. Email: (die du registriert hast)
4. Passwort: (was du verwendet hast)
5. Klicke **"Anmelden"**

**Jetzt sollte es funktionieren!** ✅

---

## **🔒 DAUERHAFT FIXEN: Email-Bestätigung ausschalten**

**Damit das nicht mehr passiert:**

### **SCHRITT 1: Öffne**
```
https://supabase.com/dashboard/project/yjjauvmjyhlxcoumwqlj/auth/providers
```

---

### **SCHRITT 2: Klicke auf "Email"**

---

### **SCHRITT 3: Finde diese Einstellungen**

**Scrolle nach unten zu:**

#### **"Confirm email"**
- Aktuell: Wahrscheinlich ✅ AN
- Ändern zu: ❌ **AUS**

#### **"Enable email confirmations"** 
- Aktuell: Wahrscheinlich ✅ AN
- Ändern zu: ❌ **AUS**

#### **"Secure email change"**
- Ändern zu: ❌ **AUS** (optional, für einfachere Dev)

---

### **SCHRITT 4: SAVE**

**WICHTIG:** Klicke **"Save"** unten!

---

### **SCHRITT 5: Teste mit NEUEM User**

**Nach dem Ausschalten:**

1. Gehe zu: `http://localhost:3000/landing#auth`
2. Tab: **"Registrieren"** (Sign Up)
3. Email: `test-neu@example.com`
4. Passwort: `Test123456!`
5. Klicke **"Registrieren"**

**Erwartung:**
- ✅ User wird erstellt
- ✅ **Sofort** eingeloggt
- ✅ Redirect zu Port 8005

**KEIN Email-Bestätigung nötig!**

---

## **❓ FALLS IMMER NOCH "INVALID CREDENTIALS":**

### **Check 1: Richtiges Passwort?**

**Häufiger Fehler:** 
- Registriert mit: `Test123456!`
- Versucht Login mit: `Test123456` (ohne `!`)

**Lösung:** Genau dasselbe Passwort verwenden!

---

### **Check 2: User existiert überhaupt?**

**Gehe zu:** Supabase → Authentication → Users

**Ist deine Email in der Liste?**
- **JA** → User existiert, Problem ist Bestätigung oder Passwort
- **NEIN** → Registrierung ist fehlgeschlagen

---

### **Check 3: Account gesperrt?**

**In der User-Liste:**

**Spalte: "Status"**
- ✅ **"active"** → OK
- ❌ **"blocked"** oder **"disabled"** → Account gesperrt

**Falls gesperrt:**
Klicke User → "..." → "Unblock user"

---

## **🚀 QUICK FIX - NEUEN USER ANLEGEN**

**Falls du nicht weiter kommst:**

### **Option A: Manuell in Supabase**

1. Supabase → Authentication → Users
2. Klicke **"Add user"**
3. Email: `quick-test@example.com`
4. Password: `Test123456!`
5. ✅ **Auto Confirm User** ← WICHTIG!
6. Klicke "Create user"

**Dann Login mit:**
- Email: `quick-test@example.com`
- Passwort: `Test123456!`

---

### **Option B: SQL Command**

**Supabase → SQL Editor → New query:**

```sql
-- Bestätige alle unbestätigten User
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
```

**Dann:** Klicke "Run"

**Das bestätigt alle User auf einmal!**

---

## **✅ ZUSAMMENFASSUNG**

**Problem:** "Invalid login credentials" beim Login
**Ursache:** Email nicht bestätigt
**Lösung:** 
1. Supabase → Users → User finden → "Verify Email"
2. Supabase → Providers → Email → "Confirm email" AUS
3. Neuer User testen

**Danach sollte alles funktionieren!** 🎉
