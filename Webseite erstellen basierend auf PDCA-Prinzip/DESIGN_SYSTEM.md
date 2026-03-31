# Flinkly Design System & Komponenten-Bibliothek

## 🎨 Design-Prinzipien

### Leitprinzipien
1. **Mobile-First**: Alle Designs beginnen bei 375px Breite
2. **E-Commerce-Flow**: Kaufprozess wie bei Amazon/Etsy (Card → PDP → Checkout)
3. **Transparente Zustände**: Jeder Screen hat klaren Primary-CTA und Statuschips
4. **Trust sichtbar**: Metriken (On-time-Rate, First-Pass-Rate, Dispute-Quote) prominent platziert
5. **DACH-Compliance by Design**: AVV-Hinweise, Kleinunternehmer-Flags eingebaut

### Grid-System
- **8-pt Grid**: Alle Abstände in Vielfachen von 8px (8, 16, 24, 32, 40, 48...)
- **Container**: Max-width 1280px, responsive padding (16px mobile, 24px tablet, 32px desktop)
- **Columns**: 4 (mobile), 8 (tablet), 12 (desktop)

---

## 🎨 Farben

### Primary Palette
```css
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Main Primary */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

### Secondary Palette (Purple für Seller)
```css
--secondary-500: #8b5cf6;
--secondary-600: #7c3aed;
```

### Semantic Colors
```css
--success: #16a34a;
--warning: #f59e0b;
--error: #dc2626;
--info: #0ea5e9;
```

### Neutral Palette
```css
--slate-50: #f8fafc;
--slate-100: #f1f5f9;
--slate-200: #e2e8f0;
--slate-300: #cbd5e1;
--slate-400: #94a3b8;
--slate-500: #64748b;
--slate-600: #475569;
--slate-700: #334155;
--slate-800: #1e293b;
--slate-900: #0f172a;
```

---

## 📝 Typografie

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 32px (mobile), 48px (desktop) | 700 | 1.2 |
| H2 | 24px (mobile), 32px (desktop) | 700 | 1.3 |
| H3 | 20px (mobile), 24px (desktop) | 600 | 1.4 |
| H4 | 18px | 600 | 1.4 |
| Body | 16px | 400 | 1.5 |
| Small | 14px | 400 | 1.5 |
| Tiny | 12px | 400 | 1.4 |

---

## 🧩 Atoms (Basis-Komponenten)

### 1. Status Chips
**Verwendung**: Order-Status, Gig-Status, Verifizierungs-Status

```tsx
<Chip variant="draft">Entwurf</Chip>
<Chip variant="in_progress">In Arbeit</Chip>
<Chip variant="preview">Vorschau</Chip>
<Chip variant="review">Prüfung</Chip>
<Chip variant="completed">Abgeschlossen</Chip>
<Chip variant="disputed">Streitfall</Chip>
```

**Varianten**:
- `draft`: Grau (#64748b)
- `in_progress`: Blau (#3b82f6)
- `preview`: Lila (#8b5cf6)
- `review`: Orange (#f59e0b)
- `completed`: Grün (#16a34a)
- `disputed`: Rot (#dc2626)

### 2. KPI-Badge
**Verwendung**: Metriken an Cards und PDP

```tsx
<KPIBadge 
  icon={<Clock />} 
  label="On-time" 
  value="94%" 
  variant="success" 
/>
```

**Varianten**:
- `success`: Grün (≥90%)
- `warning`: Gelb (75-89%)
- `danger`: Rot (<75%)

### 3. Countdown Timer
**Verwendung**: ETA-Anzeige in Order-Room

```tsx
<Countdown deadline={new Date("2025-10-25")} />
// Output: "2d 14h verbleibend"
```

**States**:
- Normal: Grau
- < 24h: Orange
- Überfällig: Rot + Pulsieren

### 4. Progress Stepper
**Verwendung**: Checkout, Onboarding

```tsx
<ProgressStepper 
  steps={["Briefing", "Zahlung", "Recht"]} 
  currentStep={1} 
/>
```

### 5. Inline Tooltip
**Verwendung**: Escrow-Erklärung, AVV-Info

```tsx
<InlineTooltip content="Geld wird erst nach Abnahme freigegeben">
  <InfoIcon />
</InlineTooltip>
```

---

## 🧬 Molecules (Zusammengesetzte Komponenten)

### 1. Gig-Card
**Verwendung**: SERP, Empfehlungen

```tsx
<GigCard
  title="Logo Design Premium"
  price={150}
  deliveryDays={2}
  seller={{
    name: "Anna Designer",
    verified: true,
    badges: ["DACH"]
  }}
  metrics={{
    onTimeRate: 94,
    firstPassRate: 87,
    disputeRate: 3
  }}
  image="https://..."
  onView={() => navigate(`/gig/${id}`)}
  onQuickOrder={() => navigate(`/checkout/${id}`)}
