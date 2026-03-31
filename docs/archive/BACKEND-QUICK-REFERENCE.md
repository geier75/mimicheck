# 🚀 BACKEND QUICK REFERENCE

**Schnellreferenz für MimiCheck Supabase Backend**

---

## 📦 WAS WURDE ERSTELLT?

### **1. SQL Migrations (3 Dateien)**
```
supabase/migrations/
├── 001_initial_schema.sql    → Datenbank-Schema (8 Tabellen)
├── 002_storage_buckets.sql   → Storage Buckets + Policies
└── 003_sample_data.sql        → Sample Data (optional)
```

### **2. API Client**
```
src/api/supabaseEntities.js   → Type-safe CRUD Operations
```

### **3. Dokumentation**
```
SUPABASE-SETUP.md              → Vollständige Setup-Anleitung
BACKEND-QUICK-REFERENCE.md     → Diese Datei
```

---

## 🗄️ DATENBANK-SCHEMA

### **Tabellen:**

| Tabelle | Beschreibung | Wichtige Felder |
|---------|--------------|-----------------|
| `user_profiles` | User-Daten | `auth_id`, `email`, `full_name`, `wohnart` |
| `abrechnungen` | Nebenkostenabrechnungen | `titel`, `rueckforderung_potential`, `analyse_status` |
| `anspruchspruefungen` | Förderprüfungen | `status`, `ergebnis` |
| `foerderleistungen` | Staatliche Leistungen | `typ`, `geschaetzter_betrag`, `status` |
| `antraege` | Förderanträge | `typ`, `status`, `formular_daten` |
| `dokumente` | File Uploads | `file_url`, `file_key`, `mime_type` |
| `contact_requests` | Landing Page Kontakte | `email`, `message` |
| `notifications` | Benachrichtigungen | `titel`, `gelesen` |

---

## 💻 API USAGE

### **Import:**
```javascript
import { 
  UserProfile, 
  Abrechnung, 
  Foerderleistung,
  Antrag,
  Notification,
  Storage,
  Auth
} from '@/api/supabaseEntities';
```

### **User Profile:**
```javascript
// Get current user profile
const profile = await UserProfile.getCurrent();

// Update profile
await UserProfile.update({
  full_name: 'Max Mustermann',
  wohnart: 'miete',
  profile_completeness: 100
});
```

### **Abrechnungen:**
```javascript
// List all
const abrechnungen = await Abrechnung.list();

// List with options
const sorted = await Abrechnung.list({
  orderBy: 'created_date',
  ascending: false,
  limit: 10
});

// Get single
const abrechnung = await Abrechnung.get('uuid-here');

// Create
const newAbrechnung = await Abrechnung.create({
  titel: 'Nebenkostenabrechnung 2024',
  abrechnungszeitraum: '01.01.2024 - 31.12.2024',
  gesamtkosten: 2500.00,
  analyse_status: 'wartend'
});

// Update
await Abrechnung.update('uuid-here', {
  analyse_status: 'abgeschlossen',
  rueckforderung_potential: 450.75
});

// Delete
await Abrechnung.delete('uuid-here');
```

### **Förderleistungen:**
```javascript
// List all (including global)
const leistungen = await Foerderleistung.list();

// Filter by type
const wohngeld = await Foerderleistung.list({ typ: 'wohngeld' });

// Filter by status
const empfohlen = await Foerderleistung.list({ status: 'empfohlen' });

// Create
const newLeistung = await Foerderleistung.create({
  typ: 'wohngeld',
  titel: 'Wohngeld Antrag',
  geschaetzter_betrag: 350.00,
  status: 'empfohlen'
});
```

### **Anträge:**
```javascript
// List all
const antraege = await Antrag.list();

// Filter by status
const entwuerfe = await Antrag.list({ status: 'entwurf' });

// Create
const newAntrag = await Antrag.create({
  typ: 'wohngeld',
  titel: 'Wohngeld Antrag 2024',
  status: 'entwurf',
  formular_daten: {
    einkommen: 2000,
    miete: 800
  }
});

// Update
await Antrag.update('uuid-here', {
  status: 'eingereicht',
  eingereicht_am: new Date().toISOString()
});
```

### **Notifications:**
```javascript
// List all
const notifications = await Notification.list();

// List unread only
const unread = await Notification.list({ 
  unreadOnly: true,
  limit: 5
});

// Mark as read
await Notification.markAsRead('uuid-here');

// Mark all as read
await Notification.markAllAsRead();
```

### **Storage (File Uploads):**
```javascript
// Upload file
const result = await Storage.uploadFile(
  'abrechnungen',  // bucket
  file,            // File object
  null             // optional custom path
);
// Returns: { path, url, key }

// Delete file
await Storage.deleteFile('abrechnungen', 'user_123/file.pdf');

// Get file URL
const url = Storage.getFileUrl('abrechnungen', 'user_123/file.pdf');
```

### **Auth:**
```javascript
// Get current user
const user = await Auth.getUser();

// Sign in
const { user, session } = await Auth.signIn(
  'test@mimicheck.de',
  'password123'
);

// Sign up
const { user, session } = await Auth.signUp(
  'new@mimicheck.de',
  'password123',
  { full_name: 'Max Mustermann' }
);

// Sign out
await Auth.signOut();

// Reset password
await Auth.resetPassword('test@mimicheck.de');
```

---

## 🔐 SECURITY (RLS)

### **Alle Tabellen sind geschützt:**

