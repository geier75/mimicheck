# 🚀 EDGE FUNCTION SETUP - Anspruchsanalyse

## ❌ **PROBLEM:**
```
Failed to send a request to the Edge Function
```

**Grund:** Die `analyze-eligibility` Edge Function ist nicht deployed oder die Claude API Key fehlt.

---

## ✅ **LÖSUNG - SCHRITT FÜR SCHRITT:**

### **1. Claude API Key holen:**

1. Gehe zu: https://console.anthropic.com/
2. Erstelle einen API Key
3. Kopiere den Key (beginnt mit `sk-ant-api03-...`)

---

### **2. Supabase CLI installieren (falls nicht vorhanden):**

```bash
brew install supabase/tap/supabase
```

**Oder mit npm:**
```bash
npm install -g supabase
```

---

### **3. Supabase Login:**

```bash
supabase login
```

**Folge den Anweisungen im Browser**

---

### **4. Supabase Projekt verknüpfen:**

```bash
cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2

# Projekt ID von deinem Supabase Dashboard holen
supabase link --project-ref YOUR_PROJECT_ID
```

**Projekt ID findest du:**
- Supabase Dashboard → Settings → General → Reference ID

---

### **5. Claude API Key als Secret setzen:**

```bash
supabase secrets set CLAUDE_API_KEY=sk-ant-api03-YOUR-ACTUAL-KEY
```

**Ersetze `YOUR-ACTUAL-KEY` mit deinem echten Claude API Key!**

---

### **6. Edge Function deployen:**

```bash
supabase functions deploy analyze-eligibility
```

**Erwartete Ausgabe:**
```
Deploying Function analyze-eligibility...
Function analyze-eligibility deployed successfully!
```

---

### **7. Testen:**

```bash
# Test mit curl
curl -i --location --request POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/analyze-eligibility' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"userProfile":{"full_name":"Test User"}}'
```

---

## 🔍 **DEBUGGING:**

### **Logs anschauen:**

```bash
supabase functions logs analyze-eligibility
```

### **Secrets prüfen:**

```bash
supabase secrets list
```

**Sollte enthalten:**
- `CLAUDE_API_KEY`

---

## 📝 **ALTERNATIVE: Lokales Testen**

### **1. Lokale .env Datei erstellen:**

```bash
cd supabase
cp .env.example .env
```

### **2. .env bearbeiten:**

```bash
# supabase/.env
CLAUDE_API_KEY=sk-ant-api03-YOUR-ACTUAL-KEY
```

### **3. Supabase lokal starten:**

```bash
supabase start
```

### **4. Function lokal testen:**

```bash
supabase functions serve analyze-eligibility --env-file supabase/.env
```

**Dann in der App:**
- Ändere `supabase.functions.invoke()` URL zu `http://localhost:54321/functions/v1/analyze-eligibility`

---

## 🎯 **QUICK FIX (OHNE DEPLOYMENT):**

### **Fallback: Mock-Daten verwenden**

Öffne: `src/pages/AnspruchsAnalyse.jsx`

**Ersetze die `analyzeEligibility` Funktion:**

```javascript
const analyzeEligibility = async () => {
  if (!user) return;
  
  setIsAnalyzing(true);
  setError(null);

  try {
    // MOCK DATA für Testing
    const mockAnalysis = {
      eligiblePrograms: [
        {
          programName: "Wohngeld",
          programType: "wohngeld",
          eligibilityScore: 85,
          estimatedAmount: 250,
          reasoning: "Basierend auf Ihrem Einkommen und Ihrer Miete haben Sie wahrscheinlich Anspruch auf Wohngeld.",
          requiredDocuments: ["Einkommensnachweise", "Mietvertrag", "Personalausweis"],
          nextSteps: ["Antrag ausfüllen", "Dokumente hochladen", "Antrag einreichen"],
          officialLink: "https://www.wohngeld.org"
        },
        {
          programName: "Kindergeld",
          programType: "andere",
          eligibilityScore: 100,
          estimatedAmount: 250,
          reasoning: "Sie haben Anspruch auf Kindergeld für Ihre Kinder.",
          requiredDocuments: ["Geburtsurkunde", "Personalausweis"],
          nextSteps: ["Online-Antrag stellen"],
          officialLink: "https://www.arbeitsagentur.de/familie-und-kinder/kindergeld"
        }
      ],
      notEligiblePrograms: [
        {
          programName: "Bürgergeld",
          reason: "Ihr Einkommen liegt über der Grenze"
        }
      ],
      recommendations: [
        "Prüfen Sie regelmäßig Ihre Ansprüche",
        "Aktualisieren Sie Ihr Profil bei Änderungen"
      ],
      estimatedTotalMonthlyBenefit: 500
    };

    // Simuliere API Delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    setAnalysis(mockAnalysis);
  } catch (err) {
    console.error('Analyse-Fehler:', err);
    setError(err.message || 'Analyse fehlgeschlagen. Bitte versuchen Sie es erneut.');
  } finally {
    setIsAnalyzing(false);
  }
};
```

---

## 🔐 **SICHERHEIT:**

### **WICHTIG:**
- ✅ **NIEMALS** den Claude API Key in Git committen!
- ✅ `.env` ist in `.gitignore`
- ✅ Secrets nur über `supabase secrets set` setzen
- ✅ Anon Key ist OK für Frontend (RLS schützt Daten)

---

## 📊 **STATUS CHECKEN:**

### **1. Ist die Function deployed?**

```bash
supabase functions list
```

**Sollte zeigen:**
```
analyze-eligibility (deployed)
```

### **2. Sind die Secrets gesetzt?**

```bash
supabase secrets list
```

**Sollte zeigen:**
```
CLAUDE_API_KEY
```

### **3. Funktioniert die Function?**

```bash
supabase functions logs analyze-eligibility --tail
```

**Dann in der App "Ansprüche analysieren" klicken und Logs beobachten**

---

## 🎯 **ZUSAMMENFASSUNG:**

### **Für Production (Supabase Cloud):**
1. ✅ Claude API Key holen
2. ✅ `supabase secrets set CLAUDE_API_KEY=...`
3. ✅ `supabase functions deploy analyze-eligibility`
4. ✅ Testen in der App

### **Für Development (Lokal):**
1. ✅ `supabase/.env` erstellen mit Claude Key
2. ✅ `supabase start`
3. ✅ `supabase functions serve analyze-eligibility --env-file supabase/.env`
4. ✅ App URL auf `localhost:54321` ändern

### **Quick Fix (Ohne API):**
1. ✅ Mock-Daten in `AnspruchsAnalyse.jsx` verwenden
2. ✅ Später echte API integrieren

---

**Welche Lösung möchtest du verwenden?**
1. **Production Deployment** (empfohlen)
2. **Lokales Testing**
3. **Mock-Daten** (schnellster Fix)
