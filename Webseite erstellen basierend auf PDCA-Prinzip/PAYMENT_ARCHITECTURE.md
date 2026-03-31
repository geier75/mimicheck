# Flinkly Payment Architecture & Monetization

## 1. Payment-Architektur Übersicht

### Escrow-Flow (Treuhand-System)

```
Käufer → Zahlung → Escrow (Flinkly) → Lieferung → Abnahme → Auszahlung an Verkäufer
```

**Vorteile:**
- Käufer-Schutz: Geld wird erst bei Abnahme freigegeben
- Verkäufer-Sicherheit: Geld ist reserviert
- Dispute-Handling: Flinkly kann bei Streitfällen vermitteln

### Payment-Provider Integration

**DACH-Region Zahlungsmethoden:**

1. **Klarna** (Sofortüberweisung, Rechnung, Ratenkauf)
   - Primär für Deutschland
   - API: Klarna Payments API
   - Escrow-Support: Ja (über Capture-Delay)

2. **TWINT** (Mobile Payment)
   - Primär für Schweiz
   - API: TWINT Merchant API
   - Escrow-Support: Nein (Alternative: Stripe mit TWINT)

3. **SEPA-Lastschrift**
   - Alle DACH-Länder
   - API: Stripe SEPA Direct Debit
   - Escrow-Support: Ja

4. **Kreditkarte** (Visa, Mastercard)
   - Backup für alle Länder
   - API: Stripe Payment Intents
   - Escrow-Support: Ja (Hold & Capture)

### Technische Implementierung

**Payment-Provider: Stripe** (als Haupt-Gateway)

**Warum Stripe?**
- Unterstützt Klarna, SEPA, Kreditkarten
- TWINT via Stripe (in Schweiz)
- Built-in Escrow via Payment Intents (authorize → capture)
- Connect API für Seller-Payouts
- DSGVO-konform, PCI-DSS Level 1

---

## 2. Datenbank-Schema Erweiterung

### Neue Tabellen

```sql
-- Transactions (Zahlungen)
CREATE TABLE transactions (
  id VARCHAR(64) PRIMARY KEY,
  orderId VARCHAR(64) NOT NULL,
  buyerId VARCHAR(64) NOT NULL,
  sellerId VARCHAR(64) NOT NULL,
  amount INT NOT NULL, -- in cents
  currency VARCHAR(3) DEFAULT 'EUR',
  paymentMethod VARCHAR(32), -- 'klarna', 'sepa', 'card', 'twint'
  paymentIntentId VARCHAR(255), -- Stripe Payment Intent ID
  status ENUM('pending', 'authorized', 'captured', 'refunded', 'failed'),
  escrowReleaseDate TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id)
);

-- Payouts (Auszahlungen an Verkäufer)
CREATE TABLE payouts (
  id VARCHAR(64) PRIMARY KEY,
  sellerId VARCHAR(64) NOT NULL,
  amount INT NOT NULL, -- in cents
  currency VARCHAR(3) DEFAULT 'EUR',
  status ENUM('pending', 'processing', 'paid', 'failed'),
  payoutMethod VARCHAR(32), -- 'bank_transfer', 'sepa'
  stripePayoutId VARCHAR(255),
  transactionIds TEXT, -- JSON array of transaction IDs
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paidAt TIMESTAMP NULL,
  FOREIGN KEY (sellerId) REFERENCES users(id)
);

-- Invoices (Rechnungen)
CREATE TABLE invoices (
  id VARCHAR(64) PRIMARY KEY,
  orderId VARCHAR(64) NOT NULL,
  buyerId VARCHAR(64) NOT NULL,
  sellerId VARCHAR(64) NOT NULL,
  invoiceNumber VARCHAR(32) UNIQUE,
  amount INT NOT NULL,
  vatAmount INT NOT NULL,
  totalAmount INT NOT NULL,
  pdfUrl VARCHAR(512),
  status ENUM('draft', 'sent', 'paid', 'cancelled'),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id)
);
```

---

## 3. Payment-Flow States

### Order State Machine (erweitert)

```
1. pending → Bestellung erstellt, Zahlung ausstehend
2. payment_authorized → Zahlung autorisiert (Escrow)
3. in_progress → Verkäufer arbeitet
4. in_review → Käufer prüft Lieferung
5. completed → Käufer akzeptiert → Zahlung wird captured
6. payout_pending → Auszahlung an Verkäufer ausstehend
7. payout_completed → Verkäufer hat Geld erhalten
8. disputed → Streitfall
9. refunded → Rückerstattung an Käufer
```

### Escrow-Timing

- **Authorization**: Bei Bestellung (Geld wird reserviert)
- **Capture**: Bei Abnahme durch Käufer (Geld wird eingezogen)
- **Auto-Capture**: Nach 7 Tagen ohne Reaktion des Käufers
- **Refund**: Bei Dispute oder Stornierung

---

## 4. Gebührenstruktur

### Flinkly-Gebühren

- **Service-Fee**: 10% vom Gig-Preis
- **Payment-Processing**: 2,9% + 0,25€ (Stripe-Gebühr)

**Beispiel:**
- Gig-Preis: 150€
- Flinkly-Fee (10%): 15€
- Payment-Fee (2,9% + 0,25€): 4,60€
- **Verkäufer erhält**: 130,40€
- **Flinkly erhält**: 19,60€

### Auszahlungs-Schwelle

- **Minimum Payout**: 20€
- **Payout-Frequenz**: Wöchentlich (jeden Montag)
- **Payout-Methode**: SEPA-Überweisung (kostenlos)

---

## 5. API-Endpunkte (tRPC Procedures)

### Payment Procedures

