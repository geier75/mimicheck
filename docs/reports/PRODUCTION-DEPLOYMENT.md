# 🚀 PRODUCTION DEPLOYMENT - KOMPLETTE ANLEITUNG

## 📋 **CHECKLISTE - WAS NOCH FEHLT:**

- [ ] Supabase Projekt erstellen
- [ ] Datenbank Migrations ausführen
- [ ] Storage Buckets erstellen
- [ ] Edge Functions deployen
- [ ] Environment Variables setzen
- [ ] Frontend Build & Deploy
- [ ] Domain konfigurieren
- [ ] SSL/HTTPS aktivieren

---

## 1️⃣ **SUPABASE PROJEKT ERSTELLEN**

### **1.1 Neues Projekt anlegen:**

1. Gehe zu: https://supabase.com/dashboard
2. Klicke auf "New Project"
3. **Name:** MiMiCheck
4. **Database Password:** (Sicheres Passwort generieren!)
5. **Region:** Frankfurt (eu-central-1) - Deutschland
6. Klicke "Create new project"

**⏱️ Wartezeit:** ~2 Minuten

### **1.2 Projekt-Credentials notieren:**

```bash
# Supabase Dashboard → Settings → API

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (GEHEIM!)
```

---

## 2️⃣ **DATENBANK MIGRATIONS AUSFÜHREN**

### **2.1 Supabase CLI installieren:**

```bash
brew install supabase/tap/supabase
```

### **2.2 Login & Projekt verknüpfen:**

```bash
# Login
supabase login

# Projekt verknüpfen
cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2
supabase link --project-ref YOUR_PROJECT_ID
```

**Projekt ID:** Supabase Dashboard → Settings → General → Reference ID

### **2.3 Migrations ausführen:**

```bash
# Schema erstellen
supabase db push

# ODER manuell im SQL Editor:
# Supabase Dashboard → SQL Editor → New Query
# Kopiere Inhalt von: supabase/migrations/001_initial_schema.sql
# Klicke "Run"
```

### **2.4 Verifizieren:**

```bash
# Tabellen prüfen
supabase db list

# Sollte zeigen:
# - user_profiles
# - abrechnungen
# - anspruchspruefungen
# - foerderleistungen
# - antraege
# - dokumente
# - contact_requests
# - notifications
```

---

## 3️⃣ **STORAGE BUCKETS ERSTELLEN**

### **3.1 Buckets anlegen:**

```bash
# Im SQL Editor ausführen:
# supabase/migrations/002_storage_buckets.sql
```

**ODER manuell:**

1. Supabase Dashboard → Storage
2. Create Bucket:
   - `abrechnungen` (private)
   - `antraege` (private)
   - `nachweise` (private)
   - `avatars` (public)

### **3.2 RLS Policies setzen:**

```sql
-- Für jeden Bucket:
-- User kann eigene Dateien hochladen
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'abrechnungen' AND auth.uid()::text = (storage.foldername(name))[1]);

-- User kann eigene Dateien lesen
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'abrechnungen' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 4️⃣ **EDGE FUNCTIONS DEPLOYEN**

### **4.1 Claude API Key holen:**

1. Gehe zu: https://console.anthropic.com/
2. Erstelle API Key
3. Kopiere Key: `sk-ant-api03-...`

### **4.2 Secrets setzen:**

```bash
# Claude API Key
supabase secrets set CLAUDE_API_KEY=sk-ant-api03-YOUR-ACTUAL-KEY

# Verifizieren
supabase secrets list
```

### **4.3 Functions deployen:**

```bash
# Alle Functions deployen
supabase functions deploy analyze-eligibility
supabase functions deploy health
supabase functions deploy contact-submit

# Verifizieren
supabase functions list
```

### **4.4 Testen:**

```bash
# Health Check
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/health

# Sollte zurückgeben:
# {"status":"healthy","timestamp":"..."}
```

---

## 5️⃣ **ENVIRONMENT VARIABLES KONFIGURIEREN**

### **5.1 Frontend .env erstellen:**

```bash
# .env.production
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_URL=https://mimicheck.de
```

### **5.2 .env.example aktualisieren:**

```bash
# .env.example
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=http://localhost:8005
```

---

## 6️⃣ **FRONTEND BUILD & DEPLOY**

### **6.1 Production Build:**

```bash
# Dependencies installieren
npm install

# Production Build
npm run build

# Build testen
npm run preview
```

### **6.2 Deploy zu Vercel/Netlify:**

#### **Option A: Vercel**

```bash
# Vercel CLI installieren
npm i -g vercel

# Deploy
vercel --prod

# Environment Variables setzen:
# Vercel Dashboard → Settings → Environment Variables
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

