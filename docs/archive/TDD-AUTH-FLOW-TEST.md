# 🧪 TDD AUTH-FLOW TEST - PORT 3000 → 8005

**Erstellt:** 25. November 2025, 16:49 Uhr
**Test-Methode:** Test-Driven Development (TDD)

---

## **✅ IMPLEMENTIERTE ÄNDERUNGEN:**

### **1. Supabase Keys auf Port 3000 ✅**
```bash
/mimicheck-landing/.env
VITE_MAIN_APP_URL=http://localhost:8005
VITE_SUPABASE_URL=https://yjjauvmjyhlxcoumwqlj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### **2. /auth Route ENTFERNT von Port 8005 ✅**
**Datei:** `/src/pages/index.jsx`
```jsx
// Zeile 270: Route ENTFERNT
{/* Auth Route ENTFERNT - Anmeldung nur auf Port 3000! */}
<Route path="/auth-bridge" element={<AuthBridge />} />
```

### **3. Home.jsx leitet zu Port 3000 ✅**
**Datei:** `/src/pages/Home.jsx`
```jsx
const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://localhost:3000/landing';

<a href={`${landingUrl}#auth`}>
  Anmelden / Registrieren
</a>
```

### **4. ProtectedRoute leitet zu Port 3000 ✅**
**Datei:** `/src/routes/ProtectedRoute.jsx`
```jsx
if (!session) {
  const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://localhost:3000/landing';
  window.location.href = `${landingUrl}#auth`;
  return null;
}
```

---

## **🧪 TEST-SZENARIEN:**

### **TEST 1: User ohne Session versucht Port 8005 zu öffnen**

**Ablauf:**
1. User öffnet: `http://localhost:8005/`
2. User klickt "Anmelden / Registrieren"

**Erwartung:**
- ✅ Browser leitet zu `http://localhost:3000/landing#auth`
- ✅ Auth-Formular wird angezeigt
- ❌ KEIN `/auth` auf Port 8005

**Status:** 🟡 Zu testen

---

### **TEST 2: User versucht Protected Route ohne Login**

**Ablauf:**
1. User öffnet direkt: `http://localhost:8005/dashboard`

**Erwartung:**
- ✅ Browser leitet automatisch zu `http://localhost:3000/landing#auth`
- ✅ User sieht Anmeldeformular

**Status:** 🟡 Zu testen

---

### **TEST 3: User meldet sich auf Port 3000 an**

**Ablauf:**
1. User öffnet: `http://localhost:3000/landing#auth`
2. User registriert sich:
   - Email: `tdd-test@example.com`
   - Passwort: `Test123456!`
3. Klickt "Sign Up"

**Erwartung:**
- ✅ Supabase erstellt User
- ✅ Session wird erstellt
- ✅ Tokens werden extrahiert (access_token, refresh_token)
- ✅ Browser Console zeigt:
  ```
  🔍 Getting session...
  📦 Session: { sess: {...}, sessErr: null }
  🎫 Tokens: { hasAccess: true, hasRefresh: true }
  🚀 Redirect URL: http://localhost:8005
  ```

**Status:** 🟡 Zu testen

---

### **TEST 4: Automatischer Redirect zu Port 8005**

**Ablauf:**
- Fortsetzung von TEST 3
- Nach erfolgreichem Login auf Port 3000

**Erwartung:**
- ✅ Browser wechselt automatisch zu:
  ```
  http://localhost:8005/auth-bridge?access_token=XXX&refresh_token=YYY
  ```
- ✅ AuthBridge Console Logs:
  ```
  🌉 AuthBridge LOADED
  🎫 Received tokens: { hasAccess: true, hasRefresh: true }
  🔐 Setting session with Supabase...
  📦 Session set result: { data: {...}, error: null }
  ✅ Profile updated
  🚀 Redirecting to /onboarding...
  ```

**Status:** 🟡 Zu testen

---

### **TEST 5: User landet eingeloggt auf Port 8005**

**Ablauf:**
- Fortsetzung von TEST 4
- Nach AuthBridge verarbeitet

**Erwartung:**
- ✅ Finale URL: `http://localhost:8005/onboarding`
- ✅ User ist eingeloggt
- ✅ Session ist aktiv
- ✅ User kann Dashboard öffnen ohne erneut einloggen