/>
```

**Layout**:
- Image (16:9, 240px height)
- Title (2 lines max, ellipsis)
- Price (prominent, rechts oben)
- Delivery (Clock icon + "2 Tage")
- Seller (Avatar + Name + Badge)
- Metrics (3 KPI-Badges horizontal)
- CTAs (Primary: "Details", Secondary: "Jetzt beauftragen")

### 2. Review-Card
**Verwendung**: PDP, Profil

```tsx
<ReviewCard
  rating={5}
  author="Max M."
  date={new Date("2025-10-15")}
  comment="Sehr professionell und schnell!"
  metrics={{
    onTime: true,
    firstPass: true
  }}
/>
```

### 3. Briefing-Form
**Verwendung**: Checkout, Gig-Wizard

```tsx
<BriefingForm
  schema={{
    fields: [
      { name: "projectName", type: "text", required: true },
      { name: "description", type: "textarea", required: true },
      { name: "files", type: "upload", accept: ".pdf,.jpg" }
    ]
  }}
  onSubmit={handleSubmit}
/>
```

**Features**:
- Schema-driven (JSON-basiert)
- Blocking-Validierung
- Beispiel-Guides bei Fehlern
- Datei-Upload mit Drag & Drop

### 4. Payment-Widget
**Verwendung**: Checkout

```tsx
<PaymentWidget
  methods={["sepa", "klarna", "sofort", "twint"]}
  escrowInfo="Geld wird erst nach Abnahme freigegeben"
  onSelect={handlePaymentMethod}
/>
```

### 5. Delivery-Block
**Verwendung**: Order-Room

```tsx
<DeliveryBlock
  type="preview" // or "final"
  files={[
    { name: "logo-v1.jpg", url: "...", watermarked: true }
  ]}
  checklist={[
    { item: "3 Entwürfe", checked: true },
    { item: "Vektorformat", checked: false }
  ]}
  onDownload={handleDownload}
/>
```

---

## 🏗️ Organisms (Komplexe Komponenten)

### 1. SERP-Grid
**Verwendung**: Marketplace, Kategorie-Seiten

```tsx
<SERPGrid
  filters={{
    price: { max: 250 },
    deliveryDays: [1, 2, 3],
    rating: { min: 4 },
    verified: true
  }}
  sort="relevance" // or "onTime", "price"
  gigs={gigsData}
  onFilterChange={handleFilterChange}
  onLoadMore={handleLoadMore}
/>
```

**Layout**:
- Filter-Chips (horizontal scroll mobile)
- Sort-Dropdown (rechts)
- Grid (2 cols mobile, 3 cols tablet, 4 cols desktop)
- "Mehr laden" Button

### 2. PDP-Hero
**Verwendung**: Gig-Detail

```tsx
<PDPHero
  title="Logo Design Premium"
  price={150}
  deliveryDays={2}
  seller={sellerData}
  metrics={metricsData}
  deliverables={["3 Entwürfe", "Vektorformat", "Quelldateien"]}
  notIncluded={["Visitenkarten", "Social Media"]}
  onOrder={() => navigate(`/checkout/${id}`)}
  onAsk={() => openChat()}
/>
```

**Layout (Mobile)**:
- Gallery (Swiper)
- Title + Price
- Delivery + Metrics
- "Was du bekommst" (expandable)
- "Nicht enthalten" (expandable, prominent)
- Sticky Bottom Bar: "In 3 Klicks beauftragen"

### 3. Checkout-Stepper
**Verwendung**: Checkout

```tsx
<CheckoutStepper
  steps={[
    { id: 1, title: "Briefing", component: <BriefingStep /> },
    { id: 2, title: "Zahlung", component: <PaymentStep /> },
    { id: 3, title: "Recht", component: <LegalStep /> }
  ]}
  currentStep={1}
  onNext={handleNext}
  onBack={handleBack}
  onComplete={handleComplete}
/>
```

### 4. Kanban-Board
**Verwendung**: Seller-Dashboard

```tsx
<KanbanBoard
  columns={[
    { id: "new", title: "Neu", color: "blue" },
    { id: "in_progress", title: "In Arbeit", color: "purple" },
    { id: "preview", title: "Vorschau", color: "orange" },
    { id: "revision", title: "Revision", color: "amber" },
    { id: "completed", title: "Abgeschlossen", color: "green" }
  ]}
  orders={ordersData}
  onDragEnd={handleDragEnd}
  onCardClick={handleCardClick}
/>
```

**Card-Content**:
- Gig-Titel
- Buyer-Name
- ETA (Countdown)
- SLA-Reminder ("Update fällig in 6 Std")
- Priority-Border (rot/gelb/grün)

### 5. Order-Room-Timeline
**Verwendung**: Order-Detail

```tsx
<OrderRoomTimeline
  events={[
    { type: "created", timestamp: "...", user: "buyer" },
    { type: "message", text: "...", user: "seller" },
    { type: "preview_delivered", files: [...], user: "seller" },
    { type: "approved", user: "buyer" }
  ]}
  onSendMessage={handleSendMessage}
  onDeliverPreview={handleDeliverPreview}
  onApprove={handleApprove}
