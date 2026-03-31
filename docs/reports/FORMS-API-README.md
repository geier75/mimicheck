# 🚀 Universal Forms API - Dokumentation

**Universal Antrags-Assistent** - Extrahiert und befüllt beliebige PDF-Formulare automatisch.

---

## 📋 Übersicht

Die Forms API ermöglicht:
- ✅ **PDF-Extraktion**: Erkennt Formularfelder (AcroForm + Text-Pattern)
- ✅ **Intelligentes Befüllen**: Mappt Profile-Daten auf Felder
- ✅ **Normalisierung**: IBAN, Datum, PLZ, Telefon automatisch formatiert
- ✅ **OCR-Support**: Scans mit Tesseract (optional)
- ✅ **Fallback**: HTML→PDF wenn kein AcroForm

---

## 🎯 API Endpoints

### Base URL: `http://localhost:8000/api/forms`

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| **POST** | `/extract` | PDF hochladen & FormSchema extrahieren |
| **POST** | `/fill/{upload_id}` | Formular befüllen |
| **POST** | `/extract-and-fill` | Extract + Fill in einem Schritt |
| **GET** | `/schema/{upload_id}` | FormSchema abrufen |
| **DELETE** | `/form/{upload_id}` | Formular löschen |
| **GET** | `/normalize` | Test: Wert normalisieren |
| **GET** | `/health` | Status der Forms API |

---

## 🔧 Usage Examples

### 1️⃣ PDF Extrahieren

**Request:**
```bash
curl -X POST "http://localhost:8000/api/forms/extract" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/form.pdf" \
  -F "ocr_enabled=true"
```

**Response:**
```json
{
  "success": true,
  "upload_id": "a1b2c3d4-...",
  "form_schema": {
    "form_id": "auto/12345",
    "title": "Wohngeld Antrag",
    "fields": [
      {
        "id": "vorname",
        "label": "Vorname",
        "type": "string",
        "required": true
      },
      {
        "id": "geburtsdatum",
        "label": "Geburtsdatum",
        "type": "date",
        "required": true
      },
      {
        "id": "iban",
        "label": "IBAN",
        "type": "iban",
        "required": true
      }
    ],
    "source": {
      "file": "form.pdf",
      "has_acroform": true
    }
  }
}
```

---

### 2️⃣ Formular Befüllen

**Request:**
```bash
curl -X POST "http://localhost:8000/api/forms/fill/a1b2c3d4-..." \
  -H "Content-Type: application/json" \
  -d '{
    "mappings": [
      {
        "field_id": "vorname",
        "label": "Vorname",
        "value": "Max"
      },
      {
        "field_id": "nachname",
        "value": "Mustermann"
      },
      {
        "field_id": "geburtsdatum",
        "value": "1990-05-15"
      },
      {
        "field_id": "iban",
        "value": "DE89370400440532013000"
      }
    ],
    "title": "Wohngeld Antrag - Max Mustermann",
    "flatten": true
  }'
```

**Response:**
```json
{
  "success": true,
  "output_url": "/outputs/forms/filled_a1b2c3d4-....pdf",
  "method": "acroform",
  "filled_count": 4
}
```

**Download:**
```bash
curl -o filled_form.pdf "http://localhost:8000/outputs/forms/filled_a1b2c3d4-....pdf"
```

---

### 3️⃣ Extract + Fill in einem Schritt

**Request:**
```bash
curl -X POST "http://localhost:8000/api/forms/extract-and-fill" \
  -F "file=@/path/to/form.pdf" \
  -F 'mappings=[
    {"field_id":"vorname","value":"Max"},
    {"field_id":"nachname","value":"Mustermann"},
    {"field_id":"geburtsdatum","value":"1990-05-15"},
    {"field_id":"iban","value":"DE89370400440532013000"}
  ]' \
  -F "title=Wohngeld Antrag" \
  -F "ocr_enabled=true"
```

**Response:** Wie `/fill` (direkt befülltes PDF)

---

### 4️⃣ Wert Normalisieren (Test)

**IBAN normalisieren:**
```bash
curl "http://localhost:8000/api/forms/normalize?value=DE89370400440532013000&field_type=iban"
```

**Response:**
```json
{
  "original": "DE89370400440532013000",
  "normalized": "DE89 3704 0044 0532 0130 00",
  "field_type": "iban",
  "is_valid": true
}
```