#### **Option B: Netlify**

```bash
# Netlify CLI installieren
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Environment Variables setzen:
# Netlify Dashboard → Site Settings → Environment Variables
```

---

## 7️⃣ **DOMAIN KONFIGURIEREN**

### **7.1 Domain bei Vercel/Netlify hinzufügen:**

1. Dashboard → Domains
2. Add Domain: `mimicheck.de`
3. DNS Records hinzufügen:

```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### **7.2 SSL/HTTPS:**

- Automatisch aktiviert bei Vercel/Netlify
- Let's Encrypt Zertifikat
- Erzwinge HTTPS in Settings

---

## 8️⃣ **AUTHENTICATION KONFIGURIEREN**

### **8.1 OAuth Provider (Google):**

1. Supabase Dashboard → Authentication → Providers
2. Google aktivieren
3. **Client ID & Secret** von Google Cloud Console holen:
   - https://console.cloud.google.com/
   - APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Authorized redirect URIs:
     ```
     https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
     ```

### **8.2 Email Templates:**

1. Supabase Dashboard → Authentication → Email Templates
2. Customize:
   - Confirm Signup
   - Magic Link
   - Reset Password

---

## 9️⃣ **TESTING CHECKLIST**

### **9.1 Backend Tests:**

- [ ] User Registration funktioniert
- [ ] User Login funktioniert
- [ ] Edge Functions erreichbar
- [ ] Datenbank Queries funktionieren
- [ ] File Upload funktioniert
- [ ] RLS Policies greifen

### **9.2 Frontend Tests:**

- [ ] Landing Page lädt
- [ ] Navigation funktioniert
- [ ] Forms funktionieren
- [ ] API Calls funktionieren
- [ ] Bilder laden
- [ ] Responsive Design OK

### **9.3 Performance Tests:**

```bash
# Lighthouse Score
npm run build
npx lighthouse https://mimicheck.de --view

# Ziel:
# Performance: >90
# Accessibility: >90
# Best Practices: >90
# SEO: >90
```

---

## 🔟 **MONITORING & ANALYTICS**

### **10.1 Supabase Monitoring:**

- Dashboard → Reports
- API Usage
- Database Performance
- Edge Function Logs

### **10.2 Error Tracking (Optional):**

```bash
# Sentry installieren
npm install @sentry/react

# .env
VITE_SENTRY_DSN=https://...
```

---

## 📊 **DEPLOYMENT SCRIPT (ALLES AUF EINMAL)**

```bash
#!/bin/bash

echo "🚀 MiMiCheck Production Deployment"
echo "===================================="

# 1. Supabase Setup
echo "1️⃣ Supabase Setup..."
supabase link --project-ref YOUR_PROJECT_ID
supabase db push
supabase secrets set CLAUDE_API_KEY=$CLAUDE_API_KEY
supabase functions deploy analyze-eligibility
supabase functions deploy health
supabase functions deploy contact-submit

# 2. Frontend Build
echo "2️⃣ Frontend Build..."
npm install
npm run build

# 3. Deploy
echo "3️⃣ Deploying..."
vercel --prod

echo "✅ Deployment Complete!"
echo "🌐 Live URL: https://mimicheck.de"
```

---

## ⚠️ **WICHTIGE SICHERHEITS-CHECKS**

### **Vor Go-Live:**

- [ ] `.env` NICHT in Git committen
- [ ] Service Role Key NIEMALS im Frontend verwenden
- [ ] RLS Policies aktiviert für alle Tabellen
- [ ] CORS korrekt konfiguriert
- [ ] Rate Limiting aktiviert
- [ ] Backup-Strategie definiert

---

## 🎯 **QUICK START (5 MINUTEN)**

```bash
# 1. Supabase Projekt erstellen (Web UI)
# 2. Credentials kopieren

# 3. Migrations ausführen
supabase link --project-ref YOUR_PROJECT_ID
supabase db push

# 4. Claude Key setzen
supabase secrets set CLAUDE_API_KEY=sk-ant-api03-...

# 5. Functions deployen
supabase functions deploy analyze-eligibility

# 6. Frontend deployen
npm run build
vercel --prod

# FERTIG! 🎉
```

---

## 📞 **SUPPORT & HILFE**

### **Wenn etwas nicht funktioniert:**

1. **Logs prüfen:**
   ```bash
   supabase functions logs analyze-eligibility
   ```

2. **Database prüfen:**
   ```bash
   supabase db list
   ```

3. **Secrets prüfen:**
   ```bash
   supabase secrets list
   ```

---

**BEREIT FÜR DEPLOYMENT? Sag mir welchen Schritt du als erstes machen möchtest!** 🚀
