# Vercel Deployment Fix - Schritt-für-Schritt Anleitung

## Problem
Vercel Build failed mit Fehler: **"No Output Directory named 'public' found"**

## Ursache
- Vite baut nach `dist/public`
- Vercel sucht nach `public`
- Die `vercel.json` mit der korrekten Output Directory wurde noch nicht ins GitHub Repo gepusht

---

## Lösung: vercel.json ins GitHub Repo pushen

### Schritt 1: Lade die Dateien herunter
1. Gehe zum Manus Management UI → **Code** Tab
2. Klicke auf **"Download all files"**
3. Entpacke das ZIP

### Schritt 2: Pushe vercel.json zu GitHub
```bash
cd mimicheck-landing
git add vercel.json
git commit -m "Fix: Add vercel.json with correct outputDirectory"
git push origin main
```

### Schritt 3: Vercel Redeploy triggern
1. Gehe zu https://vercel.com/bemlerinhos-projects/mimicheck-8pqr/deployments
2. Klicke auf das **Deployment Actions Menü** (3 Punkte)
3. Klicke auf **"Redeploy"**
4. Warte 2-3 Minuten bis der Build fertig ist

---

## Alternative: Manuelle Vercel Settings Änderung

Falls Git Push nicht funktioniert:

1. Gehe zu https://vercel.com/bemlerinhos-projects/mimicheck-8pqr/settings/build-and-deployment
2. Scrolle zu **"Output Directory"**
3. Aktiviere den **Override Toggle** (rechts neben dem Feld)
4. Ändere den Wert von `dist` zu `dist/public`
5. Klicke auf **"Save"** (oben rechts)
6. Gehe zu Deployments und triggere **Redeploy**

---

## Nach erfolgreichem Deployment

### Domain mimicheck.ai verbinden

1. Gehe zu https://vercel.com/bemlerinhos-projects/mimicheck-8pqr/settings/domains
2. Klicke auf **"Add Domain"**
3. Gib `mimicheck.ai` ein
4. Folge den DNS Setup Anweisungen:
   - A Record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`

### Environment Variables setzen

1. Gehe zu https://vercel.com/bemlerinhos-projects/mimicheck-8pqr/settings/environment-variables
2. Füge hinzu:

```
VITE_SUPABASE_URL=https://yjjauvmjyhlxcoumwqlj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqamF1dm1qeWhseGNvdW13cWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mzc4NzgsImV4cCI6MjA3ODAxMzg3OH0.A8e7YwJA6VJ0fTJJt8TBVRT4vktVxB1DFL8U5RLTzZg
```

3. Klicke auf **"Save"**
4. Triggere **Redeploy** damit die Environment Variables geladen werden

---

## Erfolg prüfen

Nach erfolgreichem Deployment sollte die Landing Page live sein auf:
- `https://mimicheck-8pqr.vercel.app` (Vercel Domain)
- `https://mimicheck.ai` (nach Domain Setup)

---

## Troubleshooting

### Build failed immer noch?
- Prüfe ob `vercel.json` im GitHub Repo Root liegt
- Prüfe ob `outputDirectory: "dist/public"` in vercel.json steht
- Prüfe Build Logs in Vercel für Details

### Domain funktioniert nicht?
- DNS Propagation kann 24-48 Stunden dauern
- Prüfe DNS Settings mit `dig mimicheck.ai`
- Vercel zeigt DNS Status in Domain Settings

---

## Support

Bei Problemen:
- Vercel Docs: https://vercel.com/docs
- Manus Help: https://help.manus.im
