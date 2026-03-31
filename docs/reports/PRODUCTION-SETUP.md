# 🚀 PRODUCTION SETUP - KEINE MOCKS!

**Vollständige App mit echten Services ohne Test-Daten**

---

## 📋 Übersicht

Diese Anleitung zeigt, wie du die App **production-ready** machst:
- ✅ **Echte OpenAI Integration** (kein Mock-LLM)
- ✅ **Echte PDF-Extraktion** (pdfplumber + pdfminer)
- ✅ **Echte PDF-Befüllung** (AcroForm + HTML-Fallback)
- ✅ **Backend REST-API** (FastAPI)
- ✅ **Frontend Integration** (React)

---

## 🎯 SCHRITT 1: OpenAI API Key erstellen

### 1.1 OpenAI Account erstellen
1. Gehe zu https://platform.openai.com/
2. Registriere dich oder logge dich ein
3. Gehe zu **API Keys** → https://platform.openai.com/api-keys
4. Klicke **"Create new secret key"**
5. Kopiere den Key (beginnt mit `sk-...`)

### 1.2 Billing aktivieren
⚠️ **WICHTIG:** Du musst Billing aktivieren, sonst funktioniert die API nicht!

1. Gehe zu **Billing** → https://platform.openai.com/account/billing/overview
2. Klicke **"Add payment method"**
3. Füge Kreditkarte hinzu
4. Lade Guthaben auf (minimum $5)

**Kosten-Beispiel (gpt-4o-mini):**
- ~$0.15 pro 1M Input-Tokens
- ~$0.60 per 1M Output-Tokens
- **1 Chat-Nachricht ≈ $0.001** (sehr günstig!)

---

## 🎯 SCHRITT 2: Backend Setup

### 2.1 .env Datei erstellen

```bash
cd backend
cp .env.example .env
```

### 2.2 .env editieren

Öffne `backend/.env` und füge deinen OpenAI Key ein:

```bash
# OpenAI API (REQUIRED!)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.7

# Server
API_HOST=0.0.0.0
API_PORT=8000
CORS_ALLOW_ORIGINS=http://localhost:8005,http://localhost:5173

# Logging
LOG_LEVEL=INFO
DEBUG=true
```

### 2.3 Dependencies installieren

```bash
cd backend

# Virtuelle Umgebung erstellen (empfohlen)
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# oder: venv\Scripts\activate  # Windows

# Dependencies installieren
pip install --upgrade pip
pip install -r requirements.txt
```

**Wichtigste Dependencies:**
- `openai>=1.10.0` - OpenAI API Client
- `fastapi` - Web Framework
- `pdfplumber` - PDF Extraktion
- `pdfrw` - PDF Befüllung
- `weasyprint` - HTML→PDF

### 2.4 Backend starten

```bash
python -m uvicorn main_enhanced:app --reload --host 127.0.0.1 --port 8000
```

**Erwartete Ausgabe:**
```
INFO:     ✅ Forms API mounted at /api/forms
INFO:     ✅ LLM API mounted at /api/llm
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**API Docs:** http://localhost:8000/docs

---

## 🎯 SCHRITT 3: Frontend Setup

### 3.1 .env Datei anpassen

Öffne `.env` im Root-Verzeichnis:

```bash
# Backend API
VITE_API_BASE=http://localhost:8000

# MIMITECH (Optional - kann deaktiviert bleiben)
VITE_MIMITECH_DISABLED=1

# Server
VITE_HOST=127.0.0.1
VITE_PORT=8005
```

### 3.2 Frontend starten

```bash
# Im Root-Verzeichnis
npm install
npm run dev
```

**Erwartete Ausgabe:**
```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:8005/
```

---

## 🎯 SCHRITT 4: Testen

### 4.1 LLM-Service testen (Backend)

```bash
# Health Check
curl http://localhost:8000/api/llm/health

# Erwartete Ausgabe:
# {"status":"available","openai_configured":true,"model":"gpt-4o-mini"}
```

```bash
# Chat-Anfrage
curl -X POST http://localhost:8000/api/llm/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Was sind meine Rechte als Mieter?",
    "user_tier": "free"
  }'
```

### 4.2 PDF-Extraktion testen

```bash
# 1. PDF hochladen
curl -X POST http://localhost:8000/api/upload \
  -F "file=@/pfad/zu/deiner/abrechnung.pdf"

# Response: {"abrechnung_id":"abr_xxx","file_url":"...","status":"uploaded"}

# 2. Daten extrahieren
curl -X POST http://localhost:8000/api/extract-data/abr_xxx

# Response: {"success":true,"data":{"titel":"...","positionen":[...]}}
```

### 4.3 Forms API testen

```bash
# PDF-Formular extrahieren
curl -X POST http://localhost:8000/api/forms/extract \
  -F "file=@/pfad/zu/formular.pdf"

# Formular befüllen (nach Extraktion)
curl -X POST http://localhost:8000/api/forms/fill/{upload_id} \
  -H "Content-Type: application/json" \
  -d '{
    "mappings": [
      {"field_id": "vorname", "value": "Max"},
      {"field_id": "nachname", "value": "Mustermann"}
    ],
    "title": "Ausgefülltes Formular"
  }'

