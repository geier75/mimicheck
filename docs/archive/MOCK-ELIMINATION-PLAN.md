# 🎯 MOCK ELIMINATION PLAN
**Ziel:** Alle Mock-Funktionen durch echte Backend-Implementierungen ersetzen

## 📊 AKTUELLER STATUS

### ✅ Backend Services VORHANDEN:
- `/backend/services/llm_service.py` - LLM Integration
- `/backend/services/pdf_extraction_service.py` - PDF Text-Extraktion
- `/backend/services/pdf_filler.py` - PDF Formular-Ausfüllung
- `/backend/services/pdf_extractor.py` - PDF Field-Erkennung
- `/backend/services/field_normalizer.py` - Feld-Normalisierung

### ❌ MOCKS DIE WEG MÜSSEN:

#### 1. **InvokeLLM** (AI-Analyse)
- **Datei:** `src/api/integrations.js`
- **Mock:** Gibt Fallback-Text zurück
- **Echte Impl:** Backend `/api/llm/invoke` - ✅ VORHANDEN

#### 2. **ExtractDataFromUploadedFile** (PDF-Extraktion)
- **Datei:** `src/api/integrations.js`
- **Mock:** Gibt Dummy-Daten zurück
- **Echte Impl:** Backend `/api/extract-data/:fileId` - ✅ VORHANDEN

#### 3. **uploadFile** (File Upload)
- **Datei:** `src/api/integrations.js`
- **Mock:** Nutzt bereits Backend, aber ohne Storage
- **Echte Impl:** Backend `/api/upload` + S3 Storage - ⚠️ TEILWEISE

#### 4. **analyzeAbrechnung** (Nebenkostenanalyse)
- **Datei:** `src/api/integrations.js`
- **Mock:** Nutzt bereits Backend
- **Echte Impl:** Backend `/api/analyze` - ✅ VORHANDEN

#### 5. **getReport** (Report-Download)
- **Datei:** `src/api/integrations.js`
- **Mock:** Nutzt bereits Backend
- **Echte Impl:** Backend `/api/report/:id` - ⚠️ FEHLT

#### 6. **SendEmail** (E-Mail-Versand)
- **Datei:** `src/api/integrations.js`, `src/api/localClient.js`
- **Mock:** Console.log only
- **Echte Impl:** Backend + SendGrid - ⚠️ FEHLT

#### 7. **GenerateImage** (Bild-Generierung)
- **Datei:** `src/api/integrations.js`
- **Mock:** Placeholder-URL
- **Echte Impl:** DALL-E API - ⚠️ FEHLT (LOW PRIO)

#### 8. **Stripe Functions**
- **Datei:** `src/api/functions.js`
- **Mock:** `validateStripeSetup`, `createStripeCheckoutSession`
- **Echte Impl:** Backend Stripe Integration - ⚠️ FEHLT

---

## 🚀 STEP-BY-STEP IMPLEMENTATION PLAN

### **PHASE 1: KRITISCHE MOCKS (Heute!)** 🔥

#### ✅ Step 1: OpenAI API aktivieren
- [ ] `.env` im Backend prüfen/erstellen
- [ ] `OPENAI_API_KEY` setzen
- [ ] Test: `/api/llm/invoke` aufrufen

#### ✅ Step 2: LLM Integration im Frontend aktivieren
- [ ] `src/api/integrations.js` - `InvokeLLM` entfernen Mock-Fallback
- [ ] Error Handling verbessern
- [ ] Test: KI-Assistent nutzen

#### ✅ Step 3: PDF-Extraktion aktivieren
- [ ] `ExtractDataFromUploadedFile` - Backend Call testen
- [ ] Frontend: Upload → Extract → Display
- [ ] Test: Echte PDF hochladen

#### ✅ Step 4: File Upload mit echtem Storage
- [ ] Temporäre Datei-Speicherung testen
- [ ] Optional: S3 Integration (später)
- [ ] Test: Upload funktioniert

---

### **PHASE 2: REPORT GENERATION (Morgen)** 📄

#### Step 5: Report-Service implementieren
- [ ] Backend: `/api/report/:abrechnungId` Endpoint erstellen
- [ ] HTML → PDF Generierung (Playwright/wkhtmltopdf)
- [ ] Frontend: Download-Button verdrahten

---

### **PHASE 3: BUSINESS FEATURES (Nächste Woche)** 💼

#### Step 6: E-Mail Service
- [ ] SendGrid Account anlegen
- [ ] Backend: E-Mail-Templates
- [ ] Benachrichtigungen implementieren

#### Step 7: Stripe Integration
- [ ] Stripe Test-Account
- [ ] Backend: Checkout/Portal Endpoints
- [ ] Frontend: Billing UI aktivieren

---

### **PHASE 4: OPTIONAL (Nice-to-Have)** ✨

#### Step 8: Bild-Generierung
- [ ] DALL-E API Integration
- [ ] Use-Cases definieren

---

## 📝 CHECKLISTE PRO MOCK

Für jeden Mock:
1. ✅ Backend-Endpoint existiert?
2. ✅ .env Variablen gesetzt?
3. ✅ Frontend API-Call korrekt?
4. ✅ Error Handling implementiert?
5. ✅ Manueller Test durchgeführt?
6. ✅ Mock-Code entfernt oder deprecated?

---

## 🎯 ERFOLGSKRITERIEN

**Phase 1 Done = MVP Funktional:**
- ✅ Echte PDF-Analyse mit OpenAI
- ✅ Echte Daten-Extraktion
- ✅ Upload funktioniert real
- ✅ KI-Assistent antwortet echt

**Phase 2 Done = Vollständiger Flow:**
- ✅ Upload → Analyse → Report Download E2E

**Phase 3 Done = Business-Ready:**
- ✅ Zahlungen funktionieren
- ✅ E-Mail-Benachrichtigungen

---

**Status:** Phase 1 - Step 1 in Arbeit
**Nächster Schritt:** OpenAI API Key einrichten
