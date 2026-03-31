# 🔄 SERVER NEU STARTEN - WICHTIG!

**Problem:** Redirect geht zu Port 3000 statt Port 8005
**Ursache:** Server wurde nach .env Update NICHT neu gestartet
**Lösung:** BEIDE Server neu starten!

---

## **⚠️ WICHTIG:**

**Environment Variables werden NUR beim Server-Start geladen!**

Wenn du `.env` änderst:
- ❌ Server neu laden reicht NICHT
- ❌ Browser neu laden reicht NICHT
- ✅ Server STOPPEN und NEU STARTEN erforderlich!

---

## **🔄 SCHRITT-FÜR-SCHRITT:**

### **TERMINAL 1: Landing Page neu starten**

1. **Finde das Terminal** wo die Landing Page läuft
   - Siehst du: `Server running on http://localhost:3000/`?

2. **Stoppe den Server:**
   - Drücke: `Ctrl + C`
   - Warte bis der Prozess stoppt

3. **Starte neu:**
   ```bash
   cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2/mimicheck-landing
   npm run dev
   ```

4. **Warte bis du siehst:**
   ```
   Server running on http://localhost:3000/
   ```

---

### **TERMINAL 2: Hauptapp neu starten (optional, aber empfohlen)**

1. **Finde das Terminal** wo die Hauptapp läuft
   - Siehst du: `Local: http://localhost:8005/`?

2. **Stoppe den Server:**
   - Drücke: `Ctrl + C`

3. **Starte neu:**
   ```bash
   cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2
   npm run dev
   ```

4. **Warte bis du siehst:**
   ```
   VITE ready in XXX ms
   Local: http://localhost:8005/
   ```

---

## **✅ NACH DEM NEUSTART:**

### **Test 1: Prüfe ob Server laufen**

```bash
lsof -i :3000 -i :8005 | grep LISTEN
```

**Du solltest sehen:**
```
node ... :3000 (LISTEN)
node ... :8005 (LISTEN)
```

---

### **Test 2: Teste den Auth-Flow erneut**

1. **Öffne NEUEN Inkognito-Tab:**
   ```
   http://localhost:3000/landing#auth
   ```

2. **Öffne DevTools:** F12 → Console Tab

3. **Login:**
   - Tab: "Anmelden"
   - Email: `oezkelle.h@gmail.com`
   - Passwort: (dein Passwort)
   - Klicke "Login"

4. **Beobachte Console:**
   ```
   🚀 Redirect URL: http://localhost:8005  ← SOLLTE 8005 sein!
   🔗 Full redirect URL: http://localhost:8005/auth-bridge?...
   🏃 Redirecting NOW!
   ```

5. **Beobachte URL-Leiste:**
   ```
   http://localhost:3000/landing#auth
          ↓
   http://localhost:8005/auth-bridge?access_token=...  ← MUSS 8005 sein!
          ↓
   http://localhost:8005/onboarding
   ```

---

## **🎯 ERWARTETES ERGEBNIS:**

**Nach Neustart solltest du sehen:**

1. ✅ Console: `🚀 Redirect URL: http://localhost:8005`
2. ✅ Browser wechselt zu: `http://localhost:8005/auth-bridge`
3. ✅ Nach 1-2 Sekunden: `http://localhost:8005/onboarding`
4. ✅ **DU BIST EINGELOGGT!**

**NICHT mehr:**
- ❌ Redirect zu `http://localhost:3000/auth-bridge`

---

## **❓ WARUM WAR DAS PROBLEM?**

**Timeline:**

1. `.env` hatte falschen Wert (oder gar keinen)
2. Server wurde gestartet mit falschem Wert
3. Wir haben `.env` korrigiert
4. **ABER:** Server lief noch mit altem Wert!
5. **Lösung:** Server neu starten → neue Werte laden

---

## **💡 MERKE:**

**Bei Environment Variable Änderungen:**

```
.env ändern → Server MUSS neu gestartet werden!
```

**Das gilt für:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_MAIN_APP_URL` ← Dein Problem!
- `VITE_LANDING_URL`
- Alle anderen VITE_* Variablen

---

## **🚀 JETZT MACHEN:**

1. ✅ Terminal mit Port 3000 finden
2. ✅ `Ctrl + C` drücken
3. ✅ `npm run dev` in mimicheck-landing
4. ✅ Warten bis Server läuft
5. ✅ Teste Login erneut
6. ✅ Sollte zu Port 8005 weiterleiten!

**Viel Erfolg!** 🎉
