# 🔧 BACKEND-INTEGRATION PLAN

## 📊 ÜBERSICHT

**Datum:** 14.11.2025, 13:40 Uhr  
**Ziel:** Backend-Anbindung vorbereiten & schrittweise integrieren  
**Status:** Backend-Code vorhanden, nicht deployed  
**Dauer:** 2-4 Wochen (je nach Priorität)

---

## 🎯 STRATEGISCHER ANSATZ

### **HYBRID-MODUS (Empfohlen)**

```
Phase 1 (JETZT): Mock-Frontend + Backend-Vorbereitung
Phase 2 (Woche 1-2): Backend Deployment + Datenbank
Phase 3 (Woche 2-3): Schrittweise Feature-Aktivierung
Phase 4 (Woche 3-4): Vollständige Migration

→ App bleibt die ganze Zeit funktionsfähig!
```

---

## ✅ WAS HABEN WIR (BACKEND)

### **Vorhandener Code:**

```python
backend/
├── main.py                 ✅ FastAPI Setup (6KB)
├── main_enhanced.py        ✅ Enhanced Version (20KB)
├── forms_api.py            ✅ PDF Forms API (9KB)
├── llm_api.py              ✅ LLM Integration (6KB)
├── services/               ✅ Services
│   ├── pdf_extractor.py    ✅ PDF Parsing
│   ├── pdf_filler.py       ✅ PDF Filling
│   └── ...                 ✅ Mehr Services
├── requirements.txt        ✅ Dependencies
└── .env.example            ✅ Config-Template

Status: ✅ Code vorhanden, ❌ NICHT deployed
```

### **API-Endpunkte (main.py):**

```python
✅ GET  /              - Health Check
✅ GET  /health        - Health Check
✅ POST /api/upload    - File Upload
✅ POST /api/analyze   - Analyse starten
✅ POST /api/report    - Report generieren
✅ POST /api/checkout  - Stripe Checkout
✅ GET  /api/portal    - Billing Portal

Status: Implementiert, aber NICHT deployed
```

---

## 🔴 WAS FEHLT (KRITISCH)

### **1. Deployment**

```bash
❌ Backend läuft nur lokal (nicht deployed)
❌ Keine öffentliche API-URL
❌ Frontend kann nicht zugreifen

Lösungen:
- Option A: Fly.io (kostenlos, einfach)
- Option B: Railway (kostenlos, einfach)
- Option C: Render (kostenlos, langsam)
- Option D: AWS/GCP (komplex, $$$)

EMPFEHLUNG: Fly.io oder Railway
```

### **2. Datenbank**

```bash
❌ Keine PostgreSQL
❌ Keine Redis
❌ Nur LocalStorage

Lösungen:
- Supabase PostgreSQL ✅ (empfohlen)
- Fly.io PostgreSQL
- Neon.tech (Serverless)

EMPFEHLUNG: Supabase (bereits vorbereitet)
```

### **3. File Storage**

```bash
❌ Keine S3/Storage
❌ Uploads gehen verloren

Lösungen:
- Supabase Storage ✅ (empfohlen)
- AWS S3
- Cloudflare R2

EMPFEHLUNG: Supabase Storage
```

### **4. Authentifizierung**

```bash
❌ Keine echte Auth
❌ Nur Mock-User

Lösungen:
- Supabase Auth ✅ (empfohlen)
- Auth0
- Firebase Auth
- Custom JWT

EMPFEHLUNG: Supabase Auth
```

---

## 📋 PHASE 1: BACKEND DEPLOYMENT (Woche 1)

### **Schritt 1: Supabase Project Setup**

```bash
# 1. Supabase Account erstellen
https://supabase.com

# 2. New Project erstellen
Name: mimicheck
Region: Frankfurt (näher zu Deutschland)
Database Password: [sicheres Passwort]

# 3. Project URL & Keys kopieren
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

Zeit: 10 Minuten
```

### **Schritt 2: Database Schema**

```sql
-- users (Supabase Auth managed)
-- profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  birth_date DATE,
  housing_type TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- abrechnungen
CREATE TABLE abrechnungen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  titel TEXT NOT NULL,
  abrechnungszeitraum TEXT,
  adresse TEXT,
  gesamtkosten DECIMAL,
  rueckforderung_potential DECIMAL,
  analyse_status TEXT DEFAULT 'pending',
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- fehler
CREATE TABLE fehler (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  abrechnung_id UUID REFERENCES abrechnungen(id),
  kategorie TEXT,
  beschreibung TEXT,
  betrag DECIMAL,
  schweregrad TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- antraege
CREATE TABLE antraege (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  titel TEXT NOT NULL,
  kategorie TEXT,
  status TEXT DEFAULT 'pending',
  betrag DECIMAL,
  beschreibung TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

Zeit: 30 Minuten (Copy-Paste im Supabase SQL Editor)
```

