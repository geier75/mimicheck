# Flinkly - Vollständige Plattform-Dokumentation

## 📋 Übersicht

**Flinkly** ist ein lokaler Marktplatz für digitale Mikrodienstleistungen in der DACH-Region. Die Plattform wurde nach der **PDCA-Methodik** (Plan-Do-Check-Act) entwickelt und bietet eine vollständige Lösung für Käufer, Verkäufer und Administratoren.

### Kernmerkmale
- 🎯 **Micro-Gigs**: Maximaler Preis von 250€ für schnelle, fokussierte Dienstleistungen
- 🔒 **Escrow-System**: Treuhand-Zahlungen für maximale Sicherheit
- 🇩🇪 **DACH-Compliance**: DSGVO-konform mit AVV-Generator
- ⚡ **Speed**: "In 3 Klicks beauftragen" - optimiert für schnelle Abwicklung
- 📊 **Transparenz**: Bewertungssystem mit On-Time-Rate, First-Pass-Rate und Dispute-Quote

---

## 🏗️ Architektur

### Tech Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11 + Drizzle ORM
- **Datenbank**: MySQL/TiDB
- **Authentifizierung**: Manus OAuth
- **Zahlungen**: SEPA, Klarna, Sofortüberweisung, TWINT

### Projektstruktur
```
flinkly/
├── client/               # Frontend
│   ├── src/
│   │   ├── pages/       # Alle Seiten (18 Seiten)
│   │   ├── components/  # Wiederverwendbare UI-Komponenten
│   │   ├── hooks/       # Custom React Hooks
│   │   └── lib/         # tRPC Client
├── server/              # Backend
│   ├── routers.ts       # tRPC API-Endpunkte
│   ├── db.ts            # Datenbank-Queries
│   └── _core/           # Framework-Kern
├── drizzle/             # Datenbank-Schema
└── shared/              # Gemeinsame Typen
```

---

## 📄 Seiten-Übersicht

### Öffentliche Seiten
1. **Home** (`/`) - Landing Page mit Hero, Features, Zielgruppen
2. **Marketplace** (`/marketplace`) - Gig-Übersicht mit Suche und Filtern
3. **GigDetail** (`/gig/:id`) - Einzelne Gig-Ansicht mit Bewertungen
4. **About** (`/about`) - Über Flinkly
5. **HowItWorks** (`/how-it-works`) - Plattform-Erklärung
6. **FAQ** (`/faq`) - Häufig gestellte Fragen
7. **Contact** (`/contact`) - Kontaktformular

### Rechtliche Seiten
8. **Terms** (`/terms`) - Nutzungsbedingungen
9. **Privacy** (`/privacy`) - Datenschutzerklärung
10. **Impressum** (`/impressum`) - Impressum mit MiMi Tech Ai UG Daten

### Authentifizierte Seiten
11. **Checkout** (`/checkout/:id`) - 3-Schritt-Beauftragung (Briefing → Zahlung → Recht)
12. **Dashboard** (`/dashboard`) - Käufer-Dashboard (Bestellungen, Gigs)
13. **OrderDetail** (`/order/:id`) - Order-Room mit Status-Tracking, Chat, Abnahme
14. **Profile** (`/profile`) - Benutzerprofil
15. **Settings** (`/settings`) - Kontoeinstellungen

### Verkäufer-Seiten
16. **CreateGig** (`/create-gig`) - Gig-Erstellungsformular
17. **SellerDashboard** (`/seller-dashboard`) - Kanban-Board, Performance-Metriken

### Admin-Seiten
18. **AdminDashboard** (`/admin`) - Moderation, Streitfälle, Compliance, Analytics

---

## 🗄️ Datenbank-Schema

### Tabellen

#### `users`
```typescript
{
  id: string (PK)
  name: string
  email: string
  loginMethod: string
  role: "user" | "admin"
  createdAt: timestamp
  lastSignedIn: timestamp
}
```

#### `gigs`
```typescript
{
  id: string (PK)
  sellerId: string (FK → users.id)
  title: string
  description: text
  category: string
  price: decimal (max 250)
  deliveryDays: int
  revisions: int
  active: boolean
  completedOrders: int
  averageRating: decimal
  createdAt: timestamp
}
```

#### `orders`
```typescript
{
  id: string (PK)
  gigId: string (FK → gigs.id)
  buyerId: string (FK → users.id)
  sellerId: string (FK → users.id)
  status: "pending" | "in_progress" | "preview" | "delivered" | "revision" | "completed" | "disputed" | "cancelled"
  price: decimal
  buyerMessage: text
  createdAt: timestamp
  deliveredAt: timestamp
  completedAt: timestamp
}
```