```typescript
payment: router({
  // Create payment intent
  createIntent: protectedProcedure
    .input(z.object({ orderId: z.string(), paymentMethod: z.string() }))
    .mutation(async ({ input }) => {
      // Create Stripe Payment Intent with authorize-only
      // Return client_secret for frontend
    }),

  // Confirm payment
  confirmPayment: protectedProcedure
    .input(z.object({ paymentIntentId: z.string() }))
    .mutation(async ({ input }) => {
      // Confirm payment with Stripe
      // Update order status to payment_authorized
    }),

  // Capture payment (on delivery acceptance)
  capturePayment: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ input }) => {
      // Capture authorized payment
      // Update order status to completed
      // Create payout record
    }),

  // Refund payment
  refundPayment: protectedProcedure
    .input(z.object({ orderId: z.string(), reason: z.string() }))
    .mutation(async ({ input }) => {
      // Refund payment via Stripe
      // Update order status to refunded
    }),
}),

payout: router({
  // Get seller earnings
  getEarnings: protectedProcedure
    .query(async ({ ctx }) => {
      // Calculate available balance, pending, and total earnings
    }),

  // Request payout
  requestPayout: protectedProcedure
    .input(z.object({ amount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Create payout via Stripe Connect
      // Update payout status
    }),

  // Get payout history
  getHistory: protectedProcedure
    .query(async ({ ctx }) => {
      // Return all payouts for seller
    }),
}),

invoice: router({
  // Generate invoice
  generate: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ input }) => {
      // Generate PDF invoice
      // Store in S3
      // Return URL
    }),

  // Get invoice
  getByOrder: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      // Return invoice for order
    }),
}),
```

---

## 6. Frontend-Komponenten

### Payment-Widget (Checkout)

- **Payment-Method-Selector**: Radio-Buttons für Klarna, SEPA, Karte, TWINT
- **Stripe Elements**: Sichere Eingabe von Zahlungsdaten
- **Escrow-Info**: Hinweis auf Treuhand-System
- **Legal-Checkboxes**: AGB, Widerrufsrecht, Datenschutz

### Earnings-Dashboard (Seller)

- **Available Balance**: Verfügbarer Betrag zur Auszahlung
- **Pending**: Geld in Escrow (noch nicht freigegeben)
- **Total Earnings**: Gesamt-Einnahmen
- **Payout-Button**: Auszahlung beantragen
- **Transaction-History**: Liste aller Transaktionen

### Invoice-Generator

- **Auto-Generate**: Bei Bestellabschluss
- **PDF-Download**: Für Käufer und Verkäufer
- **VAT-Calculation**: MwSt. nach Land (DE: 19%, AT: 20%, CH: 7,7%)

---

## 7. Sicherheit & Compliance

### PCI-DSS Compliance

- **Keine Kartendaten speichern**: Stripe Elements verwendet
- **Tokenization**: Stripe Payment Intents
- **HTTPS-Only**: Alle Payment-Requests

### DSGVO

- **Data Minimization**: Nur notwendige Zahlungsdaten
- **Right to Deletion**: Transaktions-Historie anonymisieren
- **Data Portability**: Export aller Zahlungsdaten

### Fraud-Prevention

- **3D Secure**: Für Kreditkarten (Stripe Radar)
- **Risk-Scoring**: Stripe Radar automatisch
- **Manual Review**: Bei verdächtigen Transaktionen

---

## 8. Testing-Strategie

### Stripe Test-Mode

- **Test-Cards**: 4242 4242 4242 4242 (Erfolg)
- **Test-SEPA**: DE89370400440532013000
- **Test-Klarna**: Sandbox-Modus

### Test-Szenarien

1. ✅ Erfolgreiche Zahlung → Escrow → Abnahme → Payout
2. ✅ Zahlung fehlgeschlagen → Order cancelled
3. ✅ Dispute → Refund
4. ✅ Auto-Capture nach 7 Tagen
5. ✅ Payout unter Minimum → Fehler

---

## 9. Implementierungs-Reihenfolge

**Phase 1: Stripe-Integration**
- Stripe-Account einrichten
- API-Keys konfigurieren
- Payment Intents implementieren

**Phase 2: Escrow-System**
- Order State Machine erweitern
- Authorize → Capture Flow
- Auto-Capture Cronjob

**Phase 3: Seller-Payouts**
- Stripe Connect einrichten
- Earnings-Dashboard
- Payout-Requests

**Phase 4: Invoicing**
- PDF-Generator (z.B. PDFKit)
- VAT-Calculation
- S3-Upload

**Phase 5: Testing**
- Unit-Tests für Payment-Logic
- Integration-Tests mit Stripe Test-Mode
- End-to-End Payment-Flow

---

## 10. Kosten-Kalkulation

### Stripe-Gebühren (Europa)

- **Kreditkarte**: 1,4% + 0,25€
- **SEPA**: 0,35€ (max)
- **Klarna**: 2,9% + 0,25€
- **TWINT**: 1,9% + 0,25€

### Flinkly-Einnahmen (Beispiel)

**Bei 1000 Transaktionen/Monat à 150€:**
- Gesamt-Volumen: 150.000€
- Flinkly-Fee (10%): 15.000€
- Stripe-Gebühren (~2%): -3.000€
- **Netto-Einnahmen**: 12.000€/Monat

---

## Nächste Schritte

1. ✅ Datenbank-Schema erweitern (transactions, payouts, invoices)
2. ✅ Stripe-Integration implementieren
3. ✅ Payment-Widget in Checkout einbauen
4. ✅ Earnings-Dashboard für Seller
5. ✅ Invoice-Generator
6. ✅ Testing & Deployment

