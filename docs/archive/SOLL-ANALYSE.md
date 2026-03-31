# SOLL-Analyse – „Nebenkosten-Knacker / Staatshilfen.ai"

## 0) Zielbild (nach NAPP: klarer Zweck, messbar, inkrementell)

**Zweck:** Aus dem hochwertigen Frontend-Prototyp ein funktionales MVP mit echtem Backend, KI-Analyse und Abrechnung zu machen – DSGVO-konform, testbar, deploybar.

**Nachweise (KPIs) bis MVP:**
- **T1:** Upload → Analyse → Bericht läuft End-to-End (≤ 10s p95).
- **T2:** 100 echte Uploads/Tag stabil (Fehlerrate < 1%).
- **T3:** Mind. 1 Zahlungsplan via Stripe Checkout/Portal.
- **T4:** Datenschutz: AVV, Löschkonzept, Telemetrie nur anonymisiert.

---

## 1) Zielarchitektur (High-Level)

### Frontend (bestehend)
- React 18 + Vite + shadcn/ui, Router, Dark Mode.
- Auth-Guard + API-Client; Upload-Widget; Berichtsansichten.

### Backend (neu, 2 Stufen):

#### Stufe A: Managed (schnellste Route)
MIMITECH Functions & Integrations als Backend:
- File Upload (S3-kompatibel)
- PDF-Analyse/Autofill Functions
- LLM-Analyse (Reflexion/Scoring)
- Stripe-Functions (Checkout, Portal)
- Auth via MIMITECH Session/JWT.

#### Stufe B: Eigenes API-Gateway (erweiterbar)
FastAPI (Python) vor MIMITECH als „BFF/Policy-Layer":
- Endpunkte /api/upload, /api/analyze, /api/report, /api/billing.
- Postgres (Neon) + Redis (Upstash) für Persistenz/Queues.
- Task-Runner (RQ/Celery) für PDFs & KI-Jobs.

**Empfehlung:** Stufe A jetzt (Time-to-Value), Stufe B optional bei Skalierung/Compliance-Spezialfällen.

### Datenebene
- Dokumente (PDF/Images) → Object Storage.
- Metadaten/Ergebnisse → Postgres (oder MIMITECH Entities).
- Protokolle/Telemetry → OpenTelemetry → Loki/Tempo/Grafana (oder MIMITECH Logs).

### Sicherheit
- JWT-Session (HttpOnly), CSRF-Schutz für mutierende Calls.
- Upload-Virenscan (ClamAV oder Cloud-Scanner).
- DSGVO: Löschroutinen + Consent Banner (Tracking off by default).

---

## 2) Domänenmodell (MVP-Minimum)

### Entities
```javascript
User { 
  id, email, role, created_at 
}

Abrechnung { 
  id, user_id, title, period_start, period_end, 
  file_url, status: [uploaded|processing|done|error], 
  created_at 
}

Analyse { 
  id, abrechnung_id, findings_json, 
  potential_savings_eur, confidence, created_at 
}

Report { 
  id, abrechnung_id, url, format: [pdf|html], 
  created_at 
}

Billing { 
  id, user_id, plan, stripe_customer_id, status 
}
```

### Beziehungen
- 1 User : n Abrechnungen
- 1 Abrechnung : 1 Analyse : 1 Report (mindestens)

---

## 3) API-Vertrag (SOLL)

### `POST /api/upload`
- **Req:** multipart/form-data (file, title, period_start, period_end)
- **Res:** `{ abrechnung_id, file_url, status: "uploaded" }`

### `POST /api/analyze`
- **Req:** `{ abrechnung_id }`
- **Res:** `{ analyse_id, potential_savings_eur, confidence, findings }`

### `GET /api/report/:abrechnung_id`
- **Res:** `{ report_url, format }`

### `POST /api/billing/checkout`
- **Req:** `{ plan }`
- **Res:** `{ checkout_url }`

### `GET /api/billing/portal`
- **Res:** `{ portal_url }`

**In Stufe A** mappen diese Endpunkte 1:1 auf MIMITECH Functions/Integrations.

---

## 4) Frontend-Anpassungen (SOLL)

### API-Client (`/src/api/client.ts`)
- Wrapper mit fetch + Retry + Auth-Header.
- Fehler-Normierung `({ code, message })`.

### Upload-Flow (`/src/pages/Upload.jsx`)
- Vor dem Aufruf prüfen: `mimitech?.integrations?.Core` existiert; sonst Fallback auf `/api/upload`.
- UI-States: uploading/processing/done/error.

### Abrechnungen & Bericht
- Polling oder SSE für processing → done.
- „Bericht herunterladen" (PDF/HTML).

### Auth Guard
- Routen /Upload, /Abrechnungen, /Dashboard nur mit Session.
- Login/Logout Buttons + Session-Timer.

### Billing UI
- Pricing → Checkout → Portal Links.
- Plan-Badge im Header.

---

## 5) Betriebs-/Qualitätsanforderungen

### Leistung
- p95 Latenz Upload→Analyse: ≤ 10s (bei 5MB PDF).
- p95 Report Render: ≤ 2s.

### Observability
- Request/Job Traces (Trace-ID in FE → BE → Function).
- Technische Dashboards: Fehlerquote, Laufzeiten, Speicherauslastung.

### Sicherheit & Datenschutz
- Verschlüsselung in Transit (TLS) & at Rest (Bucket).
- Datenminimierung: nur erforderliche Felder speichern.
- Löschkonzept: Abrechnung + Report nach X Tagen ohne aktives Abo.

---

## 6) Migrations-/Implementierungsplan

### Sprint 1 (MVP-Core, 1–2 Wochen)

