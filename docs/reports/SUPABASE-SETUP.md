# 🚀 SUPABASE BACKEND SETUP - VOLLSTÄNDIGE ANLEITUNG

**Datum:** 14.11.2025  
**Version:** 1.0  
**Projekt:** MimiCheck

---

## 📋 ÜBERSICHT

Dieses Dokument beschreibt die **vollständige Einrichtung** des Supabase Backends für MimiCheck.

**Was wird eingerichtet:**
- ✅ Datenbank-Schema (8 Tabellen)
- ✅ Row Level Security (RLS) Policies
- ✅ Storage Buckets für File Uploads
- ✅ Auth Konfiguration
- ✅ Triggers & Functions
- ✅ Sample Data (optional)

---

## 🎯 SCHRITT 1: SUPABASE PROJEKT PRÜFEN

### **Dein Projekt:**
```
URL: https://yjjauvmjyhlxcoumwqlj.supabase.co
Projekt-ID: yjjauvmjyhlxcoumwqlj
```

### **Credentials prüfen:**
```bash
# In .env.local:
VITE_SUPABASE_URL=https://yjjauvmjyhlxcoumwqlj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **Status:** Bereits konfiguriert!

---

## 🗄️ SCHRITT 2: DATENBANK-SCHEMA ANLEGEN

### **Option A: Über Supabase Dashboard (EMPFOHLEN)**

1. **Öffne Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/yjjauvmjyhlxcoumwqlj
   ```

2. **Gehe zu SQL Editor:**
   - Linke Sidebar → **SQL Editor**
   - Klick auf **"New Query"**

3. **Kopiere Migration 001:**
   ```bash
   # Öffne die Datei:
   supabase/migrations/001_initial_schema.sql
   
   # Kopiere GESAMTEN Inhalt
   # Füge in SQL Editor ein
   # Klick "Run" (oder Cmd+Enter)
   ```

4. **Warte auf Erfolg:**
   ```
   ✅ Success. No rows returned
   ```

5. **Wiederhole für Migration 002:**
   ```bash
   # Datei: supabase/migrations/002_storage_buckets.sql
   # Kopieren → SQL Editor → Run
   ```

6. **Optional - Sample Data:**
   ```bash
   # Datei: supabase/migrations/003_sample_data.sql
   # NUR für Testing!
   # Kopieren → SQL Editor → Run
   ```

### **Option B: Über Supabase CLI (Fortgeschritten)**

```bash
# 1. Supabase CLI installieren (falls nicht vorhanden)
brew install supabase/tap/supabase

# 2. Login
supabase login

# 3. Link zu Projekt
supabase link --project-ref yjjauvmjyhlxcoumwqlj

# 4. Migrations ausführen
supabase db push

# FERTIG! ✅
```

---

## 🔐 SCHRITT 3: AUTH KONFIGURATION

### **Email Auth aktivieren:**

1. **Gehe zu Authentication:**
   ```
   Dashboard → Authentication → Providers
   ```

2. **Email aktivieren:**
   - ✅ **Enable Email provider**
   - ✅ **Confirm email:** OFF (für Testing)
   - ✅ **Secure email change:** ON
   - Save

3. **Site URL konfigurieren:**
   ```
   Dashboard → Authentication → URL Configuration
   
   Site URL: http://localhost:8005
   Redirect URLs: http://localhost:8005/auth-bridge
   ```

### **Optional: OAuth Provider (Google, GitHub)**

```
Dashboard → Authentication → Providers
→ Google aktivieren
→ Client ID & Secret eingeben
```

---

## 📦 SCHRITT 4: STORAGE BUCKETS PRÜFEN

### **Buckets sollten existieren:**

```
Dashboard → Storage
```

**Erwartete Buckets:**
- ✅ `abrechnungen` (Private)
- ✅ `antraege` (Private)
- ✅ `nachweise` (Private)
- ✅ `avatars` (Public)

**Falls nicht vorhanden:**
→ Migration 002 nochmal ausführen!

---

## 🧪 SCHRITT 5: TESTEN

### **Test 1: Registrierung**

```bash
# Browser öffnen:
http://localhost:8005/auth

# Registrieren:
Email: test@mimicheck.de
Passwort: Test1234!

# Erwartung:
✅ User wird angelegt
✅ Weiterleitung zu /onboarding
✅ user_profiles Eintrag erstellt (automatisch via Trigger)
```

### **Test 2: Login**

```bash
# Gleiche Credentials:
Email: test@mimicheck.de
Passwort: Test1234!

# Erwartung:
✅ Login erfolgreich
✅ Weiterleitung zu /onboarding oder /Dashboard
```

### **Test 3: Datenbank prüfen**

```sql
-- Im SQL Editor:
SELECT * FROM public.user_profiles;

-- Erwartung:
-- 1 Row mit deinem Test-User
```

---

## 📊 DATENBANK-SCHEMA ÜBERSICHT

### **Tabellen:**

```
1. user_profiles       → User-Daten (erweitert auth.users)
2. abrechnungen        → Nebenkostenabrechnungen
3. anspruchspruefungen → Förderprüfungen
4. foerderleistungen   → Staatliche Leistungen
5. antraege            → Förderanträge
6. dokumente           → File Uploads
7. contact_requests    → Landing Page Kontakte
8. notifications       → Benachrichtigungen
```

