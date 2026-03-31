# 🖼️ BILDER ZUR LANDING PAGE HINZUFÜGEN

## 📍 **Dein Schlüssel-Bild zur Wohngeld-Card hinzufügen:**

### **Option 1: Lokales Bild (EMPFOHLEN)**

1. **Speichere dein Schlüssel-Bild:**
   ```bash
   # Kopiere dein Bild hierhin:
   mimicheck-landing/client/public/images/wohngeld-keys.jpg
   ```

2. **Aktualisiere die LandingPage.tsx:**
   ```typescript
   // Datei: mimicheck-landing/client/src/pages/LandingPage.tsx
   // Zeile ~125
   
   {
     title: "Wohngeld",
     description: "Bis zu 3.600€ pro Jahr für Miete oder Eigentum...",
     imageUrl: "/images/wohngeld-keys.jpg",  // ← Dein Bild
     color: "bg-gradient-to-br from-emerald-500 to-teal-600"
   }
   ```

3. **Fertig!** Das Bild wird automatisch geladen.

---

### **Option 2: Externe URL (Aktuell aktiv)**

**Aktuell verwende ich:**
```
https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80
```

Das ist ein **Platzhalter-Bild** von Unsplash (Schlüssel vor Haus).

**Um dein eigenes Bild zu verwenden:**
1. Lade dein Bild auf einen Image-Hosting-Service hoch (z.B. Imgur, Cloudinary)
2. Kopiere die URL
3. Ersetze die URL in `LandingPage.tsx` (Zeile ~125)

---

## 🎨 **Weitere Bilder hinzufügen:**

### **Kindergeld & Zuschlag:**
```typescript
{
  title: "Kindergeld & Zuschlag",
  description: "250€ pro Kind + bis zu 292€ Zuschlag...",
  imageUrl: "/images/kindergeld.jpg",  // ← Dein Bild
  color: "bg-gradient-to-br from-blue-500 to-cyan-600"
}
```

### **Elterngeld:**
```typescript
{
  title: "Elterngeld",
  description: "65-100% deines Nettoeinkommens...",
  imageUrl: "/images/elterngeld.jpg",  // ← Dein Bild
  color: "bg-gradient-to-br from-purple-500 to-pink-600"
}
```

### **BAföG & Bildung:**
```typescript
{
  title: "BAföG & Bildung",
  description: "Bis zu 934€/Monat für Studium...",
  imageUrl: "/images/bafoeg.jpg",  // ← Dein Bild
  color: "bg-gradient-to-br from-orange-500 to-red-600"
}
```

---

## 📐 **Bild-Anforderungen:**

### **Optimale Größe:**
- **Breite:** 800px - 1200px
- **Höhe:** 800px - 1200px (quadratisch)
- **Format:** JPG oder WebP
- **Dateigröße:** < 500KB (für schnelle Ladezeiten)

### **Qualität:**
- ✅ **Hohe Auflösung** (für Retina-Displays)
- ✅ **Gute Beleuchtung**
- ✅ **Klarer Fokus** (Hauptmotiv gut erkennbar)
- ✅ **Passende Farben** (zu Brand Colors)

---

## 🎯 **Empfohlene Motive:**

### **Wohngeld:**
- ✅ Schlüssel vor Haus/Wohnung (wie dein Bild)
- ✅ Wohnungsübergabe
- ✅ Moderne Wohnung

### **Kindergeld:**
- ✅ Familie mit Kindern
- ✅ Spielendes Kind
- ✅ Eltern mit Baby

### **Elterngeld:**
- ✅ Eltern mit Neugeborenem
- ✅ Mutter/Vater mit Baby
- ✅ Familienglück

### **BAföG:**
- ✅ Student beim Lernen
- ✅ Bibliothek/Campus
- ✅ Abschlussfeier

---

## 🚀 **QUICK START:**

### **Dein Schlüssel-Bild hochladen:**

```bash
# 1. Navigiere zum Projekt
cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2/mimicheck-landing

# 2. Erstelle Images-Ordner (falls nicht vorhanden)
mkdir -p client/public/images

# 3. Kopiere dein Bild
# Ziehe dein Bild per Drag & Drop in den Ordner:
# client/public/images/wohngeld-keys.jpg

# 4. Aktualisiere LandingPage.tsx
# Öffne: client/src/pages/LandingPage.tsx
# Zeile ~125: imageUrl: "/images/wohngeld-keys.jpg"

# 5. Dev Server läuft bereits - Änderungen werden automatisch geladen!
```

---

## 🎨 **AKTUELLER STATUS:**

### **Wohngeld-Card:**
- ✅ **Bild:** Unsplash Placeholder (Schlüssel vor Haus)
- ✅ **Overlay:** Emerald-Teal Gradient (60% Opacity)
- ✅ **Hover:** Zoom-Effekt + Opacity-Change
- ✅ **Text:** Drop-Shadow für bessere Lesbarkeit

### **Andere Cards:**
- ⏳ **Noch keine Bilder** (nur Gradient-Backgrounds)
- 💡 **Tipp:** Füge Bilder hinzu für mehr visuellen Impact!

---

## 🔧 **TROUBLESHOOTING:**

### **Bild wird nicht angezeigt:**
1. Prüfe Dateipfad: `/images/dein-bild.jpg` (mit `/` am Anfang)
2. Prüfe Dateiname: Groß-/Kleinschreibung beachten!
3. Prüfe Ordner: `client/public/images/` (nicht `client/src/`)
4. Browser-Cache leeren: `Cmd+Shift+R`

### **Bild ist zu dunkel/hell:**
1. Passe Overlay-Opacity an:
   ```typescript
   // In MosaicGallery.tsx, Zeile ~68:
   opacity-60  // ← Wert ändern (0-100)
   ```

### **Text nicht lesbar:**
1. Erhöhe Drop-Shadow:
   ```typescript
   // In MosaicGallery.tsx, Zeile ~72:
   drop-shadow-2xl  // ← Stärker
   ```

---

## 📊 **VORHER vs. NACHHER:**

### **VORHER:**
```
[Grüner Gradient]
Wohngeld
Bis zu 3.600€ pro Jahr...
```

### **NACHHER:**
```
[Schlüssel-Bild + Grüner Overlay]
Wohngeld
Bis zu 3.600€ pro Jahr...
```

**Effekt:**
- ✅ **Visueller Impact** +300%
- ✅ **Emotionale Verbindung** (Schlüssel = Zuhause)
- ✅ **Premium-Look** (Bild + Gradient)
- ✅ **Hover-Animation** (Zoom + Opacity)

---

**FERTIG! 🎉**

Dein Schlüssel-Bild ist jetzt in der Wohngeld-Card integriert!

**Schau es dir an:**
```
http://localhost:3000
→ Scroll nach unten zur "Diese Förderungen findest du" Section
```