```sql
-- User kann NUR eigene Daten sehen
SELECT * FROM abrechnungen;  -- Nur eigene Abrechnungen

-- User kann NUR eigene Daten bearbeiten
UPDATE abrechnungen SET ... WHERE id = '...';  -- Nur eigene

-- User kann NUR eigene Daten löschen
DELETE FROM abrechnungen WHERE id = '...';  -- Nur eigene
```

### **Storage ist geschützt:**

```javascript
// User kann NUR in eigenem Ordner hochladen
// Pfad: user_id/filename.pdf

// User kann NUR eigene Dateien lesen/löschen
```

---

## 🧪 TESTING

### **Test-User anlegen:**

```javascript
// In Browser Console (http://localhost:8005/auth):
const { user } = await Auth.signUp(
  'test@mimicheck.de',
  'Test1234!',
  { full_name: 'Test User' }
);
```

### **Test-Abrechnung erstellen:**

```javascript
const abrechnung = await Abrechnung.create({
  titel: 'Test Abrechnung',
  abrechnungszeitraum: '2024',
  gesamtkosten: 2500.00,
  vorauszahlungen: 2400.00,
  guthaben: 100.00,
  analyse_status: 'wartend'
});
```

### **Test-Notification erstellen:**

```sql
-- Im Supabase SQL Editor:
INSERT INTO public.notifications (user_id, titel, nachricht, typ)
VALUES (
  (SELECT id FROM public.user_profiles WHERE email = 'test@mimicheck.de'),
  'Willkommen!',
  'Dein Account wurde erfolgreich erstellt.',
  'erfolg'
);
```

---

## 🚨 HÄUFIGE FEHLER

### **1. "Not authenticated"**
```javascript
// PROBLEM: User nicht eingeloggt
// LÖSUNG: Erst einloggen
await Auth.signIn('email', 'password');
```

### **2. "User profile not found"**
```javascript
// PROBLEM: user_profiles Eintrag fehlt
// LÖSUNG: Trigger prüfen (siehe SUPABASE-SETUP.md)
// Oder manuell anlegen:
INSERT INTO public.user_profiles (auth_id, email)
VALUES (auth.uid(), 'email@test.de');
```

### **3. "Row-level security policy violation"**
```javascript
// PROBLEM: Versuch, fremde Daten zu bearbeiten
// LÖSUNG: Nur eigene Daten bearbeiten
// user_id wird automatisch gesetzt!
```

### **4. "Storage upload failed"**
```javascript
// PROBLEM: Storage Policies fehlen
// LÖSUNG: Migration 002 ausführen
```

---

## 📊 NÜTZLICHE SQL QUERIES

### **Alle User anzeigen:**
```sql
SELECT * FROM public.user_profiles;
```

### **Alle Abrechnungen eines Users:**
```sql
SELECT * FROM public.abrechnungen
WHERE user_id = (
  SELECT id FROM public.user_profiles 
  WHERE email = 'test@mimicheck.de'
);
```

### **Ungelesene Notifications:**
```sql
SELECT * FROM public.notifications
WHERE user_id = (SELECT id FROM public.user_profiles WHERE email = 'test@mimicheck.de')
AND gelesen = false;
```

### **Storage Files eines Users:**
```sql
SELECT * FROM storage.objects
WHERE bucket_id = 'abrechnungen'
AND name LIKE 'user-uuid-here/%';
```

### **Policies prüfen:**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'abrechnungen';
```

---

## 🔧 MAINTENANCE

### **Datenbank zurücksetzen:**
```sql
-- ACHTUNG: Löscht ALLE Daten!
TRUNCATE TABLE public.abrechnungen CASCADE;
TRUNCATE TABLE public.antraege CASCADE;
TRUNCATE TABLE public.foerderleistungen CASCADE;
TRUNCATE TABLE public.notifications CASCADE;
```

### **Test-User löschen:**
```sql
DELETE FROM auth.users 
WHERE email = 'test@mimicheck.de';
-- user_profiles wird automatisch gelöscht (CASCADE)
```

### **Storage aufräumen:**
```sql
-- Alle Files eines Users löschen
DELETE FROM storage.objects
WHERE name LIKE 'user-uuid-here/%';
```

---

## 📝 CHECKLISTE

**Vor dem Coden:**
- [ ] Supabase Setup abgeschlossen (siehe SUPABASE-SETUP.md)
- [ ] Test-User angelegt
- [ ] Login funktioniert
- [ ] API Client importiert

**Beim Coden:**
- [ ] Immer `supabaseEntities.js` verwenden (nicht direkt `supabase.from()`)
- [ ] Error Handling beachten (try/catch)
- [ ] user_id wird automatisch gesetzt (nicht manuell!)
- [ ] RLS Policies beachten (nur eigene Daten!)

**Beim Testen:**
- [ ] Browser Console prüfen (Fehler?)
- [ ] Supabase Dashboard → Table Editor (Daten korrekt?)
- [ ] Supabase Dashboard → Logs (Fehler?)

---

## 🆘 HILFE

**Bei Problemen:**

1. **Supabase Logs:**
   ```
   Dashboard → Logs → Postgres Logs
   ```

2. **Browser Console:**
   ```
   F12 → Console → Fehler lesen
   ```

3. **SQL Editor:**
   ```
   Dashboard → SQL Editor → Query testen
   ```

4. **Dokumentation:**
   - `SUPABASE-SETUP.md` → Setup-Anleitung
   - `BACKEND-QUICK-REFERENCE.md` → Diese Datei

---

**VIEL ERFOLG! 🚀**