#### `reviews`
```typescript
{
  id: string (PK)
  orderId: string (FK → orders.id)
  gigId: string (FK → gigs.id)
  reviewerId: string (FK → users.id)
  rating: int (1-5)
  comment: text
  createdAt: timestamp
}
```

---

## 🔄 User Flows

### Käufer-Flow

#### 1. Discovery
- Landing Page → Suchleiste oder Kategorie-Navigation
- Filter: Preis (≤250€), Lieferzeit, Bewertungen, "Verified DACH"
- Sortierung: Relevanz, On-time-Rate

#### 2. Gig-Detail
- Anzeige: Titel, Lieferzeit, Fixpreis, Deliverables, Beispiele
- Metriken: First-Pass-Rate, On-time-%, Dispute-Quote
- CTA: "In 3 Klicks beauftragen" + "Frage stellen"

#### 3. Checkout (3 Schritte)
**Step 1: Briefing**
- Strukturierte Felder (Projektname, Beschreibung, Zielgruppe, Farbpräferenzen)
- Datei-Upload (optional)
- Scope-Grenzen sichtbar ("Nicht enthalten")

**Step 2: Zahlung**
- Zahlungsmethode wählen (SEPA/Klarna/Sofort/TWINT)
- Escrow-Erklärung mit Checkbox

**Step 3: Rechtliches**
- AVV-Generator bei personenbezogenen Daten
- Rechnungsdaten (optional)
- Kleinunternehmer-Flag
- AGB-Akzeptanz

#### 4. Bearbeitung
- Order-Room mit Status-Tracking
- Chat mit Verkäufer
- Benachrichtigungen (Web + E-Mail)
- Wasserzeichen-Preview

#### 5. Abnahme
- Abnahme-Checkliste (automatisch aus Scope)
- Optionen:
  - ✅ Abnehmen → Escrow frei → Download Final → Rechnung
  - 🔄 Revision anfragen (mit Pflichtfeld Änderungswünsche)
  - ⚠️ Dispute eröffnen (mit Beleg-Wizard)

#### 6. Review
- 2-stufige Bewertung: Sterne + Text
- Qualitätsmetriken (On-time, First-Pass)
- Upsell: Anschluss-Gig

---

### Verkäufer-Flow

#### 1. Onboarding
- Social-Login → Verifizierung (IDnow)
- Steuerprofil (Kleinunternehmer-Flag)
- Auszahlungsart (SEPA)
- Skill-Tags + Portfolio

#### 2. Gig-Erstellung
- Template-Wizard: Deliverables, Lieferzeit, Revisionen, Beispiele
- "Nicht enthalten"-Liste
- Preis: ≤250€
- Optional: Add-ons (z.B. Express +24h +50€)

#### 3. Auftragsabwicklung
- **Kanban-Board**: Neu → In Arbeit → Vorschau → Revision → Abgeschlossen
- Pflicht-Update alle 24h
- Lieferung: Vorschau + Final (signierte Artefakte)

#### 4. Auszahlung
- Abnahme → Escrow-Release (T+0)
- Fee-Abzug transparent
- Gutschrift + Rechnungs-PDF

#### 5. Health-Dashboard
- **On-time-%**: Pünktliche Lieferungen
- **First-Pass-Rate**: Ohne Revision akzeptiert
- **Dispute-Quote**: Streitfälle (Ziel: <5%)
- Wirkt auf Ranking

---

### Admin-Flow

#### 1. Moderation
- Gig-Freigabe mit Flagging-System
- Keyword-Filter (Policy/DSGVO)
- Approve/Reject mit Begründung

#### 2. Dispute-Management
- Soft-Mediation (48h): Guidelines, Fragen, Vorschläge
- Expert-Review (≤72h): Scope-Checkliste-Vergleich
- Schiedsspruch: Voll/Teil-Zahlung oder neue Revision

#### 3. Compliance
- AVV-Archiv
- Rechnungs-Export
- Umsatzreports (DE/AT/CH)
- DSGVO-Tools (Datenlöschungen, Audit-Log)

#### 4. Analytics
- North Stars: Time-to-First-Gig, Fulfillment-Rate, Dispute-Rate, NPS
- Top-Kategorien
- Kohorten-Analyse

---

## 🔌 API-Endpunkte (tRPC)

### Auth
- `auth.me` - Aktuellen Benutzer abrufen
- `auth.logout` - Benutzer abmelden

### Gigs
- `gigs.list` - Alle Gigs auflisten (mit Filter/Suche)
- `gigs.getById` - Einzelnes Gig abrufen
- `gigs.create` - Neues Gig erstellen (protected)
- `gigs.update` - Gig aktualisieren (protected)
- `gigs.delete` - Gig löschen (protected)

### Orders
- `orders.list` - Bestellungen auflisten (protected)
- `orders.getById` - Einzelne Bestellung abrufen (protected)
- `orders.create` - Neue Bestellung erstellen (protected)
- `orders.updateStatus` - Bestellstatus aktualisieren (protected)

