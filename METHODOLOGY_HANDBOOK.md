# 📘 MIMICHECK METHODOLOGY HANDBOOK
> **Version:** 1.0 (Consolidated)
> **Date:** 20.11.2025
> **Scope:** Development, Design, Quality Assurance

Dieses Handbuch definiert die **unverhandelbaren Standards** für die Entwicklung an MimiCheck. Es vereint Best Practices aus TDD, PDCA und modernem Web-Design (SOTA 2025).

---

## 1. 🔄 ENTWICKLUNGS-PROZESS (TDD + OODA)

Wir nutzen eine Kombination aus **Test-Driven Development (TDD)** und dem **OODA Loop** (Observe-Orient-Decide-Act) für maximale Agilität und Qualität.

### Der Zyklus
1.  **🔴 RED (Test):** Schreibe einen Test, der fehlschlägt. Definiere das *erwartete Verhalten*.
2.  **🟢 GREEN (Implement):** Schreibe den *minimalen* Code, um den Test zu bestehen.
3.  **🔵 REFACTOR (Optimize):** Verbessere den Code (Clean Code, DRY, Performance) *ohne* das Verhalten zu ändern.

### OODA Integration
*   **Observe:** Analysiere den Ist-Zustand (z.B. "Ladezeit ist langsam").
*   **Orient:** Vergleiche mit Benchmarks (SOTA Standards).
*   **Decide:** Wähle die Strategie (z.B. "Code Splitting implementieren").
*   **Act:** Führe den TDD-Zyklus aus.

---

## 2. ✅ QUALITÄTSSICHERUNG (PDCA)

Für größere Features und Audits nutzen wir den **PDCA-Zyklus**.

*   **PLAN:** Ziele definieren (KPIs), Baseline messen, Strategie festlegen.
*   **DO:** Umsetzung nach TDD-Prinzipien.
*   **CHECK:** **Kritischer Schritt!**
    *   Visueller Test (Browser/Device Lab).
    *   Automatisierte Tests (Unit/E2E).
    *   Performance-Messung (Lighthouse).
*   **ACT:** Feedback einarbeiten, Iteration planen, Lessons Learned dokumentieren.

> **Regel:** Ein Feature ist erst "Done", wenn die CHECK-Phase erfolgreich dokumentiert ist.

---

## 3. 🎨 DESIGN PHILOSOPHIE (SOTA 2025)

Unsere Landing Page (`mimicheck-landing`) setzt den Standard für "State of the Art" Webdesign.

### Core Principles
1.  **Cinematic Experience:** 3D-Elemente (Three.js), Grain Textures, massive Typografie.
2.  **Micro-Interactions:** Custom Cursor, Magnetic Buttons, Hover-Glows. Alles muss auf den User reagieren.
3.  **Scroll Storytelling:** Inhalte werden nicht einfach angezeigt, sondern *erzählt* (GSAP ScrollTrigger, Parallax).
4.  **Performance First:** WebGL Lazy Loading, Code Splitting, WebP. Ziel: < 1MB Bundle.

### Tech Stack (Frontend V2)
*   **Framework:** React 19 + TypeScript
*   **Styling:** Tailwind CSS v4
*   **Animation:** Framer Motion + GSAP + React Three Fiber

---

## 4. 🧪 TESTING PROTOKOLL

### Pyramide
1.  **Unit Tests (Vitest):** Logik, Utils, Hooks. (Abdeckung > 80%)
2.  **Component Tests (RTL):** Rendering, User Interactions.
3.  **E2E Tests (Playwright):** Kritische User Flows (Upload → Analyse → Ergebnis).

### Checkliste vor Merge
- [ ] Alle Tests grün (`npm test`)
- [ ] Linting fehlerfrei (`npm run lint`)
- [ ] Build erfolgreich (`npm run build`)
- [ ] Keine "Mock"-Daten mehr im Code (außer in Tests)

---

## 5. 📂 QUELLEN & REFERENZEN

Dieses Handbuch basiert auf folgenden archivierten Dokumenten:
*   `docs/reports/TDD_OODA_PROCESS.md`
*   `docs/reports/PDCA_AUDIT.md`
*   `mimicheck-landing/SOTA_2025_TRANSFORMATION.md`
*   `mimicheck-landing/hero_best_practices_2025.md`
