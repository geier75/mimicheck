#!/bin/bash

# Script zum Erstellen der korrekten .env Datei für die Landing Page

echo "🔧 Erstelle .env Datei für Landing Page..."

cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2/mimicheck-landing

# Erstelle .env Datei mit allen notwendigen Variablen
cat > .env << 'EOF'
# Main Application URL - where to redirect after authentication
VITE_MAIN_APP_URL=http://localhost:8005

# Supabase Configuration (WICHTIG!)
VITE_SUPABASE_URL=https://yjjauvmjyhlxcoumwqlj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqamF1dm1qeWhseGNvdW13cWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mzc4NzgsImV4cCI6MjA3ODAxMzg3OH0.A8e7YwJA6VJ0fTJJt8TBVRT4vktVxB1DFL8U5RLTzZg

# Other environment variables
NODE_ENV=development
PORT=3000
EOF

echo "✅ .env Datei erstellt!"
echo ""
echo "📁 Datei befindet sich hier:"
echo "   /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2/mimicheck-landing/.env"
echo ""
echo "📋 Inhalt:"
cat .env