/>
```

### 6. Mediation-Wizard
**Verwendung**: Dispute-Flow

```tsx
<MediationWizard
  orderId="ORD-123"
  steps={[
    { id: 1, title: "Beleg hochladen", component: <EvidenceStep /> },
    { id: 2, title: "Gewünschtes Ergebnis", component: <OutcomeStep /> },
    { id: 3, title: "Zusammenfassung", component: <SummaryStep /> }
  ]}
  onSubmit={handleSubmitDispute}
/>
```

---

## 📱 Mobile-First Navigation

### Global Header (Desktop)
```
[Logo] [Kategorien ▼] [Suche...] [Anmelden] [Gig anbieten]
```

### Sticky Action Bar (Mobile)
```
[🏠 Home] [🔍 Suchen] [📦 Aufträge] [💬 Nachrichten] [👤 Profil]
```

**Position**: Fixed bottom, 64px height, blur background

### Context Tabs (Role-based)
**Buyer**:
```
[Aufträge] [Rechnungen]
```

**Seller**:
```
[Aufträge] [Gigs] [Auszahlungen]
```

---

## 🎯 CTA-Hierarchie

### Primary CTA
- **Style**: Solid, Primary Color (#3b82f6)
- **Verwendung**: Hauptaktion (Beauftragen, Abnahme, Veröffentlichen)
- **Größe**: Large (48px height mobile, 56px desktop)

### Secondary CTA
- **Style**: Ghost/Outline, Primary Color Border
- **Verwendung**: Alternative Aktion (Frage stellen, Abbrechen)
- **Größe**: Medium (40px height)

### Destructive CTA
- **Style**: Solid, Error Color (#dc2626)
- **Verwendung**: Gefährliche Aktionen (Eskalation, Löschen)
- **Größe**: Medium (40px height)

---

## 🔄 State-UI-Patterns

### Empty State
```tsx
<EmptyState
  icon={<SearchIcon />}
  title="Keine Gigs gefunden"
  description="Versuche andere Suchbegriffe oder Filter"
  action={<Button>Filter zurücksetzen</Button>}
/>
```

### Loading State
```tsx
<SkeletonCard count={6} />
```

### Error State
```tsx
<ErrorState
  message="Fehler beim Laden"
  retry={handleRetry}
/>
```

---

## ♿ Accessibility

### Kontrast
- **AA-Standard**: Mindestens 4.5:1 für normalen Text
- **AAA-Standard**: 7:1 für wichtige CTAs

### Fokus-Ringe
- **Sichtbar**: 2px solid, Primary Color
- **Offset**: 2px

### Keyboard Navigation
- **Tab-Order**: Logisch von oben nach unten, links nach rechts
- **Shortcuts**: Enter (Submit), Esc (Cancel/Close)

---

## 📐 Spacing-System

| Token | Value | Verwendung |
|-------|-------|------------|
| xs | 4px | Inline-Abstände |
| sm | 8px | Kompakte Layouts |
| md | 16px | Standard-Abstände |
| lg | 24px | Sektionen |
| xl | 32px | Große Sektionen |
| 2xl | 48px | Hero-Bereiche |

---

## 🎭 Animation

### Transitions
```css
transition: all 0.2s ease-in-out;
```

### Hover Effects
- **Cards**: Scale 1.02, Shadow erhöhen
- **Buttons**: Brightness 110%

### Loading Animations
- **Spinner**: Rotate 360deg, 1s linear infinite
- **Skeleton**: Shimmer-Effekt (Gradient-Animation)

---

## 📦 Komponenten-Implementierung

Alle Komponenten werden in `/client/src/components/` organisiert:

```
components/
├── atoms/
│   ├── Chip.tsx
│   ├── KPIBadge.tsx
│   ├── Countdown.tsx
│   ├── ProgressStepper.tsx
│   └── InlineTooltip.tsx
├── molecules/
│   ├── GigCard.tsx
│   ├── ReviewCard.tsx
│   ├── BriefingForm.tsx
│   ├── PaymentWidget.tsx
│   └── DeliveryBlock.tsx
├── organisms/
│   ├── SERPGrid.tsx
│   ├── PDPHero.tsx
│   ├── CheckoutStepper.tsx
│   ├── KanbanBoard.tsx
│   ├── OrderRoomTimeline.tsx
│   └── MediationWizard.tsx
└── ui/ (shadcn/ui)
    ├── button.tsx
    ├── card.tsx
    └── ...
```

---

**Nächster Schritt**: Implementierung der Mobile-First Navigation (DO-Phase)

