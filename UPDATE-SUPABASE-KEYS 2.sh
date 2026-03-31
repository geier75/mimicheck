#!/bin/bash

echo ""
echo "🔑 SUPABASE KEYS UPDATER"
echo "════════════════════════════════════════════════════════"
echo ""

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}ANLEITUNG:${NC}"
echo "1. Öffne: https://supabase.com/dashboard/project/yjjauvmjyhlxcoumwqlj/settings/api"
echo "2. Kopiere den 'anon / public' Key (Klicke 'Copy')"
echo "3. Füge ihn hier ein"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""

# Frage nach ANON KEY
echo -e "${BLUE}Füge deinen Supabase ANON KEY ein:${NC}"
read -r ANON_KEY

# Validierung
if [ -z "$ANON_KEY" ]; then
    echo -e "${RED}❌ Kein Key eingegeben!${NC}"
    exit 1
fi

if [ ${#ANON_KEY} -lt 100 ]; then
    echo -e "${RED}❌ Key ist zu kurz! Ein valider ANON KEY hat 300+ Zeichen.${NC}"
    exit 1
fi

if [[ ! $ANON_KEY == eyJ* ]]; then
    echo -e "${RED}❌ Key sollte mit 'eyJ' beginnen!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Key sieht valide aus!${NC}"
echo ""

# Supabase URL
SUPABASE_URL="https://yjjauvmjyhlxcoumwqlj.supabase.co"

# Update Landing Page .env
echo -e "${BLUE}📝 Update mimicheck-landing/.env${NC}"

LANDING_ENV="mimicheck-landing/.env"

cat > "$LANDING_ENV" << EOF
# SUPABASE CONFIGURATION
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$ANON_KEY

# MAIN APP URL
VITE_MAIN_APP_URL=http://localhost:8005
EOF

echo -e "${GREEN}✅ Landing Page .env updated${NC}"

# Update Hauptapp .env.local
echo -e "${BLUE}📝 Update .env.local${NC}"

ENV_LOCAL=".env.local"

cat > "$ENV_LOCAL" << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$ANON_KEY
VITE_LANDING_URL=http://localhost:3000/landing
VITE_MAIN_APP_URL=http://localhost:8005
EOF

echo -e "${GREEN}✅ Hauptapp .env.local updated${NC}"

echo ""
echo "════════════════════════════════════════════════════════"
echo -e "${GREEN}🎉 KEYS ERFOLGREICH AKTUALISIERT!${NC}"
echo "════════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}⚠️  WICHTIG: Server neu starten!${NC}"
echo ""
echo "Terminal 1 - Hauptapp:"
echo "  Ctrl + C (Server stoppen)"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Landing Page:"
echo "  Ctrl + C (Server stoppen)"
echo "  cd mimicheck-landing && npm run dev"
echo ""
echo "Dann teste erneut!"
echo ""
