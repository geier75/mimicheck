# 🚨 HOTFIX: Auth-Redirect Problem

**Problem:** Nach Login wird zu `http://localhost:3001/auth-bridge` statt zu `http://localhost:8005/auth-bridge` weitergeleitet.

**Ursache:** Der Dev-Server der Landing-Page wurde gestartet, BEVOR die `.env`-Datei erstellt wurde. Vite lädt ENV-Variablen nur beim Server-Start.

---

## ✅ Lösung 1: Server Neu Starten (EMPFOHLEN)

### Schritt 1: Landing-Page Server stoppen und neu starten

**Terminal mit `pnpm dev` (Port 3001):**

```bash
# 1. Server stoppen
Strg+C  (oder Cmd+C auf Mac)

# 2. Server neu starten
pnpm dev
```

### Schritt 2: Testen

1. Browser öffnen: `http://localhost:3001/landing/auth`
2. Mit Credentials anmelden
3. **Erwartetes Verhalten:** Weiterleitung zu `http://localhost:8005/auth-bridge?access_token=...`

---

## ✅ Lösung 2: Temporärer Hard-Code Fix (Falls Server-Neustart nicht möglich)

Wenn Sie den Server aus irgendeinem Grund nicht neu starten können:

### Datei: `mimicheck-landing/client/src/pages/Auth.tsx`

**Zeile 40 ändern von:**
```typescript
const mainUrl = (import.meta as any).env?.VITE_MAIN_APP_URL || 'http://localhost:8005';
```

**Zu:**
```typescript
const mainUrl = 'http://localhost:8005'; // Hardcoded - temporär
```

**Wichtig:** Dies ist nur eine temporäre Lösung. Bei Deployment wird die ENV-Variable korrekt geladen.

---

## 🔍 Verifizierung

Nach dem Neustart können Sie die ENV-Variable überprüfen:

```bash
cd mimicheck-landing
cat .env
```

Sollte anzeigen:
```
# Main Application URL - where to redirect after authentication
VITE_MAIN_APP_URL=http://localhost:8005

# Other environment variables
NODE_ENV=development
```

---

## 📋 Checkliste

- [ ] Landing-Page Server gestoppt (Strg+C)
- [ ] Landing-Page Server neu gestartet (`pnpm dev`)
- [ ] Browser-Cache geleert (Strg+Shift+R oder Cmd+Shift+R)
- [ ] Login getestet auf `http://localhost:3001/landing/auth`
- [ ] Weiterleitung zu `http://localhost:8005/auth-bridge` funktioniert

---

## ⚠️ Bekannte Probleme

### Problem: Weiterleitung geht noch zu Port 3001

**Mögliche Ursachen:**
1. **Server wurde nicht neu gestartet**
   - Lösung: Terminal schließen, neu öffnen, `cd mimicheck-landing && pnpm dev`

2. **Browser-Cache**
   - Lösung: Hard Reload (Strg+Shift+R oder Cmd+Shift+R)

3. **Falsche Terminal-Session**
   - Lösung: Stellen Sie sicher, dass Sie den richtigen Terminal-Tab mit `pnpm dev` neu starten

### Problem: Black Screen auf auth-bridge

**Mögliche Ursachen:**
1. **Hauptapp (Port 8005) läuft nicht**
   - Lösung: Anderes Terminal öffnen, `npm run dev` starten

2. **Auth-Bridge Route fehlt**
   - Lösung: Bereits vorhanden in `src/pages/index.jsx`

---

## 🎯 Erwartetes Verhalten nach Fix

1. User meldet sich an auf: `http://localhost:3001/landing/auth`
2. Nach erfolgreicher Auth: Weiterleitung zu `http://localhost:8005/auth-bridge?access_token=...&refresh_token=...`
3. AuthBridge setzt Session
4. Weiterleitung zu: `http://localhost:8005/onboarding`

**Keine Black Screens mehr!** ✅

---

## 🚀 Beide Server müssen laufen

```bash
# Terminal 1: Landing-Page (nach Neustart!)
cd mimicheck-landing
pnpm dev
# → http://localhost:3001

# Terminal 2: Hauptanwendung
cd ..
npm run dev  
# → http://localhost:8005
