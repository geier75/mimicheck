# Vercel Deployment Anleitung für mimicheck.ai

## Schritt 1: Projekt zu GitHub pushen

```bash
# Falls noch nicht initialisiert
git init
git add .
git commit -m "Initial commit: MiMiCheck Landing Page mit Supabase"

# GitHub Repo erstellen und pushen
gh repo create mimicheck-landing --public --source=. --remote=origin --push
```

## Schritt 2: Vercel Projekt erstellen

1. Gehe zu https://vercel.com/new
2. Importiere dein GitHub Repository `mimicheck-landing`
3. Framework Preset: **Vite**
4. Root Directory: `.` (Standard)
5. Build Command: `pnpm run build`
6. Output Directory: `dist/public`

## Schritt 3: Environment Variables in Vercel hinzufügen

Gehe zu **Project Settings → Environment Variables** und füge hinzu:

### Supabase Credentials
```
VITE_SUPABASE_URL=https://yjjauvmjyhlxcoumwqlj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqamF1dm1qeWhseGNvdW13cWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mzc4NzgsImV4cCI6MjA3ODAxMzg3OH0.A8e7YwJA6VJ0fTJJt8TBVRT4vktVxB1DFL8U5RLTzZg
```

**Wichtig:** Setze diese für **Production**, **Preview** und **Development**

## Schritt 4: Custom Domain (mimicheck.ai) verbinden

1. Gehe zu **Project Settings → Domains**
2. Klicke auf **Add Domain**
3. Gib `mimicheck.ai` ein
4. Folge den DNS-Anweisungen:
   - Füge einen `A` Record hinzu: `76.76.21.21`
   - Oder einen `CNAME` Record: `cname.vercel-dns.com`

## Schritt 5: Deploy!

Klicke auf **Deploy** - Vercel baut und deployed automatisch.

Nach ca. 2-3 Minuten ist deine Landing Page live auf:
- `https://mimicheck-landing.vercel.app` (Vercel URL)
- `https://mimicheck.ai` (Custom Domain)

## Automatische Deployments

Jeder Git Push auf `main` triggert automatisch ein neues Deployment.

## Troubleshooting

### Build Error: "Cannot find module @supabase/supabase-js"
→ Stelle sicher dass `pnpm install` vor dem Build läuft (Vercel macht das automatisch)

### 404 auf Unterseiten
→ Die `vercel.json` Rewrites sind bereits konfiguriert - alle Routes werden zu `index.html` geleitet

### Environment Variables nicht geladen
→ Prüfe dass alle Variablen mit `VITE_` Prefix beginnen (Vite Requirement)

## Supabase Auth Redirect URLs

Füge in Supabase unter **Authentication → URL Configuration** hinzu:
- `https://mimicheck.ai/dashboard` (Production)
- `https://mimicheck-landing.vercel.app/dashboard` (Preview)
- `http://localhost:3000/dashboard` (Development)

## Performance

Nach Deployment kannst du die Performance prüfen:
- Lighthouse Score: https://pagespeed.web.dev/
- Vercel Analytics: Project Settings → Analytics

Erwartete Scores:
- Performance: 90+
- Accessibility: 91+
- Best Practices: 82+
- SEO: 100

## Support

Bei Problemen:
- Vercel Logs: Project → Deployments → [Latest] → Logs
- Supabase Logs: https://supabase.com/dashboard/project/yjjauvmjyhlxcoumwqlj/logs
