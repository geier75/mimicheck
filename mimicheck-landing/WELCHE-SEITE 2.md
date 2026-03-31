# 🔍 WELCHE SEITE SIEHST DU?

## ✅ **BITTE PRÜFEN:**

### **1. Öffne Browser Console:**
```
F12 oder Cmd+Option+I
→ Console Tab
```

### **2. Gib ein:**
```javascript
window.location.href
```

### **3. Kopiere die URL und sende sie mir**

---

## 🎯 **RICHTIGE SEITE:**

### **URL sollte sein:**
```
http://localhost:3000/
```

### **NICHT:**
```
http://localhost:5173/  ← FALSCH (Vite Dev Server)
http://localhost:8080/  ← FALSCH (Andere App)
```

---

## 📍 **WO IST DAS BILD?**

### **Scroll Position:**
1. Öffne `http://localhost:3000/`
2. **Scroll nach unten** (nicht ganz oben!)
3. **Section:** "Diese Förderungen findest du mit MiMiCheck"
4. **Erste Card:** Wohngeld (grün)
5. **Dort sollte das Bild sein!**

---

## 🔍 **DEBUG:**

### **In der Console eingeben:**
```javascript
// Prüfe ob Bild geladen wird
document.querySelector('img[alt="Wohngeld"]')
```

**Erwartete Ausgabe:**
```html
<img src="/images/placeholder-keys.svg" alt="Wohngeld" ...>
```

**Wenn `null`:**
→ Falsche Seite oder Section nicht geladen

---

## 📸 **SCREENSHOT MACHEN:**

1. Scroll zur "Diese Förderungen..." Section
2. Screenshot von der Wohngeld-Card
3. Sende mir den Screenshot

---

## 🚀 **QUICK CHECK:**

```javascript
// In Browser Console:
fetch('/images/placeholder-keys.svg')
  .then(r => console.log('SVG Status:', r.status))
  .catch(e => console.error('SVG Error:', e))
```

**Erwartete Ausgabe:**
```
SVG Status: 200
```

**Wenn 404:**
→ Bild nicht gefunden, falscher Pfad
