"""
FastAPI Backend (Sprint 1 Enhanced) - Mit einfacher PDF-Analyse
MiMiCheck — www.mimicheck.ai
2025 Security Best Practices: Rate limiting, security headers, input validation
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Dict
import os
import re
import hashlib
import tempfile
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
import logging
from collections import defaultdict
import time

load_dotenv()

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MiMiCheck API",
    description="MiMiCheck Backend API (Sprint 1 + Universal Forms)",
    version="1.1.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None
)

# ============================================
# SECURITY MIDDLEWARE (2025 Best Practices)
# ============================================

# Rate Limiting Storage
rate_limit_storage = defaultdict(list)
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))  # seconds

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting - prevent abuse"""
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    
    # Clean old entries
    rate_limit_storage[client_ip] = [
        req_time for req_time in rate_limit_storage[client_ip]
        if current_time - req_time < RATE_LIMIT_WINDOW
    ]
    
    # Check limit
    if len(rate_limit_storage[client_ip]) >= RATE_LIMIT_REQUESTS:
        logger.warning(f"Rate limit exceeded for {client_ip}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded", "retry_after": RATE_LIMIT_WINDOW}
        )
    
    rate_limit_storage[client_ip].append(current_time)
    response = await call_next(request)
    return response

@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Add OWASP recommended security headers"""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Trusted Host Middleware (prevent host header attacks)
if os.getenv("ENVIRONMENT") == "production":
    allowed_hosts = os.getenv("ALLOWED_HOSTS", "localhost").split(",")
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

# CORS Configuration
allow_origins = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:8005").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
)

# Simple in-memory storage (Sprint 1 MVP)
UPLOADS = {}
ANALYSES = {}
REPORTS = {}

# Storage directory
STORAGE_DIR = Path(tempfile.gettempdir()) / "nebenkosten-storage"
STORAGE_DIR.mkdir(exist_ok=True)

# ============================================
# FORMS API (Universal Antrags-Assistent)
# ============================================
try:
    from forms_api import router as forms_router
    app.include_router(forms_router)
    
    # Static files für befüllte PDFs
    outputs_dir = Path("outputs/forms")
    outputs_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/outputs/forms", StaticFiles(directory=str(outputs_dir)), name="outputs_forms")
    
    logging.info("✅ Forms API mounted at /api/forms")
except Exception as e:
    logging.warning(f"⚠️ Forms API not available: {e}")

# ============================================
# LLM API (OpenAI Integration)
# ============================================
try:
    from llm_api import router as llm_router
    app.include_router(llm_router)
    logging.info("✅ LLM API mounted at /api/llm")
except Exception as e:
    logging.warning(f"⚠️ LLM API not available: {e}")

# ============================================
# MODELS
# ============================================

class UploadResponse(BaseModel):
    abrechnung_id: str
    file_url: str
    status: str = "uploaded"
    message: str = "File uploaded successfully"

class AnalyzeRequest(BaseModel):
    abrechnung_id: str

class Finding(BaseModel):
    category: str
    issue: str
    potential_savings: float
    confidence: float
    details: str = ""

class AnalyzeResponse(BaseModel):
    analyse_id: str
    abrechnung_id: str
    potential_savings_eur: float
    confidence: float = Field(ge=0.0, le=1.0)
    findings: List[Finding] = []
    status: str = "completed"

class ReportResponse(BaseModel):
    report_url: str
    format: str = "html"
    abrechnung_id: str

class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    timestamp: str = ""

# ============================================
# HELPER FUNCTIONS
# ============================================

def generate_id(prefix: str) -> str:
    """Generate unique ID"""
    timestamp = datetime.now().isoformat()
    hash_obj = hashlib.md5(timestamp.encode())
    return f"{prefix}_{hash_obj.hexdigest()[:8]}"

def extract_text_from_pdf(file_path: Path) -> str:
    """
    Simple PDF text extraction
    TODO: Replace with PyPDF2/pdfplumber for production
    """
    try:
        # For MVP: just read as text (won't work for real PDFs)
        with open(file_path, 'rb') as f:
            content = f.read()
            # Very basic text extraction attempt
            text = content.decode('latin-1', errors='ignore')
            return text
    except Exception as e:
        return f"Error extracting text: {str(e)}"

def analyze_abrechnung_simple(text: str) -> Dict:
    """
    Simple rule-based analysis (Sprint 1 MVP)
    TODO: Replace with LLM for production
    """
    findings = []
    total_savings = 0.0
    
    # Rule 1: Check for "Heizkosten" patterns
    if re.search(r'heizkosten', text, re.IGNORECASE):
        savings = 250.50
        findings.append(Finding(
            category="Heizkosten",
            issue="Mögliche Überhöhung der Heizkostenabrechnung",
            potential_savings=savings,
            confidence=0.75,
            details="Heizkosten scheinen über Durchschnitt zu liegen"
        ))
        total_savings += savings
    
    # Rule 2: Check for "Warmwasser" patterns
    if re.search(r'warmwasser', text, re.IGNORECASE):
        savings = 150.25
        findings.append(Finding(
            category="Warmwasser",
            issue="Unvollständige Warmwasserabrechnung",
            potential_savings=savings,
            confidence=0.68,
            details="Warmwasserkosten nicht vollständig dokumentiert"
        ))
        total_savings += savings
    
    # Rule 3: Check for "Müll" / "Abfall"
    if re.search(r'(müll|abfall)', text, re.IGNORECASE):
        savings = 50.00
        findings.append(Finding(
            category="Müllgebühren",
            issue="Fehlerhafte Müllgebührenabrechnung",
            potential_savings=savings,
            confidence=0.82,
            details="Müllgebühren eventuell zu hoch angesetzt"
        ))
        total_savings += savings
    
    # Default finding if nothing detected
    if not findings:
        findings.append(Finding(
            category="Allgemein",
            issue="Keine spezifischen Auffälligkeiten gefunden",
            potential_savings=0.0,
            confidence=0.5,
            details="Abrechnung erscheint korrekt"
        ))
    
    return {
        "findings": findings,
        "total_savings": total_savings,
        "confidence": sum(f.confidence for f in findings) / len(findings) if findings else 0.5
    }

def generate_html_report(abrechnung_id: str, analysis: Dict) -> str:
    """Generate simple HTML report"""
    findings_html = ""
    for finding in analysis.get("findings", []):
        findings_html += f"""
        <div class="finding">
            <h3>{finding.category}</h3>
            <p><strong>Problem:</strong> {finding.issue}</p>
            <p><strong>Einsparpotential:</strong> {finding.potential_savings:.2f} €</p>
            <p><strong>Konfidenz:</strong> {finding.confidence*100:.0f}%</p>
            <p>{finding.details}</p>
        </div>
        """
    
    html = f"""
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <title>Nebenkostenabrechnung Bericht - {abrechnung_id}</title>
        <style>
            body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }}
            h1 {{ color: #2563eb; }}
            .summary {{ background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }}
            .finding {{ background: #fff; border: 1px solid #e5e7eb; padding: 15px; margin: 15px 0; border-radius: 6px; }}
            .finding h3 {{ margin-top: 0; color: #1f2937; }}
            .total {{ font-size: 24px; font-weight: bold; color: #059669; }}
        </style>
    </head>
    <body>
        <h1>📊 Nebenkostenabrechnung Analyse</h1>
        
        <div class="summary">
            <h2>Zusammenfassung</h2>
            <p><strong>Abrechnung ID:</strong> {abrechnung_id}</p>
            <p><strong>Datum:</strong> {datetime.now().strftime('%d.%m.%Y %H:%M')}</p>
            <p class="total">💰 Gesamtes Einsparpotential: {analysis.get('total_savings', 0):.2f} €</p>
            <p><strong>Durchschnittliche Konfidenz:</strong> {analysis.get('confidence', 0)*100:.0f}%</p>
        </div>
        
        <h2>Gefundene Auffälligkeiten</h2>
        {findings_html}
        
        <hr style="margin-top: 40px;">
        <p style="color: #6b7280; font-size: 14px;">
            Erstellt von MiMiCheck — www.mimicheck.ai<br>
            Dieser Bericht dient nur zur Information. Konsultieren Sie einen Rechtsanwalt für verbindliche Aussagen.
        </p>
    </body>
    </html>
    """
    return html

# ============================================
# ROUTES
# ============================================

@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint"""
    return HealthResponse(timestamp=datetime.now().isoformat())

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health Check"""
    return HealthResponse(timestamp=datetime.now().isoformat())

@app.post("/api/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload einer Nebenkostenabrechnung
    - Validiert File-Type und Size
    - Speichert temporär
    - Gibt Abrechnung-ID zurück
    """
    # Constants
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    
    # Validate file type
    filename = file.filename or "unknown"
    if file.content_type not in allowed_types and not filename.lower().endswith(('.pdf', '.jpg', '.jpeg', '.png')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed: PDF, JPG, PNG"
        )
    
    # Read and validate size
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE // 1024 // 1024}MB"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read file: {str(e)}"
        )
    
    # Generate ID
    abrechnung_id = generate_id("abr")
    
    # Sanitize filename (prevent path traversal)
    safe_filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    file_ext = Path(safe_filename).suffix
    file_path = STORAGE_DIR / f"{abrechnung_id}{file_ext}"
    
    try:
        with open(file_path, 'wb') as f:
            f.write(content)
        
        # Store metadata
        UPLOADS[abrechnung_id] = {
            "id": abrechnung_id,
            "filename": file.filename,
            "file_path": str(file_path),
            "content_type": file.content_type,
            "size": len(content),
            "uploaded_at": datetime.now().isoformat()
        }
        
        return UploadResponse(
            abrechnung_id=abrechnung_id,
            file_url=f"/files/{abrechnung_id}{file_ext}",
            status="uploaded",
            message=f"File '{file.filename}' uploaded successfully"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )

@app.post("/api/extract-data/{abrechnung_id}")
async def extract_data_from_pdf(abrechnung_id: str, use_ocr: bool = False):
    """
    Extrahiert strukturierte Daten aus hochgeladenem PDF (REAL - kein Mock!)
    """
    if abrechnung_id not in UPLOADS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Abrechnung '{abrechnung_id}' not found"
        )
    
    upload_data = UPLOADS[abrechnung_id]
    file_path = upload_data["file_path"]
    
    try:
        from services.pdf_extraction_service import get_extraction_service
        
        extraction_service = get_extraction_service()
        extracted_data = extraction_service.extract_from_pdf(file_path, use_ocr=use_ocr)
        
        logging.info(f"✅ Daten extrahiert aus {abrechnung_id}: {len(extracted_data.get('positionen', []))} Positionen")
        
        return {
            "success": True,
            "abrechnung_id": abrechnung_id,
            "data": extracted_data
        }
        
    except Exception as e:
        logging.error(f"❌ Extraktion fehlgeschlagen: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Daten-Extraktion fehlgeschlagen: {str(e)}"
        )

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_abrechnung(request: AnalyzeRequest):
    """
    Analysiert eine Abrechnung (Sprint 1: einfache Regeln)
    """
    # Check if abrechnung exists
    if request.abrechnung_id not in UPLOADS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Abrechnung '{request.abrechnung_id}' not found"
        )
    
    upload_data = UPLOADS[request.abrechnung_id]
    file_path = Path(upload_data["file_path"])
    
    # Extract text
    text = extract_text_from_pdf(file_path)
    
    # Analyze
    analysis_result = analyze_abrechnung_simple(text)
    
    # Generate analyse_id
    analyse_id = generate_id("ana")
    
    # Store analysis
    ANALYSES[analyse_id] = {
        "analyse_id": analyse_id,
        "abrechnung_id": request.abrechnung_id,
        "findings": [f.dict() for f in analysis_result["findings"]],
        "potential_savings_eur": analysis_result["total_savings"],
        "confidence": analysis_result["confidence"],
        "analyzed_at": datetime.now().isoformat()
    }
    
    return AnalyzeResponse(
        analyse_id=analyse_id,
        abrechnung_id=request.abrechnung_id,
        potential_savings_eur=analysis_result["total_savings"],
        confidence=analysis_result["confidence"],
        findings=analysis_result["findings"],
        status="completed"
    )

@app.get("/api/report/{abrechnung_id}", response_model=ReportResponse)
async def get_report(abrechnung_id: str):
    """
    Generiert und liefert HTML-Report
    """
    # Find analysis for this abrechnung
    analysis = None
    for ana in ANALYSES.values():
        if ana["abrechnung_id"] == abrechnung_id:
            analysis = ana
            break
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No analysis found for abrechnung '{abrechnung_id}'"
        )
    
    # Generate report
    html_content = generate_html_report(abrechnung_id, analysis)
    
    # Save report
    report_path = STORAGE_DIR / f"report_{abrechnung_id}.html"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    REPORTS[abrechnung_id] = {
        "abrechnung_id": abrechnung_id,
        "report_path": str(report_path),
        "format": "html",
        "generated_at": datetime.now().isoformat()
    }
    
    return ReportResponse(
        report_url=f"/reports/{abrechnung_id}",
        format="html",
        abrechnung_id=abrechnung_id
    )

@app.get("/reports/{abrechnung_id}")
async def download_report(abrechnung_id: str):
    """Download generated report"""
    if abrechnung_id not in REPORTS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report for '{abrechnung_id}' not found"
        )
    
    report_path = Path(REPORTS[abrechnung_id]["report_path"])
    
    if not report_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report file not found on disk"
        )
    
    return FileResponse(
        path=report_path,
        media_type="text/html",
        filename=f"bericht_{abrechnung_id}.html"
    )

@app.get("/files/{filename}")
async def get_file(filename: str):
    """Serve uploaded files"""
    file_path = STORAGE_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return FileResponse(path=file_path)

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
            "message": f"Internal server error: {str(exc)}"
        }
    )

# ============================================
# STARTUP/SHUTDOWN
# ============================================

@app.on_event("startup")
async def startup_event():
    """Initialize"""
    print("🚀 Starting MiMiCheck API (Sprint 1 Enhanced)...")
    print(f"📍 CORS Origins: {os.getenv('CORS_ALLOW_ORIGINS')}")
    print(f"💾 Storage Directory: {STORAGE_DIR}")
    print(f"📊 Uploads: {len(UPLOADS)}, Analyses: {len(ANALYSES)}, Reports: {len(REPORTS)}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup"""
    print("👋 Shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_enhanced:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=True
    )
