# 🏛 MASTER PLAN 2025: The "MimiCheck" Singularity
> **Status:** DEFINITIVE ROADMAP
> **Author:** The Council of 11 Experts
> **Date:** 2025-11-20

Dieser Plan konsolidiert alle bisherigen Fragmente (`TASKS.md`, `EXPERTEN_INVENTUR`, `VIDEO_SPECS`) in eine einzige, kompromisslose Vision. Ziel ist die Schaffung der **weltweit fortschrittlichsten KI-Formular-Plattform**.

---

## 🎯 Phase 1: The "Universal Brain" (AI & Backend Core)
**Owner:** AI Engineer & Backend Specialist
**Ziel:** Echte Intelligenz statt Mock-Daten. Der USP der App.

- [ ] **Universal PDF Analyzer (Edge Function):**
    - [ ] Implementierung von `analyze-pdf-universal` (Node.js/Deno).
    - [ ] Integration von Claude 3.5 Sonnet / GPT-4o für *echte* Feld-Erkennung.
    - [ ] Output: JSON-Schema aller Formularfelder + Kontext.
- [ ] **Universal Form Filler (Edge Function):**
    - [ ] Implementierung von `fill-pdf-universal`.
    - [ ] Mapping: User-Profil (`lebenssituation`) → PDF-Felder.
    - [ ] Generierung des ausgefüllten PDFs (pdf-lib).
- [ ] **Backend Unification Strategy:**
    - [ ] **Decision:** Move Logic to Supabase Edge Functions (Serverless).
    - [ ] Deprecate Python Backend for simple tasks, keep only for heavy OCR if needed.
    - [ ] Centralize API calls in `src/api/functions.js`.

## 🎨 Phase 2: The "8K Visual Singularity" (Frontend & UX)
**Owner:** Frontend Lead & Performance Engineer
**Ziel:** Ein Design, das Konkurrenten um Jahre voraus ist.

- [x] **Dashboard:** WebGL Animation + Glassmorphism (Done).
- [x] **AnspruchsAnalyse:** Green Theme + 8K Glass (Done).
- [x] **Anträge:** Blue Theme + Fallback (Done).
- [ ] **Upload Page Upgrade:**
    - [ ] Integration `VideoBackground` (Theme: 'upload').
    - [ ] Glassmorphism Upload-Zone.
    - [ ] 3D-Status-Indikatoren.
- [ ] **Abrechnungen Upgrade:**
    - [ ] Integration `VideoBackground` (Theme: 'invoices').
    - [ ] Interactive Charts (Recharts/VisX) mit Glass-Look.
- [ ] **Global Animation System:**
    - [ ] Rollout `DashboardAnimation` (Canvas) als Performance-Alternative zu Videos.
    - [ ] Implementierung der "Green Flow" Animation für Analyse-Seite.

## 🛡 Phase 3: The "Fortress" (Security & Infrastructure)
**Owner:** Security Officer & DevOps
**Ziel:** Enterprise-Grade Sicherheit und Skalierbarkeit.

- [ ] **Auth Hardening:**
    - [ ] RLS (Row Level Security) Audit für alle Supabase Tables.
    - [ ] MFA (Multi-Factor Auth) Option für User.
- [ ] **Data Privacy (DSGVO):**
    - [ ] Auto-Delete Cronjob für hochgeladene PDFs (nach 24h).
    - [ ] Cookie Consent Manager (Custom Design).
- [ ] **Deployment Pipeline:**
    - [ ] GitHub Actions für Auto-Deploy auf Vercel (Frontend) & Supabase (Edge Functions).

## 📈 Phase 4: The "Growth Engine" (Product & SEO)
**Owner:** Growth Strategist & Product Owner
**Ziel:** User-Akquise und Conversion.

- [ ] **SEO Optimization:**
    - [ ] Dynamische Meta-Tags für jede Unterseite (Helmet).
    - [ ] Sitemap.xml Generierung.
    - [ ] Structured Data (Schema.org) für "SoftwareApplication".
- [ ] **Conversion Optimization:**
    - [ ] A/B Testing für CTA-Buttons (Magnetic vs. Standard).
    - [ ] Funnel-Analyse (Wo brechen User ab?).

---

## 🛠 Technical Debt & Cleanup (The Critic's Corner)
**Owner:** The Critic
**Ziel:** Kein unnötiger Ballast.

- [ ] **Remove Legacy Code:**
    - [ ] Alte CSS-Dateien löschen (Tailwind v3 Reste).
    - [ ] Unbenutzte Components (`/components/old`) entfernen.
- [ ] **Dependency Audit:**
    - [ ] Prüfen auf veraltete Packages.
    - [ ] Migration auf React 19 (Core App) vorbereiten.

---

## 🚀 Execution Protocol
Wir arbeiten strikt nach diesem Plan. Keine Abweichungen ohne Zustimmung des Rates.

**Signed:**
*The Council of 11*