#### MIMITECH „Core" aktivieren
- App-ID, Domains, Auth aktiv.
- Functions anlegen:
  - `analyzePdfFields(pdfUrl)` → fields
  - `fillPdfForm(pdfUrl, fields)` → filledPdfUrl
  - `llmAnalyzeAbrechnung(fileUrl)` → {savings, findings, confidence}
  - `createStripeCheckoutSession(plan)` → url
  - `createStripePortalSession()` → url

#### Frontend verdrahten
- `src/api/integrations.js` fixen (Guard gegen `mimitech.integrations.Core undefined`).
- Upload+Analyse End-to-End (mockfrei).

#### Berichtserstellung
- HTML-Report → PDF (Function), Link speichern.

#### Minimal Billing
- Pricing → Checkout & Portal Buttons aktiv.

**Akzeptanzkriterien Sprint 1:**
- ✅ E2E-Demo mit echtem PDF.
- ✅ Report-Download funktioniert.
- ✅ Ein bezahlter Testplan via Stripe.

### Sprint 2 (Qualität, 1–2 Wochen)
- Error Boundaries, Retry-Policy, File-Virenscan.
- Telemetry + Dashboards.
- Rate Limits & CSRF.
- DSGVO: Datenschutzhinweise + Löschjob (täglich).

### Sprint 3 (Performance/Skalierung, 1–2 Wochen)
- Hintergrundjobs/Queues (falls Stufe B).
- Caching (feldbasierte Wiederhol-Analysen).
- PDF-Parser-Heuristiken/LLM-Prompt-Tuning (Reflection Tokens, K).

---

## 7) Technische Details & Snippets

### FE: MIMITECH Guard (Fix für „undefined is not an object")

```javascript
// src/api/integrations.js
import client from './mimitechClient';

export async function uploadFile(file) {
  const mimitech = client();
  const core = mimitech?.integrations?.Core;
  if (!core || !core.UploadFile) {
    // Fallback: eigenes Backend
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { 
      method: 'POST', 
      body: fd, 
      credentials: 'include' 
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  }
  return core.UploadFile({ file });
}
```

### BE (Stufe B) – FastAPI Skelett

```python
# api/main.py
from fastapi import FastAPI, UploadFile, File, Depends
from pydantic import BaseModel

app = FastAPI()

class UploadResp(BaseModel):
  abrechnung_id: str
  file_url: str
  status: str = "uploaded"

@app.post("/api/upload", response_model=UploadResp)
async def upload(file: UploadFile = File(...)):
  # store → return ids/urls
  return UploadResp(
    abrechnung_id="abc123", 
    file_url="s3://...", 
    status="uploaded"
  )

@app.post("/api/analyze")
async def analyze(abrechnung_id: str):
  # call MIMITECH function llmAnalyzeAbrechnung
  return {
    "analyse_id": "an_1", 
    "potential_savings_eur": 120.0, 
    "confidence": 0.82, 
    "findings": []
  }
```

### CI Matrix (GitHub Actions)
- Node LTS + pnpm/yarn
- Python 3.11–3.13 (für Tools/BE)
- Lint, Type-Check (optional), Unit-Tests, e2e Smoke (Upload→Analyse stub)

---

## 8) Risiken & Gegenmaßnahmen

| Risiko | Auswirkung | Gegenmaßnahme |
|--------|------------|---------------|
| LLM-Qualität schwankt | Inkonsistente Befunde | Reflection-Prompt + K-Aggregation, Confidence-Score anzeigen |
| Große PDFs (Scans) | Lange Laufzeit | asynchron verarbeiten + Benutzerinfo „Wir benachrichtigen per Mail" |
| Stripe/Testmode → Prod | Zahlungsabbrüche | Doppeltes Secrets-Set, Webhooks in CI simulieren |
| DSGVO-Anfragen (Löschung) | Aufwand/Compliance | Löschroutinen & Self-Service „Daten entfernen" im Profil |

---

## 9) Akzeptanztests (UAT)

1. **Upload-Pfad:** PDF hochladen → Statusänderungen sichtbar → Analyseergebnis erscheint → Bericht downloadbar.
2. **Fehlerfall:** Ungültige Datei → Soft-Fehler mit Retry/Support-Hinweis.
3. **Billing-Pfad:** Preisplan wählen → Checkout → Portal → Status im UI aktualisiert.
4. **DSGVO:** Nutzer löscht Konto → Dokumente & Metadaten nachweislich entfernt.

---

## 10) Roadmap (Kurz)

- **Woche 1–2:** Stufe A komplett (MIMITECH Functions, Stripe, Upload/Analyse/Report)
- **Woche 3–4:** Qualität & Compliance (Telemetry, Virenscan, Rate-Limit, Löschjobs)
- **Woche 5–6:** Stufe B optional (BFF/Policy-Layer, Persistenz, Queues)

---

## 11) Go-Live Checkliste

- [ ] Domain + TLS
- [ ] .env/Secrets (MIMITECH, Stripe, Storage)
- [ ] Error Pages (4xx/5xx)
- [ ] Backups/Retention
- [ ] Monitoring-Dashboard verlinkt
- [ ] Datenschutz/Impressum/AGB aktualisiert

---

## Kurzfassung

Wir gehen **zweistufig** vor: zunächst MIMITECH-Backend (Functions/Integrations) für schnellen MVP-Wert, danach optional eigenes API-Gateway für Skalierung/Compliance. Frontend bekommt robuste Guards, echte Flows und Billing. Qualität, Sicherheit und DSGVO sind mit konkreten Maßnahmen ab Sprint 2 unterlegt.

---

**Erstellt:** 21. Oktober 2025  
**Status:** Planung  
**Nächster Schritt:** Sprint 1 starten
