# 🕵️‍♂️ EXPERTEN-INVENTUR & PROJEKT-ANALYSE
**Status:** ABGESCHLOSSEN
**Datum:** 19.11.2025
**Team:** 10 Senior-Experten (Architektur, Security, Frontend, Backend, DevOps, QA)

---

## 1. EXECUTIVE SUMMARY
Das Projekt **"Nebenkosten Knacker" (MimiCheck)** ist eine Web-Plattform zur automatisierten Prüfung von Miet-Nebenkostenabrechnungen. Es handelt sich um eine **hybride Architektur** mit einem modernen React-Frontend und einem Python/FastAPI-Backend, das stark auf PDF-Verarbeitung und KI-Integration (LLM) setzt.

**Gesamteindruck:**
Das Verzeichnis enthält faktisch **ZWEI getrennte Projekte** mit unterschiedlichen Tech-Stacks:
1.  **Haupt-App (Root):** React (JS) + Python Backend.
2.  **Landing-Page/V2 (`mimicheck-landing`):** React 19 (TS) + Node.js Backend.
Das Root-Verzeichnis ist zudem überflutet mit Dokumentations-Fragmenten.

---

## 2. TECHNOLOGIE-STACK INVENTUR

### 🅰️ PROJEKT A: Haupt-App (Root)
**Fokus:** Die eigentliche "Nebenkosten Knacker" Anwendung.

#### 🎨 Frontend (`/src`)
*   **Core:** React 18, Vite 6.1.0
*   **Sprache:** JavaScript (Legacy-Gefühl).
*   **UI:** Tailwind CSS, Radix UI.

#### ⚙️ Backend (`/backend`)
*   **Framework:** FastAPI (Python 3.11+)
*   **Datenbank:** PostgreSQL (Supabase), SQLAlchemy.
*   **PDF & AI:** Schwerer Fokus auf PDF-Analyse (PyPDF2, pdfminer) und LLMs.

### 🅱️ PROJEKT B: Landing Page / Modern Stack (`/mimicheck-landing`)
**Fokus:** Vermutlich Marketing oder eine geplante V2. Technisch deutlich moderner!

*   **Core:** **React 19**, Vite 7.1.7, **TypeScript**.
*   **Backend:** Node.js (Express) mit **tRPC**.
*   **Datenbank:** **Drizzle ORM** (statt SQLAlchemy).
*   **UI:** Tailwind v4, Framer Motion.
*   **Zustand:** Wirkt sehr "frisch" und sauber aufgesetzt.

---

## 3. INTEGRATIONS-ARCHITEKTUR (DER "MISSING LINK")
Das Team hat die Verbindung zwischen den beiden Projekten aufgedeckt. Es handelt sich um ein **verteiltes System** mit gemeinsamer Datenbasis.

*   **Shared Database:** Beide Projekte nutzen **dieselbe Supabase-Instanz** (`yjjauvmjyhlxcoumwqlj`).
*   **Auth-Bridge:**
    *   User loggt sich auf der Landing Page (`mimicheck-landing`) ein.
    *   Landing Page leitet weiter an `${mainUrl}/auth-bridge` (Root-App).
    *   Root-App übernimmt die Session Tokens.
*   **Arbeitsteilung:**
    *   **Landing Page:** Marketing, User-Onboarding, Auth.
    *   **Main App:** Die eigentliche "Arbeitsmaschine" (PDF-Analyse, Dashboards).

**Bewertung:** Diese Architektur ist funktional, aber komplex zu warten (zwei getrennte Codebases, zwei Build-Pipelines, Synchronisations-Risiko bei Auth).

---

## 4. DAS VERHÖR: KRITISCHE FRAGEN AN DAS PROJEKT
*Das Experten-Team stellt folgende Fragen "an den Raum", um die nächsten Schritte zu definieren:*

### Strategische Ausrichtung
1.  **Migration oder Koexistenz?** Ist der Plan, die "alte" Main App (Root) Stück für Stück in die moderne `mimicheck-landing` Struktur (React 19 + TS) zu migrieren? Oder sollen beide dauerhaft getrennt bleiben?
2.  **Warum zwei Backends?** Wir haben FastAPI (Root) UND Node.js/tRPC (`mimicheck-landing`). Das erhöht die Komplexität enorm. Welches Backend ist die Zukunft?

### Architektur & Code-Qualität
3.  **Warum JS statt TS in der Main App?** Bei einem finanzkritischen Thema (Abrechnungen) ist Typensicherheit essenziell.
4.  **PDF-Verarbeitung:** Findet die Analyse im Browser (`pdf-lib`) oder im Backend (`pdfminer`, `PyPDF2`) statt? Wo ist die "Single Source of Truth"?

### Zustand & Stabilität
5.  **Sind die Tests grün?** Es gibt `smoke-test.sh` und Vitest configs. Wann liefen die zuletzt erfolgreich?
6.  **Deployment-Status:** `LIVE-JETZT.sh`, `START-PRODUCTION.sh`, `BACKEND-DEPLOY.sh`. Welches Skript ist das richtige?
7.  **Mock-Daten:** Wurden *wirklich* alle Mocks entfernt?

### Business Logic
8.  **KI-Kosten & Datenschutz:** Gibt es ein Kosten-Monitoring für OpenAI/Anthropic? Werden User-Daten (Mietverträge) nach der Analyse sicher gelöscht?

---

## 5. EMPFOHLENE SOFORT-MASSNAHMEN (ACTION PLAN)

1.  **Dokumentations-Konsolidierung:** Alle `.md` Dateien im Root in einen `/docs` Ordner verschieben.
2.  **Architektur-Entscheidung:** Klären, ob wir migrieren oder stabilisieren.
3.  **Deployment-Pipeline fixieren:** Ein einziges Skript für beide Apps.
4.  **Backend-Check:** Prüfen, ob FastAPI und Node.js Backend parallel laufen müssen.

---

**Fazit:** Das Projekt hat eine solide, moderne Basis, leidet aber unter "Organisations-Fett". Es muss gestrafft, strukturiert und professionell aufgeräumt werden, bevor neue Features gebaut werden.
