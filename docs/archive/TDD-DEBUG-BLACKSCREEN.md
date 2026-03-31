# 🧪 TDD DEBUG: BLACKSCREEN NACH LOGIN

**Problem:** Nach Login kommt Blackscreen
**Ziel:** Systematisch debuggen, Schritt für Schritt

---

## **TEST 1: WELCHER PORT HAT DEN BLACKSCREEN?**

### **Aktion:**
1. Öffne Browser wo der Blackscreen ist
2. Schaue in die URL-Leiste
3. Was steht dort?

### **Erwartete Antworten:**

**Option A:**
```
http://localhost:3000/auth-bridge?access_token=...
```
→ **PROBLEM:** Redirect geht immer noch zu Port 3000 (nicht 8005)
→ **NÄCHSTER SCHRITT:** TEST 2

---

**Option B:**
```
http://localhost:8005/auth-bridge?access_token=...
```
→ **GUT:** Redirect geht zu Port 8005 ✅
→ **PROBLEM:** AuthBridge zeigt Blackscreen
→ **NÄCHSTER SCHRITT:** TEST 3

---

**Option C:**
```
http://localhost:8005/onboarding
```
→ **GUT:** Redirect hat funktioniert ✅
→ **PROBLEM:** Onboarding-Seite ist schwarz
→ **NÄCHSTER SCHRITT:** TEST 4

---

## **BITTE ANTWORTE:**

Was steht in der URL-Leiste beim Blackscreen?

```
URL: http://localhost:_____/_____
```

**Dann sage ich dir den nächsten Test!**

---

## **ZUSATZ-INFO SAMMELN:**

Während du auf dem Blackscreen bist:

### **1. Browser DevTools öffnen:**
- Drücke: F12 oder Cmd + Option + I

### **2. Gehe zu Tab "Console":**
- Gibt es rote Errors?
- Kopiere ALLE Meldungen

### **3. Gehe zu Tab "Network":**
- Filter auf "Fetch/XHR"
- Gibt es fehlgeschlagene Requests (rot)?

### **4. Gehe zu Tab "Elements":**
- Klicke auf `<body>`
- Steht dort etwas?
- Oder ist es komplett leer?

---

## **SENDE MIR:**

1. **URL** beim Blackscreen
2. **Console Logs** (alle)
3. **Network Tab:** Gibt es Errors?
4. **Elements Tab:** Ist `<body>` leer?

**Dann kann ich dir GENAU sagen was zu tun ist!** 🎯