**Datum normalisieren:**
```bash
curl "http://localhost:8000/api/forms/normalize?value=1990-05-15&field_type=date"
```

**Response:**
```json
{
  "original": "1990-05-15",
  "normalized": "15.05.1990",
  "field_type": "date",
  "is_valid": true
}
```

---

## 🔧 Feldtypen & Normalisierung

| Feldtyp | Beschreibung | Beispiel Input | Beispiel Output |
|---------|--------------|----------------|-----------------|
| `string` | Text | `"Max Mustermann"` | `"Max Mustermann"` |
| `date` | Datum | `"1990-05-15"` | `"15.05.1990"` |
| `iban` | IBAN | `"DE89370400440532013000"` | `"DE89 3704 0044 0532 0130 00"` |
| `plz` | PLZ (5-stellig) | `"1234"` | `"01234"` |
| `tel` | Telefon | `"0123/456789"` | `"0123 456789"` |
| `email` | Email | `"Max@Example.COM"` | `"max@example.com"` |
| `number` | Zahl | `"1.234,56"` | `"1234.56"` |

---

## 📦 Installierte Libraries

```bash
# Backend Dependencies
pdfminer.six    # PDF-Text-Extraktion
pdfrw           # AcroForm lesen/schreiben
pdfplumber      # Enhanced PDF-Parsing
pikepdf         # Alternative PDF-Manipulation
pytesseract     # OCR (optional)
weasyprint      # HTML→PDF
jinja2          # Template-Engine
```

---

## 🧪 Schnelltest

### 1. Backend Status prüfen:
```bash
curl http://localhost:8000/api/forms/health
```

### 2. Normalisierung testen:
```bash
curl "http://localhost:8000/api/forms/normalize?value=DE89370400440532013000&field_type=iban"
```

### 3. Test-PDF erstellen (simple):
```python
from services.pdf_filler import PDFFiller

filler = PDFFiller()
filler.create_simple_form_pdf(
    "test_output.pdf",
    "Test Formular",
    {
        "Name": "Max Mustermann",
        "Geburtsdatum": "15.05.1990",
        "IBAN": "DE89 3704 0044 0532 0130 00"
    }
)
```

---

## 🚀 Nächste Schritte

### **Jetzt implementieren:**

1. **Frontend-Integration**
   - Upload-Component für beliebige PDFs
   - Mapping-Review-UI (Feld-Zuordnung prüfen)
   - Download befüllter PDFs

2. **Profil-Management**
   - `POST /api/profile` (einmalig speichern)
   - Auto-Mapping: Profil → Formular

3. **Eligibility Engine**
   - YAML-Regeln für Anträge
   - `POST /api/forms/eligibility`
   - LLM-Begründungen

4. **Form-Finder**
   - Meilisearch Index
   - 30 Top-Anträge (Wohngeld, Elterngeld, etc.)
   - `GET /api/forms/search?q=wohngeld`

---

## 📊 Aktueller Stand

✅ **FERTIG (Option B - 30 Min):**
- PDF Extractor Service
- PDF Filler Service (AcroForm + HTML-Fallback)
- Field Normalizer (7 Typen)
- Forms API Endpoints (6 Routes)
- Dependencies installiert
- Backend läuft mit Forms API

⏳ **OFFEN:**
- Form-Finder Seed (30 Anträge)
- Eligibility Rules (YAML)
- Profile API
- Frontend-Integration

---

## 🎯 VISION: Universal Antrags-Copilot

**Ziel:** Beliebigen Antrag hochladen → KI prüft Anspruch → füllt alle Felder automatisch → fertiges PDF zurück.

**Unterstützte Anträge (geplant):**
- 🏠 Wohngeld
- 👶 Elterngeld
- 💰 Bürgergeld
- 🎓 BAföG
- 🏥 Krankenkassen-Anträge
- 🏢 KfW/L-Bank Förderungen
- 🏛️ Kommunale Anträge
- 🎁 Stiftungen

**Stack:**
- **Backend:** FastAPI + PDF-Libraries
- **LLM:** OpenAI GPT-4o-mini (Semantik + Begründung)
- **Search:** Meilisearch (Form-Index)
- **Frontend:** React + Upload UI

---

## 💬 Support

**Dokumentation:** Siehe diese Datei  
**API Docs:** http://localhost:8000/docs  
**Health Check:** http://localhost:8000/api/forms/health

**Fragen?** Erstellt in 30 Min - ready für Testing! 🚀