### **Schritt 3: Edge Functions deployen**

```bash
# Supabase CLI installieren
npm install -g supabase

# Login
supabase login

# Link zum Project
supabase link --project-ref YOUR_PROJECT_REF

# Functions deployen
cd supabase/functions
supabase functions deploy analyze-document
supabase functions deploy analyze-eligibility
supabase functions deploy chat-assistant
supabase functions deploy process-upload

Zeit: 20 Minuten
```

### **Schritt 4: FastAPI Backend deployen (Optional)**

```bash
# Option A: Fly.io
fly launch
fly deploy

# Option B: Railway
railway init
railway up

# Option C: Render
# Web-Interface verwenden

Zeit: 30 Minuten
```

**ODER:** Nur Supabase Edge Functions nutzen (empfohlen!)

---

## 📋 PHASE 2: FRONTEND-INTEGRATION (Woche 2)

### **Schritt 1: Supabase Client Setup**

```javascript
// src/api/supabaseClient.js (UPDATE)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth Helpers
export async function signUp(email, password, userData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
  return { data, error };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

### **Schritt 2: Environment Variables**

```bash
# .env.local (ERSTELLEN)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_API_BASE=https://xxx.supabase.co

# .env.local.example (UPDATE)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE=your_api_url
```

### **Schritt 3: Hybrid-Client (Mock + Real)**

```javascript
// src/api/hybridClient.js (NEU ERSTELLEN)

import { supabase } from './supabaseClient';
import { localClient } from './localClient';

const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';

export const hybridClient = {
  entities: {
    Abrechnung: {
      async list() {
        if (USE_BACKEND) {
          const { data, error } = await supabase
            .from('abrechnungen')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) {
            console.warn('Backend failed, fallback to local:', error);
            return localClient.entities.Abrechnung.list();
          }
          return data;
        }
        return localClient.entities.Abrechnung.list();
      },

      async get(id) {
        if (USE_BACKEND) {
          const { data, error } = await supabase
            .from('abrechnungen')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) {
            console.warn('Backend failed, fallback to local:', error);
            return localClient.entities.Abrechnung.get(id);
          }
          return data;
        }
        return localClient.entities.Abrechnung.get(id);
      },

      async create(data) {
        if (USE_BACKEND) {
          const { data: result, error } = await supabase
            .from('abrechnungen')
            .insert(data)
            .select()
            .single();
          
          if (error) {
            console.warn('Backend failed, fallback to local:', error);
            return localClient.entities.Abrechnung.create(data);
          }
          return result;
        }
        return localClient.entities.Abrechnung.create(data);
      },

      async update(id, data) {
        if (USE_BACKEND) {
          const { data: result, error } = await supabase
            .from('abrechnungen')
            .update(data)
            .eq('id', id)
            .select()
            .single();
          
          if (error) {
            console.warn('Backend failed, fallback to local:', error);
            return localClient.entities.Abrechnung.update(id, data);
          }
          return result;
        }
        return localClient.entities.Abrechnung.update(id, data);
      },

      async delete(id) {
        if (USE_BACKEND) {
          const { error } = await supabase
            .from('abrechnungen')
            .delete()
            .eq('id', id);
          
          if (error) {
            console.warn('Backend failed, fallback to local:', error);
            return localClient.entities.Abrechnung.delete(id);
          }
          return { success: true };
        }
        return localClient.entities.Abrechnung.delete(id);
      }
    }
  },

  auth: USE_BACKEND ? {
    async me() {
      const user = await getCurrentUser();
      if (!user) return localClient.auth.me();
      
      // Get profile from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return profile || localClient.auth.me();
    },

    async updateMe(data) {
      const user = await getCurrentUser();
      if (!user) return localClient.auth.updateMe(data);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        console.warn('Backend failed, fallback to local:', error);
        return localClient.auth.updateMe(data);
      }
      return profile;
    }
  } : localClient.auth
};
```

### **Schritt 4: Schrittweise Migration**

```javascript
// In allen Pages:
// VORHER:
import { localClient } from '@/api/localClient';
const abrechnungen = await localClient.entities.Abrechnung.list();

