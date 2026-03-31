# 🔑 SUPABASE KEYS KORRIGIEREN

**Problem:** `Invalid API key` - Status 401
**Ursache:** Supabase ANON KEY ist falsch oder abgelaufen
**Lösung:** Richtige Keys aus Supabase Dashboard kopieren

---

## **📋 SCHRITT-FÜR-SCHRITT ANLEITUNG:**

### **SCHRITT 1: Öffne Supabase Dashboard**

```
https://supabase.com/dashboard/project/yjjauvmjyhlxcoumwqlj/settings/api
```

**Klicke auf diesen Link!**

---

### **SCHRITT 2: Kopiere die Keys**

**Auf der Seite siehst du:**

#### **1. Project URL**
```
URL: https://yjjauvmjyhlxcoumwqlj.supabase.co
```

**Kopiere die KOMPLETTE URL!**

---

#### **2. Project API keys**

**Du siehst zwei Keys:**

##### **anon / public Key**
```
Beginnt mit: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Sehr lang (300+ Zeichen)
```

**DAS BRAUCHST DU!** ← Klicke "Copy" Button

##### **service_role Key** ⚠️
```
Beginnt auch mit: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Aber ANDERER Key!
```

**NICHT DEN VERWENDEN!** Das ist der Admin-Key!

---

### **SCHRITT 3: Update Landing Page .env**

**Öffne diese Datei:**
```
/Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2/mimicheck-landing/.env
```

**Ersetze die Werte:**

```env
# SUPABASE CONFIGURATION
VITE_SUPABASE_URL=https://yjjauvmjyhlxcoumwqlj.supabase.co
VITE_SUPABASE_ANON_KEY=[FÜGE HIER DEN ANON KEY EIN]

# MAIN APP URL
VITE_MAIN_APP_URL=http://localhost:8005
```

**⚠️ WICHTIG:**
- Keine Anführungszeichen um die Werte!
- Keine Leerzeichen!
- Der Key muss KOMPLETT sein (sehr lang!)
- Verwende den **anon** Key, NICHT den service_role Key!

---

### **SCHRITT 4: Update Hauptapp .env.local**

**Öffne diese Datei:**
```
/Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2/.env.local
```

**Ersetze die Werte:**

```env
VITE_SUPABASE_URL=https://yjjauvmjyhlxcoumwqlj.supabase.co
VITE_SUPABASE_ANON_KEY=[FÜGE HIER DEN ANON KEY EIN]
VITE_LANDING_URL=http://localhost:3000/landing
VITE_MAIN_APP_URL=http://localhost:8005
```

---

### **SCHRITT 5: Server NEU STARTEN**

**WICHTIG:** Environment Variables werden nur beim Start geladen!

#### **Terminal 1: Hauptapp neu starten**
```bash
# Stoppe aktuellen Server (Ctrl + C)
# Dann:
cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2
npm run dev
```

#### **Terminal 2: Landing Page neu starten**
```bash
# Stoppe aktuellen Server (Ctrl + C)
# Dann:
cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2/mimicheck-landing
npm run dev
```

---

### **SCHRITT 6: Teste erneut**

**Öffne das Debug-Tool:**
```
file:///Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2/TEST-SUPABASE-400.html
```

**ODER neu generieren mit korrektem Key (siehe unten)**

---

## **🔄 ALTERNATIV: TEST-TOOL MIT KORREKTEM KEY**

**Ich kann dir ein neues Test-Tool generieren mit dem richtigen Key!**

**Sende mir:**
1. Den **anon** Key aus dem Supabase Dashboard
2. Ich erstelle ein neues TEST-SUPABASE-400.html mit dem richtigen Key
3. Du kannst sofort testen!

---

## **❓ WARUM WAR DER KEY FALSCH?**

**Mögliche Gründe:**

1. **Key wurde regeneriert** in Supabase (z.B. aus Sicherheitsgründen)
2. **Falscher Key kopiert** (z.B. service_role statt anon)
3. **Key unvollständig** (nur Teil kopiert)
4. **Falsches Project** (falls mehrere Supabase Projects)

---

## **✅ CHECKLISTE:**

Prüfe diese Punkte:

- [ ] Richtiges Supabase Project geöffnet (yjjauvmjyhlxcoumwqlj)?
- [ ] **anon** Key kopiert (NICHT service_role)?
- [ ] Key ist KOMPLETT (300+ Zeichen)?
- [ ] Key hat KEINE Leerzeichen am Anfang/Ende?
- [ ] .env Dateien gespeichert?
- [ ] Server neu gestartet?

---

## **🎯 NACH DEM FIX:**

**Du solltest sehen:**

```
✅ SIGNUP ERFOLGREICH!
👤 User ID: ...
📧 Email: ...
✅ SESSION ERSTELLT!
🎫 Access Token: ...
🎉 PERFEKT! Der Flow sollte funktionieren!
```

**Statt:**
```
❌ ERROR: Invalid API key
```

---

## **💡 TIPP: KEY PRÜFEN**

**Valider Supabase ANON Key sieht so aus:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqamF1dm1qeWhseGNvdW13cWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2Mjc1MzcsImV4cCI6MjA0ODIwMzUzN30.U1Z7wL-Xt08sBgP4u3q-0f7VCWnXUQFu3yqt3wz9XD8
```

**Eigenschaften:**
- Sehr lang (ca. 300+ Zeichen)
- Beginnt mit `eyJ`
- Hat 2 Punkte: `xxx.yyy.zzz`
- Enthält nur: A-Z, a-z, 0-9, -, _, .
- **KEINE** Leerzeichen
- **KEIN** Zeilenumbruch

**Wenn dein Key anders aussieht → FALSCH!**

---

## **🚀 NÄCHSTER SCHRITT:**

1. **Öffne:** https://supabase.com/dashboard/project/yjjauvmjyhlxcoumwqlj/settings/api
2. **Kopiere:** anon / public Key (Klicke "Copy")
3. **Update:** mimicheck-landing/.env
4. **Update:** .env.local
5. **Restart:** Beide Server
6. **Teste:** Debug-Tool erneut

**Dann sollte es funktionieren!** ✅
