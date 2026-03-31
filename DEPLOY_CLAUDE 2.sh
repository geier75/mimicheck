#!/bin/bash
# Claude API Integration deployen

echo "🚀 Deploying Claude API Integration..."

# Prüfe ob Supabase CLI installiert ist
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI nicht gefunden!"
    echo "Installation mit: brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI gefunden"

# Login (falls noch nicht eingeloggt)
echo "🔐 Supabase Login..."
supabase login

# Projekt verlinken
echo "🔗 Projekt verlinken..."
echo "Hinweis: Du findest die Project Ref im Supabase Dashboard unter Settings > General"
read -p "Gib deine Supabase Project Ref ein: " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Keine Project Ref angegeben!"
    exit 1
fi

supabase link --project-ref $PROJECT_REF

# Claude API Key setzen (optional - kann auch über Dashboard gemacht werden)
read -p "Claude API Key jetzt setzen? (j/n): " SET_KEY

if [ "$SET_KEY" = "j" ] || [ "$SET_KEY" = "J" ]; then
    read -p "Gib deinen Claude API Key ein: " CLAUDE_KEY
    supabase secrets set CLAUDE_API_KEY=$CLAUDE_KEY
    echo "✅ API Key gesetzt"
else
    echo "⚠️  Bitte setze CLAUDE_API_KEY manuell im Supabase Dashboard!"
fi

# Functions deployen
echo "📦 Deploying Edge Functions..."
supabase functions deploy analyze-pdf-claude
supabase functions deploy fill-pdf-claude

echo ""
echo "✅ Deployment abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Öffne http://localhost:8005/antraege"
echo "2. Klicke auf einen Antragstyp"
echo "3. Lade ein PDF hoch"
echo "4. Claude analysiert automatisch die Felder!"
echo ""
echo "💡 Bei Problemen: supabase functions logs analyze-pdf-claude"
