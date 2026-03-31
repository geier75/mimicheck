"""
FastAPI Backend (Stufe B) - BFF/Policy Layer
MiMiCheck — www.mimicheck.ai
"""
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="MiMiCheck API",
    description="MiMiCheck Backend API",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:8005").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# MODELS
# ============================================

class UploadResponse(BaseModel):
    abrechnung_id: str
    file_url: str
    status: str = "uploaded"

class AnalyzeRequest(BaseModel):
    abrechnung_id: str

class AnalyzeResponse(BaseModel):
    analyse_id: str
    potential_savings_eur: float
    confidence: float = Field(ge=0.0, le=1.0)
    findings: List[dict] = []

class ReportResponse(BaseModel):
    report_url: str
    format: str = "pdf"

class CheckoutRequest(BaseModel):
    plan: str  # "basic" | "pro"

class CheckoutResponse(BaseModel):
    checkout_url: str

class PortalResponse(BaseModel):
    portal_url: str

class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"

# ============================================
# ROUTES
# ============================================

@app.get("/", response_model=HealthResponse)
async def root():
    """Health Check Endpoint"""
    return HealthResponse()

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health Check für Monitoring"""
    return HealthResponse()

@app.post("/api/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload einer Nebenkostenabrechnung (PDF/Image)
    
    - Validiert File-Type und Size
    - Speichert in Object Storage
    - Erstellt Abrechnung-Entity
    """
    # TODO: Implement
    # 1. Validate file type (PDF, JPG, PNG)
    # 2. Check size limit (10MB)
    # 3. Scan for viruses (optional)
    # 4. Upload to S3/Storage
    # 5. Create Abrechnung entity
    # 6. Return response
    
    return UploadResponse(
        abrechnung_id="abr_" + str(hash(file.filename))[:8],
        file_url=f"https://storage.example.com/{file.filename}",
        status="uploaded"
    )

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_abrechnung(request: AnalyzeRequest):
    """
    Analysiert eine Abrechnung mit KI
    
    - Extrahiert PDF-Daten
    - Ruft LLM-Analyse auf
    - Berechnet Rückforderungspotential
    """
    # TODO: Implement
    # 1. Get Abrechnung from DB
    # 2. Extract PDF data (if not done)
    # 3. Call Base44 function: llmAnalyzeAbrechnung
    # 4. Save Analyse entity
    # 5. Update Abrechnung status
    # 6. Return response
    
    return AnalyzeResponse(
        analyse_id="ana_" + request.abrechnung_id,
        potential_savings_eur=450.75,
        confidence=0.82,
        findings=[
            {
                "category": "Heizkosten",
                "issue": "Zu hohe Abrechnung",
                "potential_savings": 250.50,
                "confidence": 0.85
            },
            {
                "category": "Warmwasser",
                "issue": "Fehlende Ablesung",
                "potential_savings": 200.25,
                "confidence": 0.79
            }
        ]
    )

@app.get("/api/report/{abrechnung_id}", response_model=ReportResponse)
async def get_report(abrechnung_id: str):
    """
    Holt den generierten Bericht
    
    - Generiert HTML/PDF-Report (falls nicht existiert)
    - Gibt Download-URL zurück
    """
    # TODO: Implement
    # 1. Get Abrechnung + Analyse from DB
    # 2. Generate report (if not exists)
    # 3. Call Base44 function: generateReport
    # 4. Save Report entity
    # 5. Return URL
    
    return ReportResponse(
        report_url=f"https://storage.example.com/reports/{abrechnung_id}.pdf",
        format="pdf"
    )

@app.post("/api/billing/checkout", response_model=CheckoutResponse)
async def create_checkout_session(request: CheckoutRequest):
    """
    Erstellt eine Stripe Checkout-Session
    
    - Validiert Plan
    - Erstellt Stripe Session
    - Gibt Checkout-URL zurück
    """
    # TODO: Implement
    # 1. Get current user from session
    # 2. Validate plan
    # 3. Call Base44 function: createStripeCheckoutSession
    # 4. Return URL
    
    valid_plans = ["basic", "pro"]
    if request.plan not in valid_plans:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid plan. Must be one of: {valid_plans}"
        )
    
    return CheckoutResponse(
        checkout_url=f"https://checkout.stripe.com/session_xyz?plan={request.plan}"
    )

@app.get("/api/billing/portal", response_model=PortalResponse)
async def get_billing_portal():
    """
    Erstellt Stripe Customer Portal Session
    
    - Holt Customer-ID aus User
    - Erstellt Portal-Session
    - Gibt Portal-URL zurück
    """
    # TODO: Implement
    # 1. Get current user from session
    # 2. Get stripe_customer_id
    # 3. Call Base44 function: createStripePortalSession
    # 4. Return URL
    
    return PortalResponse(
        portal_url="https://billing.stripe.com/session_xyz"
    )

# ============================================
# ERROR HANDLERS
# ============================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.status_code,
            "message": exc.detail
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "code": 500,
            "message": "Internal server error"
        }
    )

# ============================================
# STARTUP/SHUTDOWN
# ============================================

@app.on_event("startup")
async def startup_event():
    """Initialize connections, load models, etc."""
    print("🚀 Starting MiMiCheck API...")
    print(f"📍 CORS Origins: {os.getenv('CORS_ORIGINS')}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup connections"""
    print("👋 Shutting down MiMiCheck API...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=True
    )