# Download: http://localhost:8000/outputs/forms/filled_xxx.pdf
```

### 4.4 Frontend testen

1. Öffne http://localhost:8005
2. **Upload-Test:**
   - Gehe zu `/upload`
   - Drag & Drop eine PDF-Nebenkostenabrechnung
   - ✅ Sollte echte Daten extrahieren (Titel, Positionen, Gesamtkosten)
   
3. **Chat-Test:**
   - Gehe zu `/assistent`
   - Stelle eine Frage: *"Was sind meine Rechte als Mieter?"*
   - ✅ Sollte echte OpenAI-Antwort bekommen (kein Mock!)

4. **Forms-Test** (optional):
   - Teste PDF-Formular-Upload & Befüllung

---

## ✅ ERFOLGS-CHECKLISTE

- [ ] OpenAI API Key in `backend/.env` gesetzt
- [ ] Backend läuft auf http://localhost:8000
- [ ] `/api/llm/health` zeigt `"status":"available"`
- [ ] Frontend läuft auf http://localhost:8005
- [ ] Chat-Assistent gibt echte Antworten (nicht "Testmodus aktiv")
- [ ] PDF-Upload extrahiert echte Daten
- [ ] Keine "Mock" Warnungen in Console

---

## 🔧 TROUBLESHOOTING

### Problem: "OpenAI API nicht konfiguriert"

**Lösung:**
1. Prüfe `backend/.env` → `OPENAI_API_KEY` gesetzt?
2. Backend neu starten: `Ctrl+C` → `python -m uvicorn main_enhanced:app --reload ...`
3. Health Check: `curl http://localhost:8000/api/llm/health`

### Problem: "ExtractDataFromUploadedFile Mock"

**Lösung:**
- Diese Warnung erscheint nur, wenn du direkt `localClient.js` importierst
- ✅ Nutze stattdessen `integrations.js` (bereits korrigiert)
- Lösche Browser-Cache: `Shift+F5`

### Problem: "pdfplumber not found"

**Lösung:**
```bash
cd backend
pip install pdfplumber pdfminer.six pdfrw pikepdf weasyprint
```

### Problem: "CORS Error"

**Lösung:**
- Prüfe `backend/.env` → `CORS_ALLOW_ORIGINS` enthält `http://localhost:8005`
- Backend neu starten

### Problem: OpenAI Kosten-Check

**So checkst du deine Usage:**
1. Gehe zu https://platform.openai.com/usage
2. Siehst du API-Calls? ✅ Dann funktioniert es!
3. Filter nach Model: `gpt-4o-mini`

---

## 📊 API ENDPOINTS ÜBERSICHT

### LLM API (`/api/llm`)
```
GET  /api/llm/health                   # Status Check
POST /api/llm/invoke                   # Generische LLM-Anfrage
POST /api/llm/chat                     # Chat-Assistent
POST /api/llm/analyze-nebenkosten      # Nebenkosten-Analyse mit KI
```

### Forms API (`/api/forms`)
```
POST   /api/forms/extract              # PDF-Formular extrahieren
POST   /api/forms/fill/{id}            # Formular befüllen
POST   /api/forms/extract-and-fill     # Extract + Fill in einem
GET    /api/forms/schema/{id}          # Schema abrufen
DELETE /api/forms/form/{id}            # Formular löschen
GET    /api/forms/health               # Status
```

### Upload & Analysis
```
POST /api/upload                       # PDF hochladen
POST /api/extract-data/{id}            # Echte Daten extrahieren (pdfplumber)
POST /api/analyze                      # Analyse durchführen
GET  /api/report/{id}                  # Report abrufen
```

---

## 🎯 NÄCHSTE SCHRITTE (OPTIONAL)

### Phase 2: Erweiterte Features
1. **Database:** PostgreSQL statt In-Memory
2. **Email:** SendGrid/SMTP für Benachrichtigungen
3. **Auth:** User-Login mit JWT
4. **Stripe:** Subscription-Management
5. **Meilisearch:** Form-Finder (30 Top-Anträge)

### Phase 3: Deployment
1. **Backend:** Railway/Render/Fly.io
2. **Frontend:** Vercel/Netlify
3. **Domain:** Custom Domain + SSL
4. **Monitoring:** Sentry + Uptime monitoring

---

## 💰 KOSTEN-ÜBERSICHT

### OpenAI gpt-4o-mini (empfohlen)
- **Chat:** ~$0.001 pro Nachricht
- **PDF-Analyse:** ~$0.005 pro Abrechnung
- **100 Chat-Nachrichten:** ~$0.10
- **1000 Analysen:** ~$5.00

### Alternative: gpt-4o (teurer, bessere Qualität)
- **Chat:** ~$0.01 pro Nachricht
- **PDF-Analyse:** ~$0.05 pro Abrechnung

**Empfehlung für Start:** gpt-4o-mini (sehr günstig & gut genug!)

---

## 📚 DOKUMENTATION

- **API Docs (Swagger):** http://localhost:8000/docs
- **OpenAI Docs:** https://platform.openai.com/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **Forms API:** Siehe `FORMS-API-README.md`

---

## ✅ STATUS: PRODUCTION-READY!

Du hast jetzt eine **vollständige App ohne Mocks**:
- ✅ Echte OpenAI KI-Integration
- ✅ Echte PDF-Extraktion & Befüllung
- ✅ REST-API Backend
- ✅ React Frontend

**Los geht's! 🚀**
