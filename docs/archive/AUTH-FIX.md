# 🔐 AUTH-WEITERLEITUNG FIX

## ✅ WAS ICH GEMACHT HABE:

1. **CORS aktiviert** in der Hauptapp (vite.config.js)
   - Port 3000 und 3001 sind jetzt erlaubt
   - Credentials werden akzeptiert

2. **Environment Variables dokumentiert**
   - `.env.example` für beide Apps erstellt
   - Alle nötigen Variablen aufgelistet

3. **Server neu gestartet** mit CORS-Support

## 🚨 WAS DU JETZT MACHEN MUSST:

### **1. Landing Page .env erstellen**
```bash
cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2/mimicheck-landing
cp .env.example .env
```

**Wichtigste Variable:**
```
VITE_MAIN_APP_URL=http://localhost:8005
```

### **2. Landing Page Server neu starten**
```bash
# Stoppe den alten Server (Ctrl+C im Terminal)
# Dann:
cd mimicheck-landing
npm run dev
```

### **3. Hauptapp .env prüfen**
Stelle sicher, dass diese Datei existiert:
```bash
cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2
cp .env.example .env
```

## 🎯 AUTH-FLOW:

1. **Landing Page** (http://localhost:3000/landing/#auth)
   - User meldet sich an
   - Supabase gibt Tokens zurück

2. **Weiterleitung** zu Hauptapp
   - Landing Page leitet zu: `http://localhost:8005/auth-bridge?access_token=...&refresh_token=...`
   - Mit den Tokens als Query-Parameter

3. **AuthBridge** (http://localhost:8005/auth-bridge)
   - Empfängt Tokens
   - Setzt Supabase Session
   - Leitet weiter zu `/onboarding`

4. **Onboarding** (http://localhost:8005/onboarding)
   - User ist eingeloggt!

## 🐛 FEHLERQUELLEN:

### **Problem 1: "OAuth Server URL nicht konfiguriert"**
**Lösung:** In `mimicheck-landing/.env` setzen:
```
OAUTH_SERVER_URL=http://localhost:3000
```

### **Problem 2: Weiterleitung funktioniert nicht**
**Lösung:** In `mimicheck-landing/.env` setzen:
```
VITE_MAIN_APP_URL=http://localhost:8005
```

### **Problem 3: Session wird nicht gesetzt**
**Lösung:** Beide Apps müssen dieselben Supabase-Keys verwenden:
```
VITE_SUPABASE_URL=https://yjjauvmjyhlxcoumwqlj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqamF1dm1qeWhseGNvdW13cWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mzc4NzgsImV4cCI6MjA3ODAxMzg3OH0.A8e7YwJA6VJ0fTJJt8TBVRT4vktVxB1DFL8U5RLTzZg
```

## ✨ QUICK-TEST:

1. Öffne: http://localhost:3000/landing/#auth
2. Melde dich an
3. Du solltest automatisch zu http://localhost:8005/onboarding weitergeleitet werden

## 🚀 BEIDE SERVER MÜSSEN LAUFEN:

**Terminal 1:**
```bash
cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2
npm run dev
# Läuft auf Port 8005
```

**Terminal 2:**
```bash
cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2/mimicheck-landing
npm run dev
# Läuft auf Port 3000
```

---

**STATUS:** Server läuft mit CORS-Support. Du musst nur noch die .env Dateien konfigurieren!