// NACHHER (Schritt 1):
import { hybridClient } from '@/api/hybridClient';
const abrechnungen = await hybridClient.entities.Abrechnung.list();

// Umgebungsvariable steuert Backend/Mock:
VITE_USE_BACKEND=false  → Mock (default)
VITE_USE_BACKEND=true   → Backend (nach Deployment)
```

---

## 📋 PHASE 3: FEATURE-AKTIVIERUNG (Woche 2-3)

### **Feature Rollout:**

```
Week 2:
✅ Auth (Supabase)
✅ User Profiles
✅ CRUD: Abrechnungen

Week 3:
✅ File Upload (Supabase Storage)
✅ PDF Analysis (Edge Function)
✅ LLM Integration
✅ Reports

Week 4:
✅ Stripe Payment
✅ Webhooks
✅ E-Mail Service
✅ Final Testing
```

---

## 🎯 PRIORITÄTEN

### **P0 - Kritisch (Woche 1)**

```
1. Supabase Setup ✅
2. Database Schema ✅
3. Basic Auth ✅
4. Hybrid-Client ✅
```

### **P1 - Wichtig (Woche 2)**

```
5. File Upload ✅
6. CRUD Operations ✅
7. Edge Functions Deploy ✅
```

### **P2 - Nice-to-Have (Woche 3-4)**

```
8. LLM Integration
9. Payment
10. E-Mail
11. Webhooks
```

---

## 📊 ROLLOUT-STRATEGIE

### **Feature Flags:**

```javascript
// config.js
export const FEATURES = {
  USE_BACKEND: import.meta.env.VITE_USE_BACKEND === 'true',
  USE_AUTH: import.meta.env.VITE_USE_AUTH === 'true',
  USE_STORAGE: import.meta.env.VITE_USE_STORAGE === 'true',
  USE_LLM: import.meta.env.VITE_USE_LLM === 'true',
  USE_PAYMENTS: import.meta.env.VITE_USE_PAYMENTS === 'true'
};

// In Components:
if (FEATURES.USE_BACKEND) {
  // Real API call
} else {
  // Mock data
}
```

### **A/B Testing:**

```javascript
// 10% der User auf Backend, 90% Mock
const USE_BACKEND = Math.random() < 0.1;
```

---

## ✅ SUCCESS CRITERIA

### **Phase 1 (Backend Deployment):**

```
□ Supabase Project erstellt
□ Database Schema deployed
□ Edge Functions deployed
□ API erreichbar
□ Health Check funktioniert
```

### **Phase 2 (Frontend Integration):**

```
□ Hybrid-Client implementiert
□ Auth funktioniert
□ CRUD Operations funktionieren
□ Feature Flags aktiv
□ Mock-Fallback funktioniert
```

### **Phase 3 (Feature Rollout):**

```
□ File Upload funktioniert
□ PDF Analysis funktioniert
□ Reports generierbar
□ Payment funktioniert
□ E-Mails werden verschickt
```

---

## 🚀 QUICK START

### **JETZT sofort starten:**

```bash
# 1. Supabase Account erstellen
https://supabase.com

# 2. New Project
→ Follow Wizard

# 3. SQL Editor öffnen
→ Database Schema copy-pasten

# 4. Edge Functions deployen
npm install -g supabase
supabase login
supabase link
supabase functions deploy

# 5. .env.local erstellen
cp .env.local.example .env.local
# → URLs/Keys einfügen

# 6. Hybrid-Client erstellen
# → Code von oben copy-pasten

# 7. Testen
VITE_USE_BACKEND=true npm run dev

Zeit: 2-3 Stunden für komplettes Setup!
```

---

## 💡 EMPFEHLUNG

### **Parallel-Strategie:**

```
Heute:     WebGL Landing Page (2h)
Morgen:    Supabase Setup (3h)
Tag 3-5:   Database + Auth (2 Tage)
Tag 6-10:  Feature Migration (1 Woche)
Tag 11-14: Testing + Polish (3-4 Tage)

TOTAL: 2 Wochen bis Production-Ready!
```

---

**Erstellt:** 14.11.2025, 13:50 Uhr  
**Von:** Cascade AI  
**Status:** ✅ READY TO EXECUTE  
**Nächster Schritt:** User Decision