### **Beziehungen:**

```
auth.users (Supabase)
    ↓
user_profiles (id)
    ↓
    ├── abrechnungen (user_id)
    ├── anspruchspruefungen (user_id)
    ├── foerderleistungen (user_id)
    ├── antraege (user_id)
    ├── dokumente (user_id)
    └── notifications (user_id)
```

---

## 🔒 SECURITY (RLS)

### **Alle Tabellen haben RLS aktiviert:**

```sql
-- Beispiel: Abrechnungen
-- User kann NUR eigene Daten sehen/bearbeiten

CREATE POLICY "Users can view own abrechnungen"
  ON public.abrechnungen FOR SELECT
  USING (user_id IN (
    SELECT id FROM public.user_profiles 
    WHERE auth_id = auth.uid()
  ));
```

### **Policies testen:**

```sql
-- Als eingeloggter User:
SELECT * FROM public.abrechnungen;

-- Erwartung:
-- NUR eigene Abrechnungen werden angezeigt
-- Keine Daten von anderen Usern!
```

---

## 🚨 TROUBLESHOOTING

### **Problem 1: "relation does not exist"**

```
URSACHE: Tabellen nicht angelegt
LÖSUNG: Migration 001 ausführen (siehe Schritt 2)
```

### **Problem 2: "permission denied for table"**

```
URSACHE: RLS Policy fehlt oder falsch
LÖSUNG: 
1. Prüfe ob RLS aktiviert: ALTER TABLE ... ENABLE ROW LEVEL SECURITY
2. Prüfe Policies: SELECT * FROM pg_policies WHERE tablename = 'abrechnungen'
3. Migration 001 nochmal ausführen
```

### **Problem 3: "new row violates row-level security policy"**

```
URSACHE: User versucht Daten für anderen User anzulegen
LÖSUNG: 
1. Prüfe ob user_id korrekt ist
2. Prüfe ob auth.uid() gesetzt ist (User eingeloggt?)
```

### **Problem 4: Storage Upload schlägt fehl**

```
URSACHE: Storage Policies fehlen
LÖSUNG: Migration 002 ausführen (siehe Schritt 2)
```

### **Problem 5: User Profile wird nicht erstellt**

```
URSACHE: Trigger fehlt
LÖSUNG:
1. Prüfe ob Trigger existiert:
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created'
2. Migration 001 nochmal ausführen
```

---

## 📝 NÄCHSTE SCHRITTE

### **Nach erfolgreichem Setup:**

1. ✅ **Test-User anlegen** (siehe Schritt 5)
2. ✅ **Login testen**
3. ✅ **Onboarding durchlaufen**
4. ✅ **Abrechnung hochladen** (Upload-Feature testen)
5. ✅ **Förderprüfung starten**

### **Optional:**

- 📧 **Email Templates** anpassen (Dashboard → Authentication → Email Templates)
- 🎨 **Auth UI** customizen (Dashboard → Authentication → Settings)
- 🔐 **2FA** aktivieren (Dashboard → Authentication → Settings)
- 📊 **Analytics** einrichten (Dashboard → Analytics)

---

## 🆘 SUPPORT

### **Bei Problemen:**

1. **Supabase Logs prüfen:**
   ```
   Dashboard → Logs → Postgres Logs
   ```

2. **Browser Console prüfen:**
   ```
   F12 → Console → Fehler lesen
   ```

3. **SQL Queries testen:**
   ```
   Dashboard → SQL Editor → Query ausführen
   ```

4. **Mir Bescheid sagen:**
   ```
   Screenshot + Fehlermeldung schicken
   ```

---

## ✅ CHECKLISTE

**Vor dem Start:**
- [ ] Supabase Dashboard geöffnet
- [ ] Projekt-URL korrekt
- [ ] .env.local konfiguriert

**Setup:**
- [ ] Migration 001 ausgeführt (Schema)
- [ ] Migration 002 ausgeführt (Storage)
- [ ] Migration 003 ausgeführt (Sample Data - optional)
- [ ] Auth Provider aktiviert (Email)
- [ ] Site URL konfiguriert

**Testing:**
- [ ] Test-User registriert
- [ ] Login funktioniert
- [ ] user_profiles Eintrag existiert
- [ ] Storage Buckets existieren

**Fertig! 🎉**
- [ ] Backend läuft
- [ ] Login funktioniert
- [ ] Bereit für Development

---

## 🚀 QUICK START (TL;DR)

```bash
# 1. Supabase Dashboard öffnen
https://supabase.com/dashboard/project/yjjauvmjyhlxcoumwqlj

# 2. SQL Editor → New Query

# 3. Kopiere & Run:
supabase/migrations/001_initial_schema.sql

# 4. Kopiere & Run:
supabase/migrations/002_storage_buckets.sql

# 5. Auth aktivieren:
Dashboard → Authentication → Providers → Email → Enable

# 6. Site URL setzen:
Dashboard → Authentication → URL Configuration
→ http://localhost:8005

# 7. Testen:
http://localhost:8005/auth
→ Registrieren
→ Login

# FERTIG! ✅
```

---

**VIEL ERFOLG! 🚀**

Bei Fragen → Einfach fragen!
