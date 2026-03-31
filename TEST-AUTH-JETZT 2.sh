#!/bin/bash

echo ""
echo "🧪 AUTH-FLOW TEST STARTEN"
echo "════════════════════════════════════════════════════════"
echo ""

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test 1: Server Status
echo -e "${BLUE}TEST 1: Server Status${NC}"
echo "────────────────────────────────────────────────────────"

PORT_3000=$(lsof -i :3000 | grep LISTEN)
PORT_8005=$(lsof -i :8005 | grep LISTEN)

if [ ! -z "$PORT_3000" ]; then
    echo -e "${GREEN}✅ Port 3000 läuft (Landing Page)${NC}"
else
    echo -e "${RED}❌ Port 3000 läuft NICHT${NC}"
    echo ""
    echo "STARTE LANDING PAGE:"
    echo "  cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2/mimicheck-landing"
    echo "  npm run dev"
    echo ""
    exit 1
fi

if [ ! -z "$PORT_8005" ]; then
    echo -e "${GREEN}✅ Port 8005 läuft (Hauptapp)${NC}"
else
    echo -e "${RED}❌ Port 8005 läuft NICHT${NC}"
    exit 1
fi

echo ""

# Test 2: Landing Page erreichbar
echo -e "${BLUE}TEST 2: Landing Page Auth${NC}"
echo "────────────────────────────────────────────────────────"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/landing)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ http://localhost:3000/landing → HTTP 200${NC}"
else
    echo -e "${RED}❌ http://localhost:3000/landing → HTTP $STATUS${NC}"
    exit 1
fi

echo ""

# Test 3: .env Files
echo -e "${BLUE}TEST 3: Environment Variables${NC}"
echo "────────────────────────────────────────────────────────"

if grep -q "VITE_MAIN_APP_URL=http://localhost:8005" mimicheck-landing/.env; then
    echo -e "${GREEN}✅ Landing: VITE_MAIN_APP_URL korrekt${NC}"
else
    echo -e "${RED}❌ Landing: VITE_MAIN_APP_URL fehlt oder falsch${NC}"
fi

if grep -q "VITE_SUPABASE_URL" mimicheck-landing/.env; then
    echo -e "${GREEN}✅ Landing: VITE_SUPABASE_URL vorhanden${NC}"
else
    echo -e "${RED}❌ Landing: VITE_SUPABASE_URL fehlt${NC}"
fi

if grep -q "VITE_SUPABASE_ANON_KEY" mimicheck-landing/.env; then
    echo -e "${GREEN}✅ Landing: VITE_SUPABASE_ANON_KEY vorhanden${NC}"
else
    echo -e "${RED}❌ Landing: VITE_SUPABASE_ANON_KEY fehlt${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo -e "${GREEN}🎯 ALLES BEREIT!${NC}"
echo "════════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}NÄCHSTER SCHRITT:${NC}"
echo ""
echo "1. Öffne Browser (Inkognito!):"
echo -e "   ${BLUE}http://localhost:3000/landing#auth${NC}"
echo ""
echo "2. Öffne Browser DevTools (F12)"
echo "   → Gehe zu Tab 'Console'"
echo ""
echo "3. Registriere Test-User:"
echo "   Email: test-$(date +%s)@example.com"
echo "   Passwort: Test123456!"
echo ""
echo "4. BEOBACHTE CONSOLE LOGS!"
echo "   Siehst du:"
echo "   🔐 AUTH START"
echo "   📝 Attempting signup..."
echo "   🎫 Tokens:"
echo "   🏃 Redirecting NOW!"
echo ""
echo "5. FALLS DU EINEN ERROR SIEHST:"
echo "   → Kopiere den Error"
echo "   → Sende ihn mir!"
echo ""
echo "6. FALLS DU GAR NICHTS SIEHST:"
echo "   → Prüfe: Läuft Landing Page wirklich?"
echo "   → Terminal für Port 3000 anschauen"
echo ""
echo "════════════════════════════════════════════════════════"
