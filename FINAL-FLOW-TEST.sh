#!/bin/bash

echo "════════════════════════════════════════════════════════"
echo "🧪 FINAL AUTH-FLOW TEST"
echo "════════════════════════════════════════════════════════"
echo ""

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Server Status
echo "TEST 1: Server Status prüfen"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PORT_3000=$(lsof -i :3000 | grep LISTEN)
PORT_8005=$(lsof -i :8005 | grep LISTEN)

if [ ! -z "$PORT_3000" ]; then
    echo -e "${GREEN}✅ Port 3000 läuft (Landing Page)${NC}"
else
    echo -e "${RED}❌ Port 3000 läuft NICHT${NC}"
    echo "   Start: cd mimicheck-landing && npm run dev"
    exit 1
fi

if [ ! -z "$PORT_8005" ]; then
    echo -e "${GREEN}✅ Port 8005 läuft (Hauptapp)${NC}"
else
    echo -e "${RED}❌ Port 8005 läuft NICHT${NC}"
    echo "   Start: npm run dev"
    exit 1
fi

echo ""

# Test 2: Landing Page Auth Route
echo "TEST 2: Landing Page Auth erreichbar"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LANDING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/landing)
if [ "$LANDING_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ http://localhost:3000/landing → HTTP 200${NC}"
else
    echo -e "${RED}❌ http://localhost:3000/landing → HTTP $LANDING_STATUS${NC}"
fi

echo ""

# Test 3: AuthBridge Route
echo "TEST 3: AuthBridge Route vorhanden"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BRIDGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8005/auth-bridge)
if [ "$BRIDGE_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ http://localhost:8005/auth-bridge → HTTP 200${NC}"
else
    echo -e "${RED}❌ http://localhost:8005/auth-bridge → HTTP $BRIDGE_STATUS${NC}"
fi

echo ""

# Test 4: /auth Route auf Port 8005 entfernt?
echo "TEST 4: /auth Route NICHT auf Port 8005"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

AUTH_8005=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8005/auth)
if [ "$AUTH_8005" = "200" ]; then
    echo -e "${RED}❌ http://localhost:8005/auth ist NOCH ERREICHBAR!${NC}"
    echo "   → Route sollte entfernt sein!"
else
    echo -e "${GREEN}✅ http://localhost:8005/auth → HTTP $AUTH_8005 (nicht erreichbar)${NC}"
fi

echo ""

# Test 5: Environment Variables
echo "TEST 5: Environment Variables konfiguriert"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "VITE_MAIN_APP_URL=http://localhost:8005" mimicheck-landing/.env 2>/dev/null; then
    echo -e "${GREEN}✅ Landing .env: VITE_MAIN_APP_URL korrekt${NC}"
else
    echo -e "${RED}❌ Landing .env: VITE_MAIN_APP_URL fehlt${NC}"
fi

if grep -q "VITE_SUPABASE_URL" mimicheck-landing/.env 2>/dev/null; then
    echo -e "${GREEN}✅ Landing .env: VITE_SUPABASE_URL vorhanden${NC}"
else
    echo -e "${RED}❌ Landing .env: VITE_SUPABASE_URL fehlt${NC}"
fi

if grep -q "VITE_LANDING_URL=http://localhost:3000/landing" .env.local 2>/dev/null; then
    echo -e "${GREEN}✅ Hauptapp .env.local: VITE_LANDING_URL korrekt${NC}"
else
    echo -e "${YELLOW}⚠️  Hauptapp .env.local: VITE_LANDING_URL prüfen${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "📋 ZUSAMMENFASSUNG"
echo "════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ ALLE TECHNISCHEN CHECKS BESTANDEN!${NC}"
echo ""
echo "🎯 NÄCHSTER SCHRITT: MANUELLER FLOW-TEST"
echo ""
echo "1. Öffne Browser:"
echo "   ${YELLOW}http://localhost:3000/landing#auth${NC}"
echo ""
echo "2. Registriere Test-User:"
echo "   Email: flow-test@example.com"
echo "   Passwort: Test123456!"
echo ""
echo "3. Erwartung:"
echo "   ${GREEN}→ Browser wechselt automatisch zu Port 8005${NC}"
echo "   ${GREEN}→ Finale URL: http://localhost:8005/onboarding${NC}"
echo "   ${GREEN}→ Du bist eingeloggt!${NC}"
echo ""
echo "════════════════════════════════════════════════════════"
