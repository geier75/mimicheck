#!/bin/bash

# 🚀 MIMICHECK MASTER DEPLOYMENT SCRIPT
# Unifies Supabase, Frontend (Vercel) and Python Backend deployment.

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 MiMiCheck Master Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. PRE-FLIGHT CHECKS
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
command -v supabase >/dev/null 2>&1 || { echo -e "${RED}❌ Supabase CLI required${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm required${NC}"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${YELLOW}⚠️  Docker not found (required for backend deploy)${NC}"; }
echo -e "${GREEN}✅ Prerequisites OK${NC}"
echo ""

# 2. CONFIGURATION
if [ -z "$SUPABASE_PROJECT_ID" ]; then
    read -p "🔹 Supabase Project ID: " SUPABASE_PROJECT_ID
fi

# 3. SUPABASE DEPLOYMENT
echo -e "${BLUE}☁️  Deploying Supabase Infrastructure...${NC}"
supabase link --project-ref $SUPABASE_PROJECT_ID
supabase db push

# Deploy Edge Functions
echo "  → Deploying Edge Functions..."
FUNCTIONS=("analyze-eligibility" "health" "contact-submit")
for func in "${FUNCTIONS[@]}"; do
    supabase functions deploy $func --no-verify-jwt=false || echo -e "${YELLOW}⚠️ Failed to deploy $func${NC}"
done

echo -e "${GREEN}✅ Supabase Deployed${NC}"
echo ""

# 4. PYTHON BACKEND DEPLOYMENT (FastAPI)
echo -e "${BLUE}🐍 Deploying Python Backend...${NC}"
if [ -f "backend/fly.toml" ]; then
    echo "  → Detected Fly.io config. Deploying..."
    cd backend
    flyctl deploy || echo -e "${RED}❌ Backend deploy failed${NC}"
    cd ..
else
    echo -e "${YELLOW}⚠️  No deployment config found for Backend (Fly.io/Docker).${NC}"
    echo "  → Skipping Backend deploy. Run locally with ./START-PRODUCTION.sh"
fi
echo ""

# 5. FRONTEND DEPLOYMENT (Vercel)
echo -e "${BLUE}🎨 Deploying Frontend...${NC}"
echo "  → Building..."
npm install && npm run build
echo "  → Deploying to Vercel..."
if command -v vercel >/dev/null 2>&1; then
    vercel --prod || echo -e "${RED}❌ Vercel deploy failed${NC}"
else
    echo -e "${YELLOW}⚠️  Vercel CLI not installed. Skipping.${NC}"
fi

echo ""
echo -e "${GREEN}✅ MASTER DEPLOYMENT COMPLETE!${NC}"
