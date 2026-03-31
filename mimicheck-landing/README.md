# MiMiCheck Landing Page

> Moderne, hochperformante Landing Page für MiMiCheck - Der digitale Assistent für Förderanträge

![MiMiCheck Logo](client/public/mimicheck-logo-hero.png)

## 🚀 Features

### Design & UX
- ✨ **3D Hero Animation** mit Three.js und react-three-fiber
- 🎨 **Glassmorphism & Soft-UI** Design
- 🌊 **Scroll-basierte Animationen** mit Framer Motion
- 🌓 **Dark/Light Mode** Toggle
- 📱 **Responsive Design** (Mobile-First)
- ⚡ **Micro-Interactions** und Hover-Effekte

### Performance
- 🎯 **Code Splitting** (React, Three.js, Framer Motion getrennt)
- 🖼️ **WebP Optimierung** (95% Größenreduktion)
- 📦 **Gzip Bundle:** ~580 KB total
- ⚡ **Lazy Loading** für 3D Canvas
- 🚀 **DPR Throttling** für Mobile

### Accessibility (WCAG AA)
- ♿ **Skip to Content** Link
- 🏷️ **ARIA Labels** überall
- ⌨️ **Keyboard Navigation**
- 🔊 **Screen Reader Support**
- 🎭 **prefers-reduced-motion** Support

### Compliance
- 🇪🇺 **EU AI Act** konform (Transparenz-Hinweise)
- 🔒 **DSGVO** konform (Cookie Banner, Datenschutz)
- 📜 **ISO** Zertifizierung Hinweise
- 📋 **Legal Pages** (Impressum, Datenschutz, AGB)

### SEO
- 🔍 **Meta Tags** (Title, Description, Keywords)
- 📱 **Open Graph** Tags (Facebook, Twitter)
- 🗺️ **Sitemap.xml**
- 🤖 **robots.txt**
- 🌐 **Semantic HTML**

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **3D Graphics:** Three.js + react-three-fiber + drei
- **Animations:** Framer Motion
- **Routing:** Wouter
- **Icons:** Lucide React
- **Build:** Vite + Terser

## 📦 Installation

```bash
# Dependencies installieren
pnpm install

# Dev Server starten
pnpm run dev

# Production Build
pnpm run build

# Build Preview
pnpm run preview
```

## 🏗️ Projekt-Struktur

```
mimicheck-landing/
├── client/
│   ├── public/              # Static Assets
│   │   ├── mimicheck-logo-*.png/webp
│   │   ├── sitemap.xml
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/      # React Komponenten
│   │   │   ├── landing/     # Landing Page Sections
│   │   │   ├── ui/          # shadcn/ui Komponenten
│   │   │   ├── Navbar.tsx
│   │   │   └── CookieBanner.tsx
│   │   ├── pages/           # Seiten
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Impressum.tsx
│   │   │   ├── Datenschutz.tsx
│   │   │   └── AGB.tsx
│   │   ├── contexts/        # React Contexts
│   │   ├── hooks/           # Custom Hooks
│   │   ├── lib/             # Utilities
│   │   ├── App.tsx          # App Entry
│   │   ├── main.tsx         # React Entry
│   │   └── index.css        # Global Styles
│   └── index.html           # HTML Template
├── vite.config.ts           # Vite Config
├── tailwind.config.ts       # Tailwind Config
└── package.json
```

## 🎨 Design-System

### Farben
- **Primary:** Blue (#3b82f6)
- **Secondary:** Purple (#a855f7)
- **Accent:** Green (#10b981)
- **Background:** Light/Dark Mode

### Typografie
- **Font:** System Font Stack (optimiert)
- **Headings:** Bold, Gradient Text
- **Body:** Regular, 16px Base

### Spacing
- **Container:** max-w-7xl
- **Sections:** py-24
- **Components:** Tailwind Spacing Scale

## 🚀 Performance-Optimierung

### Bundle-Größen (Gzip)
- **React Vendor:** 9 KB
- **Animation Vendor:** 37 KB
- **Three Vendor:** 346 KB
- **Main Bundle:** 62 KB
- **CSS:** 20 KB
- **Total:** ~580 KB

### Optimierungen
1. **Code Splitting:** Vendor Chunks getrennt
2. **Image Optimization:** WebP statt PNG (95% kleiner)
3. **Tree Shaking:** Ungenutzer Code entfernt
4. **Minification:** Terser für JS, Lightning CSS
5. **Lazy Loading:** 3D Canvas nur bei Sichtbarkeit
6. **DPR Throttling:** Canvas dpr=[1, 1.5] für Mobile

## 📱 Browser-Support

- ✅ Chrome/Edge (letzte 2 Versionen)
- ✅ Firefox (letzte 2 Versionen)
- ✅ Safari (letzte 2 Versionen)
- ✅ Mobile Browsers (iOS Safari, Chrome Mobile)

## 🔒 Datenschutz & Compliance

### Cookie Banner
- Technisch notwendige Cookies
- Anonyme Analytics (Umami)
- Opt-in/Opt-out Funktionalität
- LocalStorage für Consent

### Legal Pages
- **Impressum:** Vollständige Firmendaten
- **Datenschutz:** DSGVO-konform, EU AI Act Hinweise
- **AGB:** Nutzungsbedingungen, KI-Transparenz

## 👥 Firma

**MiMi Tech Ai UG (haftungsbeschränkt)**
- Adresse: Lindenplatz 23, 75378 Bad Liebenzell
- E-Mail: info@mimitechai.com
- Telefon: +49 1575 8805737
- Geschäftsführer: Michael Bemler

## 📄 Lizenz

© 2025 MiMi Tech Ai UG (haftungsbeschränkt). Alle Rechte vorbehalten.

---

**Entwickelt mit ❤️ für EU AI Act & ISO Konformität | LCP < 2.5s | A11y AA & SOTA 2025 konform**
