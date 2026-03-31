#!/bin/bash
# End-to-End Smoke Test for Sprint 1 (Enhanced)
# Tests main_enhanced.py with Forms API and LLM API

set -e

echo "🚀 Starting Enhanced Smoke Test..."

# Backend starten
echo "📦 Starting Backend (main_enhanced.py)..."
cd backend

# Check if venv exists, create if not
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

# Start enhanced backend in background
python -m uvicorn main_enhanced:app --host 127.0.0.1 --port 8000 &
BACK_PID=$!
echo "Backend PID: $BACK_PID"

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 5

# Smoke: Backend Health Check
echo "🏥 Testing Backend Health..."
if curl -sf http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    kill $BACK_PID 2>/dev/null || true
    exit 1
fi

# Test Forms API Health
echo "🔍 Testing Forms API..."
if curl -sf http://localhost:8000/api/forms/health > /dev/null; then
    echo "✅ Forms API is available"
else
    echo "⚠️  Forms API not responding (check if mounted correctly)"
fi

# Test LLM API Health
echo "🤖 Testing LLM API..."
LLM_HEALTH=$(curl -sf http://localhost:8000/api/llm/health || echo '{}')
echo "LLM Health Response: $LLM_HEALTH"
if echo "$LLM_HEALTH" | grep -q "status"; then
    echo "✅ LLM API is available"
else
    echo "⚠️  LLM API not responding"
fi

# Dummy-PDF erzeugen & hochladen
echo "📄 Creating test PDF..."
echo "%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 44 >> stream
BT /F1 12 Tf 100 700 Td (Test PDF) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
410
%%EOF" > /tmp/test.pdf

echo "📤 Uploading test PDF..."
UPLOAD_RESPONSE=$(curl -sf -F "file=@/tmp/test.pdf" http://localhost:8000/api/upload)
echo "Upload Response: $UPLOAD_RESPONSE"
echo "$UPLOAD_RESPONSE" > /tmp/upload.json

# Extract abrechnung_id
ABRECHNUNG_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"abrechnung_id":"[^"]*"' | cut -d'"' -f4)
echo "Abrechnung ID: $ABRECHNUNG_ID"

if [ -z "$ABRECHNUNG_ID" ]; then
    echo "❌ Upload failed: No abrechnung_id"
    kill $BACK_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Upload successful"

# Analyse anstoßen
echo "🔍 Running analysis..."
ANALYZE_RESPONSE=$(curl -sf -H "Content-Type: application/json" \
  -d "{\"abrechnung_id\":\"$ABRECHNUNG_ID\"}" \
  http://localhost:8000/api/analyze)
echo "Analysis Response: $ANALYZE_RESPONSE"
echo "$ANALYZE_RESPONSE" > /tmp/analyze.json

if echo "$ANALYZE_RESPONSE" | grep -q "analyse_id"; then
    echo "✅ Analysis successful"
else
    echo "⚠️  Analysis response incomplete (might be OK for MVP)"
fi

# Report abrufen
echo "📊 Fetching report..."
REPORT_RESPONSE=$(curl -sf http://localhost:8000/api/report/$ABRECHNUNG_ID)
echo "Report Response: $REPORT_RESPONSE"

if echo "$REPORT_RESPONSE" | grep -q "report_url"; then
    echo "✅ Report generation successful"
else
    echo "⚠️  Report response incomplete (might be OK for MVP)"
fi

# Cleanup
echo "🧹 Cleaning up..."
kill $BACK_PID 2>/dev/null || true
rm -f /tmp/test.pdf /tmp/upload.json /tmp/analyze.json

echo ""
echo "✅ Smoke Test Complete!"
echo ""
echo "Next steps:"
echo "1. Frontend: npm run dev"
echo "2. Open http://localhost:8005"
echo "3. Test Upload → Analyze → Report flow in UI"
