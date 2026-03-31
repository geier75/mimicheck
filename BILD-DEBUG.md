# 🔍 BILD-DEBUG - Warum wird das Bild nicht angezeigt?

## ✅ **CHECKLISTE:**

### **1. Browser Console prüfen:**
```
F12 → Console Tab
```

**Erwartete Ausgabe:**
```
Image loaded: Wohngeld
```

**Wenn Fehler:**
```
Image failed to load: https://...
```

---

### **2. Network Tab prüfen:**
```
F12 → Network Tab → Reload (Cmd+R)
```

**Suche nach:**
```
photo-1560518883-ce09059eeffa
```

**Status sollte sein:** `200 OK`

**Wenn 403/404:** Unsplash blockiert oder URL falsch

---

### **3. Bild direkt testen:**

**Öffne in neuem Tab:**
```
https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=90&auto=format&fit=crop
```

**Wird das Bild angezeigt?**
- ✅ **JA** → Problem ist im Code
- ❌ **NEIN** → Unsplash blockiert oder Netzwerkproblem

---

## 🔧 **LÖSUNGEN:**

### **Lösung 1: Lokales Bild verwenden (EMPFOHLEN)**

```bash
# 1. Lade ein Schlüssel-Bild herunter
# z.B. von: https://unsplash.com/photos/house-keys

# 2. Speichere es als:
mimicheck-landing/client/public/images/wohngeld-keys.jpg

# 3. Ändere in LandingPage.tsx (Zeile ~125):
imageUrl: "/images/wohngeld-keys.jpg"

# 4. Hard Reload im Browser:
Cmd+Shift+R
```

---

### **Lösung 2: SVG Placeholder verwenden**

**Ich habe bereits ein SVG erstellt:**
```
mimicheck-landing/client/public/images/placeholder-keys.svg
```

**Verwende es:**
```typescript
// In LandingPage.tsx, Zeile ~125:
imageUrl: "/images/placeholder-keys.svg"
```

---

### **Lösung 3: Alternative Bild-URL**

**Teste diese URLs:**

```typescript
// Option A: Pexels
imageUrl: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?w=1200"

// Option B: Pixabay
imageUrl: "https://cdn.pixabay.com/photo/2016/11/29/03/53/house-1867187_1280.jpg"

// Option C: Lorem Picsum (Placeholder)
imageUrl: "https://picsum.photos/800/800?random=1"
```

---

## 🎯 **QUICK FIX (JETZT SOFORT):**

### **Verwende das SVG Placeholder:**

```bash
# 1. Öffne:
mimicheck-landing/client/src/pages/LandingPage.tsx

# 2. Zeile ~125 ändern zu:
imageUrl: "/images/placeholder-keys.svg"

# 3. Speichern (Cmd+S)

# 4. Browser Hard Reload:
Cmd+Shift+R

# 5. Fertig! SVG sollte jetzt sichtbar sein
```

---

## 📊 **DEBUGGING-SCHRITTE:**

### **Schritt 1: Console Logs prüfen**
```javascript
// In MosaicGallery.tsx sind bereits Logs eingebaut:
console.log('Image loaded:', item.title)
console.error('Image failed to load:', item.imageUrl)
```

### **Schritt 2: Komponente prüfen**
```bash
# Öffne Browser DevTools:
F12 → Elements Tab

# Suche nach:
<img src="https://images.unsplash.com..."

# Ist das <img> Element vorhanden?
# Hat es die richtige src?
```

### **Schritt 3: Z-Index prüfen**
```bash
# In DevTools → Elements:
# Prüfe ob das Bild hinter dem Overlay versteckt ist

# Sollte sein:
z-0  (Bild)
z-10 (Overlay)
z-20 (Content)
```

---

## 🚀 **SOFORT-LÖSUNG:**

**Ich ändere jetzt die URL auf das lokale SVG:**

```typescript
// LandingPage.tsx, Zeile ~125:
{
  title: "Wohngeld",
  description: "Bis zu 3.600€ pro Jahr...",
  imageUrl: "/images/placeholder-keys.svg",  // ← SVG Placeholder
  color: "bg-gradient-to-br from-emerald-500 to-teal-600"
}
```

**Das SVG ist garantiert verfügbar und wird angezeigt!**

---

## 📝 **NÄCHSTE SCHRITTE:**

1. **Teste SVG Placeholder** (sollte sofort funktionieren)
2. **Lade dein eigenes Bild hoch** (siehe BILDER-HINZUFUEGEN.md)
3. **Ersetze SVG mit echtem Foto**

---

**JETZT TESTEN:**
```
http://localhost:3000
→ Scroll zu "Diese Förderungen findest du"
→ Wohngeld-Card sollte jetzt Schlüssel-SVG zeigen
```