**Browser Console Verify:**
```javascript
const { data, error } = await supabase.auth.getUser();
console.log('Eingeloggt als:', data.user.email);
```

**Erwartete Ausgabe:**
```
Eingeloggt als: tdd-test@example.com ✅
```

**Status:** 🟡 Zu testen

---

### **TEST 6: User kann nicht /auth auf Port 8005 aufrufen**

**Ablauf:**
1. User versucht direkt: `http://localhost:8005/auth`

**Erwartung:**
- ✅ Route existiert nicht
- ✅ 404 oder Redirect zu `/`

**Status:** 🟡 Zu testen

---

### **TEST 7: Session bleibt bestehen (Refresh Test)**

**Ablauf:**
1. User ist eingeloggt auf Port 8005
2. User drückt F5 (Reload)

**Erwartung:**
- ✅ User bleibt eingeloggt
- ✅ Keine Weiterleitung zu Port 3000
- ✅ Dashboard bleibt zugänglich

**Status:** 🟡 Zu testen

---

## **📊 TEST-MATRIX:**

| Test | Szenario | Erwartung | Status |
|------|----------|-----------|--------|
| 1 | Home Button → Auth | Redirect zu Port 3000 | 🟡 |
| 2 | Protected Route ohne Login | Redirect zu Port 3000 | 🟡 |
| 3 | Login auf Port 3000 | Session erstellt | 🟡 |
| 4 | Auto-Redirect | Port 3000 → 8005 | 🟡 |
| 5 | User landet eingeloggt | /onboarding, Session aktiv | 🟡 |
| 6 | /auth auf Port 8005 | 404 oder nicht erreichbar | 🟡 |
| 7 | Session Persistenz | Bleibt nach Reload | 🟡 |

---

## **🚀 TEST-AUSFÜHRUNG:**

### **SCHRITT 1: Server Status prüfen**
```bash
lsof -i :3000  # Landing Page
lsof -i :8005  # Hauptapp
```

### **SCHRITT 2: Browser öffnen**
```
http://localhost:8005/
```

### **SCHRITT 3: Tests durchführen**
- Folge jedem Test-Szenario (1-7)
- Markiere Status als ✅ oder ❌
- Notiere Fehler

### **SCHRITT 4: Browser Console überwachen**
```
F12 → Console Tab
```

Achte auf:
- Redirect-Logs
- Session-Logs
- Error Messages

---

## **✅ ERFOLGS-KRITERIEN:**

**Der Test ist BESTANDEN wenn:**

1. ✅ KEINE /auth Route auf Port 8005 existiert
2. ✅ Alle Auth-Aktionen führen zu Port 3000
3. ✅ Login auf Port 3000 funktioniert
4. ✅ Auto-Redirect zu Port 8005 funktioniert
5. ✅ User landet eingeloggt auf Port 8005
6. ✅ Session bleibt bestehen
7. ✅ KEIN erneuter Login auf Port 8005 nötig

---

## **❌ FEHLER-BEHANDLUNG:**

**Falls Test fehlschlägt:**

### **Problem: /auth auf Port 8005 erreichbar**
→ Route wurde nicht entfernt
→ Prüfe `/src/pages/index.jsx` Zeile 270

### **Problem: Redirect funktioniert nicht**
→ Prüfe Browser Console für Errors
→ Prüfe `.env` Dateien
→ Prüfe Supabase Keys

### **Problem: Session nicht gesetzt**
→ Prüfe AuthBridge.jsx
→ Prüfe Browser Network Tab
→ Prüfe Supabase Dashboard (User vorhanden?)

---

## **📝 TEST-PROTOKOLL:**

**Datum:** _____________
**Tester:** _____________

| Test | Status | Bemerkung |
|------|--------|-----------|
| 1 | ⬜ | |
| 2 | ⬜ | |
| 3 | ⬜ | |
| 4 | ⬜ | |
| 5 | ⬜ | |
| 6 | ⬜ | |
| 7 | ⬜ | |

**Gesamt:** ___/7 bestanden

---

**NÄCHSTE SCHRITTE NACH BESTANDENEM TEST:**
- [ ] Dokumentation aktualisieren
- [ ] Production URLs konfigurieren
- [ ] E2E Tests schreiben
- [ ] Deployment vorbereiten
