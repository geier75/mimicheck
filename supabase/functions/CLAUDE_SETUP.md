# 🤖 Claude API Integration Setup

## 1. API Key in Supabase konfigurieren

### Option A: Supabase Dashboard (Empfohlen)
1. Gehe zu https://supabase.com/dashboard
2. Wähle dein Projekt
3. **Settings** → **Edge Functions** → **Secrets**
4. Füge hinzu:
   ```
   CLAUDE_API_KEY=sk-ant-api03-... (dein Claude API Key)
   ```
5. Klicke **Save**

### Option B: Supabase CLI
```bash
supabase secrets set CLAUDE_API_KEY=sk-ant-api03-...
```

## 2. Edge Functions deployen

```bash
# Alle Functions deployen
supabase functions deploy

# Oder einzeln
supabase functions deploy analyze-pdf-claude
supabase functions deploy fill-pdf-claude
```

## 3. Testen

### Lokal testen (mit Supabase CLI)
```bash
# Starte Supabase lokal
supabase start

# Serve Edge Function lokal
supabase functions serve analyze-pdf-claude --env-file .env.local

# Test Request
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/analyze-pdf-claude' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "pdfUrl": "https://example.com/formular.pdf",
    "formType": "buergergeld"
  }'
```

### Production testen
1. Öffne die App: http://localhost:8005/antraege
2. Klicke auf einen Antragstyp (z.B. Bürgergeld)
3. Lade ein PDF hoch
4. Claude analysiert automatisch die Felder
5. Klicke "Formular automatisch ausfüllen"
6. Claude erstellt intelligente Mapping-Vorschläge

## 4. Claude API Features

### PDF-Analyse (`analyze-pdf-claude`)
- Erkennt Formularfelder in PDFs
- Klassifiziert Feldtypen (Text, Datum, Zahl, Checkbox)
- Gibt Hints für benötigte Daten

### Intelligentes Mapping (`fill-pdf-claude`)
- Matched Profildata auf Formularfelder
- Gibt Confidence Score (0-1) für jedes Mapping
- Erkennt fehlende Pflichtfelder
- Gibt kontextuelle Hinweise

## 5. Kosten

Mit deinem Claude API Key:
- **Input**: ~$3 pro Million Tokens
- **Output**: ~$15 pro Million Tokens

Typischer Antrag (ca. 3000 Tokens gesamt):
- **Pro Antrag**: ~$0.03 (3 Cent)
- **1000 Anträge/Monat**: ~$30

## 6. Fehlerbehandlung

Wenn Fehler auftreten:
1. Prüfe Browser Console (F12)
2. Prüfe Supabase Function Logs:
   ```bash
   supabase functions logs analyze-pdf-claude
   ```
3. Teste API Key:
   ```bash
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $CLAUDE_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":1024,"messages":[{"role":"user","content":"Hello"}]}'
   ```

## 7. Nächste Schritte

- [ ] PDF-Parser integrieren (pdf-parse, pdf.js)
- [ ] PDF tatsächlich mit pdf-lib ausfüllen
- [ ] OCR für gescannte PDFs (Tesseract.js)
- [ ] Caching für häufige Formulare
- [ ] Rate Limiting für Claude API

## Weitere Infos

- Claude API Docs: https://docs.anthropic.com/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
