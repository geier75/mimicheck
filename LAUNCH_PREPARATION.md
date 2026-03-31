# 🚀 LAUNCH PREPARATION & COUNCIL REVIEW
> **Status:** CRITICAL REVIEW
> **Date:** 2025-11-20
> **Auditor:** The Council of 11

Der Rat hat getagt. Hier ist das Ergebnis der kritischen Prüfung und die Checkliste für den Launch.

---

## 🧐 1. Kritischer Review: "DACH Premium UX"

**Frontend Lead & Performance Engineer:**
> "Die neuen Animationen (`AnalysisAnimation`, `SpotlightCard`) sehen fantastisch aus, aber wir laufen Gefahr, ältere Laptops und Handys zu überhitzen. Canvas ist effizient, aber hunderte Event-Listener für Spotlight-Effekte sind teuer."

**Entscheidung:**
- ✅ **Spotlight Cards:** Ja, aber nur auf Desktop (Media Query `@media (hover: hover)`). Auf Mobile statischer Glow.
- ✅ **Animationen:** Partikel-Anzahl auf Mobile um 50% reduzieren (Performance Mode).

**Product Owner & The Critic:**
> "Wir haben jetzt eine wunderschöne Hülle, aber das 'Gehirn' fehlt noch teilweise. Die Fallbacks sind nett, aber für einen Launch brauchen wir echte AI-Power. Der User erwartet Ergebnisse, keine Demo-Daten."

**Entscheidung:**
- 🚨 **Priorität Shift:** Nach dem visuellen Polish MUSS sofort die Backend-Anbindung (Supabase Edge Functions) folgen.

---

## 🔑 2. API Key Audit (Launch Requirements)

Für den Live-Betrieb ("Production") benötigen wir zwingend folgende Schlüssel. Diese müssen in den **Supabase Edge Functions Secrets** hinterlegt werden (NICHT im Frontend Code!).

### 🧠 AI & Intelligence (Core)
| Service | Variable Name | Zweck | Status |
|---------|---------------|-------|--------|
| **OpenAI** | `OPENAI_API_KEY` | GPT-4o für Dokumenten-Analyse & Chat | 🔴 Fehlt |
| **Anthropic** | `ANTHROPIC_API_KEY` | Claude 3.5 Sonnet für komplexe PDF-Mappings (besser als GPT-4) | 🔴 Fehlt |

### 🗄️ Backend & Database
| Service | Variable Name | Zweck | Status |
|---------|---------------|-------|--------|
| **Supabase** | `SUPABASE_URL` | Datenbank-Verbindung | ✅ Vorhanden |
| **Supabase** | `SUPABASE_SERVICE_ROLE_KEY` | Admin-Zugriff für Edge Functions (Bypass RLS) | ✅ Vorhanden |
| **Supabase** | `SUPABASE_ANON_KEY` | Public Client Zugriff | ✅ Vorhanden |

### 💳 Payments & Legal
| Service | Variable Name | Zweck | Status |
|---------|---------------|-------|--------|
| **Stripe** | `STRIPE_SECRET_KEY` | Zahlungsabwicklung (Abo/Einmalzahlung) | 🟡 Optional für V1 |
| **Stripe** | `STRIPE_WEBHOOK_SECRET` | Bestätigung von Zahlungen | 🟡 Optional für V1 |

### 📧 Communication
| Service | Variable Name | Zweck | Status |
|---------|---------------|-------|--------|
| **Resend / SendGrid** | `RESEND_API_KEY` | Transaktionale E-Mails (Willkommen, Analyse fertig) | 🟡 Empfohlen |

---

## 📝 3. Finaler Schlachtplan (The Execution Order)

Basierend auf dem Review hat der Rat die Reihenfolge angepasst:

1.  **Visual Completion (Heute):**
    - [ ] `SpotlightCard` in Dashboard integrieren (Desktop only).
    - [ ] Mobile Optimierung der Animationen.
2.  **Brain Surgery (Morgen):**
    - [ ] Setzen der API Keys in Supabase (`supabase secrets set ...`).
    - [ ] Aktivieren der "echten" Edge Functions (weg von Mock-Daten).
3.  **Launch Check:**
    - [ ] E2E Test: Upload -> Analyse -> Ergebnis (mit echten Keys).

---

**Votum des Rates:**
"Die App sieht jetzt aus wie ein Unicorn. Jetzt muss sie auch so denken. Besorge die API Keys, während wir das Frontend finalisieren."

**Signed:**
*The Council of 11*
