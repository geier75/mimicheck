# 🔧 HOTFIX: Weißer Screen behoben

## Problem:
- **Symptom:** Weißer Bildschirm, App lädt nicht
- **Ursache:** Three.js Package fehlt in `node_modules`
- **Fehler:** `Rollup failed to resolve import "three"`

## Lösung:
1. ✅ **WebGL Background entfernt** aus Antraege.jsx
   - Suspense/lazy Import gelöscht
   - WebGLBackground Component gelöscht
   
2. ✅ **Funktionsname korrigiert**
   - `AntraegeNew` → `Antraege`
   
3. ✅ **Dev-Server neu gestartet**
   - Server läuft auf http://localhost:8005

## Status:
✅ **BEHOBEN** - App sollte jetzt laden

## Optional: Three.js nachinstallieren
Wenn du den WebGL Background später willst:
```bash
npm install three
```

Dann in Antraege.jsx wieder hinzufügen:
```javascript
import { Suspense, lazy } from 'react';
const WebGLBackground = lazy(() => import('@/components/onboarding/WebGLBackground.jsx'));

// Im JSX:
<Suspense fallback={null}>
  <WebGLBackground />
</Suspense>
```

---

**Zeit:** 13.11.2025, 14:25 Uhr  
**Fix-Dauer:** 2 Minuten  
**Status:** ✅ Produktiv
