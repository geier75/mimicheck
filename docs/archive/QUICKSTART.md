# 🚀 QUICK START - Sprint 1

> Schritt-für-Schritt Anleitung um die App in 5 Minuten zu starten

## ✅ Voraussetzungen

- Node.js 20 LTS
- Python 3.11+
- Git

---

## 🎯 WICHTIG: Zwei Server, zwei Ports!

| Server | Port | URL | Zweck |
|--------|------|-----|-------|
| **Backend (FastAPI)** | 8000 | http://localhost:8000 | API-Endpoints (JSON) |
| **Frontend (Vite)** | 8005 | http://localhost:8005 | **Web-UI (hier öffnen!)** |

⚠️ **Port 8000 zeigt nur JSON** (z.B. Health-Check) - das ist normal!  
👉 **Die App läuft auf Port 8005!**

---

## 📦 Setup in 5 Minuten

### 1. Terminal A: Backend starten

```bash
# Im Projektroot
cd backend

# Virtual Environment
python3.11 -m venv venv
source venv/bin/activate  # Mac/Linux
# oder: venv\Scripts\activate  # Windows

# Dependencies installieren
pip install -r requirements.txt
# oder minimal: pip install fastapi uvicorn python-multipart python-dotenv

# Server starten (Enhanced Version mit funktionierender Analyse)
python main_enhanced.py
```

✅ Backend läuft auf: **http://localhost:8000**  
✅ Test: `curl http://localhost:8000/health`

---

### 2. Terminal B: Frontend starten

```bash
# Im Projektroot (nicht im backend-Ordner!)

# .env.local erstellen (wichtig!)
cat > .env.local << 'EOF'
VITE_API_BASE=http://localhost:8000
VITE_MIMITECH_DISABLED=1
EOF

# Dependencies installieren
npm install

# Dev-Server starten
npm run dev
```

✅ Frontend läuft auf: **http://localhost:8005**  
👉 **Öffne im Browser: http://localhost:8005**

---

## 🌐 Die App öffnen

**RICHTIG:** http://localhost:8005 ← Web-UI  
**FALSCH:** http://localhost:8000 ← Nur API (zeigt JSON)

### Was du sehen solltest:
- ✅ Landing-Page mit Logo
- ✅ Navigation (Upload, Analyse, etc.)
- ✅ Keine `mimitech.integrations.Core` Fehler

### Falls schwarzer Bildschirm auf Port 8000:
- Das ist normal! Port 8000 ist nur die API
- Öffne stattdessen Port 8005

---

## 🧪 Testen

### Option A: Smoke Test (automatisch)

```bash
./smoke-test.sh
```

### Option B: Manuell im Browser

1. Öffne **http://localhost:8005**
2. Gehe zu "Upload" Seite
3. Wähle eine PDF-Datei
4. Upload → Analyse → Bericht sollte funktionieren

### Option C: Mit Postman

1. Importiere `postman-collection.json`
2. Führe "Health Check" aus
3. Teste Upload → Analyze → Report Sequence

---

## 🔍 Troubleshooting

### A) `mimitech.integrations.Core` ist undefined

**Problem:** Frontend erwartet MIMITECH, ist aber nicht konfiguriert.

**Lösung:**
```bash
# .env.local muss enthalten:
cat .env.local
# VITE_API_BASE=http://localhost:8000
# VITE_MIMITECH_DISABLED=1

# Falls nicht: neu erstellen
cat > .env.local << 'EOF'
VITE_API_BASE=http://localhost:8000
VITE_MIMITECH_DISABLED=1
EOF

# Frontend neu starten
pkill -f vite && npm run dev
```

Die Datei `src/api/integrations.js` nutzt dann automatisch den Backend-Fallback.

---

### B) 400 Fehler auf `logo_v2.svg`

**Problem:** Logo-Datei fehlt oder falscher Pfad.

**Lösung:**
```bash
# Logo in public/ ablegen
# Vite lädt alles aus public/ über /...
# z.B. public/logo_v2.svg → <img src="/logo_v2.svg" />

# Oder vorhandenes Logo nutzen
# src/components: Pfad anpassen auf vorhandene Datei
```

---

### C) CORS-Fehler (Requests von 8005 → 8000 blocken)

**Problem:** Browser blockiert Cross-Origin-Requests.

**Lösung:** Backend hat bereits CORS konfiguriert in `main_enhanced.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8005"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Falls Fehler: Backend neu starten und Browser-Cache leeren (⌘⇧R).

---

### D) White Screen / Nichts lädt

**Checkliste:**
1. **Browser DevTools öffnen** (⌥⌘I / F12)
   - Console: JavaScript-Fehler?
   - Network: Requests auf localhost:8000?
2. **Terminal B (Vite):** Fehler im Output?
3. **Hard Reload:** ⌘⇧R (Mac) / Ctrl+Shift+R (Win/Linux)
4. **Ports prüfen:**
   ```bash
   lsof -i :8005  # Frontend
   lsof -i :8000  # Backend
   ```

---

### Frontend startet nicht (Port belegt)

```bash
# Port 8005 freigeben
pkill -f vite
npm run dev
```

---

### Backend startet nicht (Port belegt)

```bash
# Port 8000 prüfen
lsof -ti:8000 | xargs kill -9
cd backend
source venv/bin/activate
python main_enhanced.py
```

---

### Keine Verbindung Frontend ↔ Backend

```bash
# 1. Backend Health Check
curl http://localhost:8000/health
# Sollte JSON zurückgeben: {"status":"healthy",...}

# 2. .env.local prüfen
cat .env.local
# Muss enthalten: VITE_API_BASE=http://localhost:8000

# 3. Browser DevTools → Network Tab
# Requests auf localhost:8000/api/* sichtbar?
```

---

### Module nicht gefunden

```bash
# Frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
source venv/bin/activate
pip install --force-reinstall -r requirements.txt
```

---

## ✅ Schnelltest: Ist alles verdrahtet?

### Backend:
```bash
curl -s http://localhost:8000/health
# → {"status":"healthy","version":"1.0.0",...}
```

### Frontend (Browser DevTools):
1. Öffne http://localhost:8005
2. DevTools → Network Tab
3. Navigiere zu einer Seite (z.B. Upload)
4. Du solltest Requests auf `localhost:8000/api/...` sehen (Status 200)

---

## 📋 Next Steps (Sprint 1)

Nach erfolgreichem Setup:

1. ✅ Upload funktioniert
2. ✅ Analyse läuft (mit Dummy-Daten)
3. ✅ Report wird generiert

**Jetzt implementieren:**
- [ ] Task #3: PDF-Analyse Function (echte Extraktion)
- [ ] Task #4: LLM-Analyse Function (OpenAI Integration)
- [ ] Task #5: Report-Generation (HTML → PDF)

Siehe **TASKS.md** für Details.

---

## 🎯 Akzeptanzkriterien Sprint 1

- [ ] Upload einer echten PDF funktioniert
- [ ] Analyse extrahiert Daten korrekt
- [ ] Report ist downloadbar (PDF)
- [ ] Fehlerbehandlung funktioniert
- [ ] UI zeigt alle Status korrekt an

---

**Geschätzte Zeit:** 5-10 Minuten Setup  
**Status:** ✅ Bereit für Sprint 1  
**Support:** Siehe TASKS.md oder IST-ANALYSE.md
