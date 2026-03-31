#!/bin/bash
# Production Start Script
# Startet Backend & Frontend ohne Mocks

echo "🚀 PRODUCTION MODE - Starting..."
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env nicht gefunden!"
    echo "📝 Erstelle .env aus .env.example..."
    cp backend/.env.example backend/.env
    echo ""
    echo "⚠️  WICHTIG: Setze OPENAI_API_KEY in backend/.env!"
    echo "   → nano backend/.env"
    echo "   → Füge ein: OPENAI_API_KEY=sk-..."
    echo ""
    read -p "Press Enter wenn fertig..."
fi

# Check OpenAI Key
if ! grep -q "OPENAI_API_KEY=sk-" backend/.env; then
    echo "❌ OPENAI_API_KEY nicht gesetzt in backend/.env"
    echo ""
    echo "📝 Bitte editiere backend/.env und füge deinen API Key hinzu:"
    echo "   OPENAI_API_KEY=sk-..."
    echo ""
    exit 1
fi

echo "✅ Configuration OK"
echo ""

# Start Backend
echo "🔧 Starting Backend (Port 8000)..."
cd backend
source venv/bin/activate 2>/dev/null || true
python -m uvicorn main_enhanced:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend
sleep 3

# Start Frontend
echo "🎨 Starting Frontend (Port 8005)..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=" * 60
echo "✅ PRODUCTION MODE GESTARTET"
echo "=" * 60
echo ""
echo "🔗 Backend:  http://localhost:8000"
echo "🔗 API Docs: http://localhost:8000/docs"
echo "🔗 Frontend: http://localhost:8005"
echo ""
echo "📊 API Endpoints:"
echo "   • /api/llm/*        - OpenAI Integration (invoke, chat, analyze-nebenkosten)"
echo "   • /api/forms/*      - PDF Form Extraction & Filling (extract, fill, schema)"
echo "   • /api/upload       - File Upload (Nebenkosten-PDFs)"
echo "   • /api/analyze      - PDF Analysis (rules + LLM)"
echo "   • /api/report       - Report Generation (HTML)"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

wait
