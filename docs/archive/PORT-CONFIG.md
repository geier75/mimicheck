# 🔌 PORT KONFIGURATION - MimiCheck

## **📊 PORT-ÜBERSICHT**

| Service | Port | URL | Beschreibung |
|---------|------|-----|--------------|
| **Hauptapp** | 8005 | http://localhost:8005 | React Vite App (Dashboard, Features) |
| **Landing Page** | 3000 | http://localhost:3000/landing | Marketing Website, Auth |
| **Backend API** | 8000 | http://localhost:8000 | FastAPI (optional, falls benötigt) |

---

## **🔄 REDIRECT-FLOW**

### **1. Root-URL (http://localhost:8005/)**
```
http://localhost:8005/
    ↓
LandingPage.jsx (Component)
    ↓
window.location.href = 'http://localhost:3000/landing'
    ↓
Landing Page wird geladen
```

### **2. Auth-Flow**
```
http://localhost:3000/landing/#auth
    ↓
User meldet sich an
    ↓
window.location.href = 'http://localhost:8005/auth-bridge?access_token=...'
    ↓
AuthBridge.jsx setzt Session
    ↓
window.location.replace('/onboarding')
    ↓
http://localhost:8005/onboarding
```

---

## **⚙️ ENVIRONMENT VARIABLES**

### **Hauptapp (.env)**
```bash
# Port der Hauptapp
VITE_PORT=8005

# Landing Page URL für Redirects
VITE_LANDING_URL=http://localhost:3000/landing

# Supabase Config
VITE_SUPABASE_URL=https://yjjauvmjyhlxcoumwqlj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### **Landing Page (mimicheck-landing/.env)**
```bash
# Port der Landing Page
PORT=3000

# Hauptapp URL für Auth-Weiterleitung
VITE_MAIN_APP_URL=http://localhost:8005

# Supabase Config (gleich wie Hauptapp)
VITE_SUPABASE_URL=https://yjjauvmjyhlxcoumwqlj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## **🚀 SERVER STARTEN**

### **Terminal 1: Hauptapp**
```bash
cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2
npm run dev
# → Läuft auf http://localhost:8005
```

### **Terminal 2: Landing Page**
```bash
cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2/mimicheck-landing
npm run dev
# → Läuft auf http://localhost:3000
```

---

## **🔧 WICHTIGE DATEIEN**

| Datei | Funktion |
|-------|----------|
| `src/pages/LandingPage.jsx` | Leitet von Port 8005 zu 3000 weiter |
| `src/pages/AuthBridge.jsx` | Empfängt Auth-Tokens von Landing Page |
| `mimicheck-landing/client/src/pages/Auth.tsx` | Login-Seite der Landing Page |
| `vite.config.js` | Hauptapp Port-Konfiguration (8005) |
| `mimicheck-landing/vite.config.ts` | Landing Page Config |

---

## **❓ HÄUFIGE PROBLEME**

### **Problem: Port 8005 leitet zu Port 3001 weiter**
**Ursache:** Falscher Default-Port in `LandingPage.jsx`
**Lösung:** ✅ Bereits behoben - jetzt Port 3000

### **Problem: Landing Page lädt nicht**
**Prüfe:**
1. Läuft Port 3000? → `lsof -i :3000`
2. Ist der Server gestartet? → `cd mimicheck-landing && npm run dev`
3. CORS aktiviert? → Ja, in `vite.config.js`

### **Problem: Auth funktioniert nicht**
**Prüfe:**
1. Beide Server laufen (8005 + 3000)
2. Supabase Keys sind identisch
3. Browser-Console für Fehler checken

---

## **✅ AKTUELLER STATUS**

- ✅ Port 8005 → Hauptapp läuft
- ✅ Port 3000 → Landing Page läuft
- ✅ Redirect von 8005 zu 3000 funktioniert
- ✅ Auth-Flow von 3000 zu 8005 konfiguriert
- ✅ CORS aktiviert
- ✅ Debug-Logging aktiviert

---

**Alle Ports sind korrekt konfiguriert! 🎉**