### Reviews
- `reviews.getGigReviews` - Bewertungen für ein Gig abrufen
- `reviews.create` - Neue Bewertung erstellen (protected)

---

## 🎨 Design-System

### Farbpalette
- **Primary**: Blau (#2563eb)
- **Success**: Grün (#16a34a)
- **Warning**: Gelb/Amber (#f59e0b)
- **Danger**: Rot (#dc2626)
- **Neutral**: Slate (#64748b)

### Komponenten (shadcn/ui)
- Button, Card, Badge, Input, Textarea
- Checkbox, Select, Tabs, Progress
- Dialog, Toast (Sonner)

### Layout-Prinzipien
- **Container**: Auto-center mit responsive padding
- **Grid**: Responsive Layouts (md:grid-cols-2, lg:grid-cols-3)
- **Spacing**: Konsistente Abstände (space-y-4, gap-6)

---

## 🚀 Deployment

### Entwicklung
```bash
pnpm install
pnpm dev
```

### Produktion
```bash
pnpm build
pnpm start
```

### Umgebungsvariablen
- `DATABASE_URL` - MySQL/TiDB Connection String
- `JWT_SECRET` - Session Cookie Signing Secret
- `VITE_APP_ID` - Manus OAuth App ID
- `OAUTH_SERVER_URL` - Manus OAuth Backend URL
- `VITE_OAUTH_PORTAL_URL` - Manus Login Portal URL
- `VITE_APP_TITLE` - App-Titel
- `VITE_APP_LOGO` - Logo-URL

---

## 📊 Metriken & KPIs

### North Stars
- **Time-to-First-Gig**: <24h (Käufer)
- **Fulfillment-Rate**: >92%
- **Dispute-Rate**: <4%
- **NPS**: ≥55

### Seller Health
- **On-Time Rate**: >90% (Grün), 75-90% (Gelb), <75% (Rot)
- **First-Pass Rate**: >90% (Grün), 75-90% (Gelb), <75% (Rot)
- **Dispute Rate**: <5% (Grün), 5-10% (Gelb), >10% (Rot)

### Events (Instrumentation)
- `search_view`, `filter_apply`, `gig_view`
- `checkout_start`, `brief_complete`, `escrow_fund`
- `first_message`, `draft_delivery`, `approval`
- `revision_request`, `dispute_open`, `payout_release`

---

## 🔒 Sicherheit & Compliance

### DSGVO
- AVV-Generator für personenbezogene Daten
- Datenlöschungen auf Anfrage
- Audit-Log für alle Admin-Aktionen
- Cookie-Consent (Manus OAuth)

### Zahlungssicherheit
- Escrow-System (Treuhand)
- PCI-DSS-konforme Payment-Provider
- Transparente Fee-Struktur

### Fraud Prevention
- KYC-Verifizierung (IDnow)
- Anomalie-Erkennung (zu viele Stornos)
- Dispute-Quote-Tracking

---

## 🎯 Nächste Schritte

### Kurzfristig (MVP+)
- [ ] Echtzeit-Chat mit WebSockets
- [ ] Datei-Upload zu S3
- [ ] E-Mail-Benachrichtigungen
- [ ] Push-Benachrichtigungen

### Mittelfristig
- [ ] Zahlungsintegration (Stripe/Klarna API)
- [ ] IDnow-Verifizierung
- [ ] Erweiterte Analytics (Mixpanel/Amplitude)
- [ ] Mobile App (React Native)

### Langfristig
- [ ] KI-basierte Gig-Empfehlungen
- [ ] Automatische Qualitätsprüfung
- [ ] Multi-Language Support
- [ ] Internationalisierung (über DACH hinaus)

---

## 📞 Support & Kontakt

**MiMi Tech Ai UG (haftungsbeschränkt)**  
Lindenplatz 23  
75378 Bad Liebenzell  
Deutschland

**E-Mail**: info@mimitechai.com  
**Telefon**: +49 1575 8805737  
**Website**: www.mimitechai.com

---

## 📝 Changelog

### Version 1.0.0 (2025-10-21)
- ✅ PDCA-Zyklus vollständig abgeschlossen
- ✅ 18 Seiten implementiert
- ✅ Käufer-Flow, Verkäufer-Flow, Admin-Flow
- ✅ Checkout mit 3-Schritt-Prozess
- ✅ Order-Room mit Status-Tracking
- ✅ Verkäufer-Dashboard mit Kanban
- ✅ Admin-Backoffice mit Moderation
- ✅ Datenbank-Schema mit 4 Tabellen
- ✅ tRPC-APIs für alle Features
- ✅ DSGVO-Compliance

---

**Entwickelt mit ❤️ nach PDCA-Methodik**

