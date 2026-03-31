"""
LLM API Endpoints
Echte OpenAI Integration (kein Mock)
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import logging

from services.llm_service import get_llm_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/llm", tags=["LLM"])

# ============================================
# MODELS
# ============================================

class InvokeLLMRequest(BaseModel):
    """LLM-Anfrage"""
    prompt: str = Field(..., description="User Prompt")
    system_prompt: Optional[str] = Field(None, description="System Instructions")
    temperature: Optional[float] = Field(0.7, ge=0, le=2, description="Kreativität (0-2)")
    max_tokens: Optional[int] = Field(None, gt=0, description="Max Antwortlänge")
    json_mode: bool = Field(False, description="JSON-Antwort erzwingen")

class InvokeLLMResponse(BaseModel):
    """LLM-Antwort"""
    content: str
    usage: Dict[str, int]
    model: str
    finish_reason: str

class ChatRequest(BaseModel):
    """Chat-Anfrage"""
    message: str = Field(..., description="User-Nachricht")
    conversation_history: Optional[List[Dict[str, str]]] = Field(None, description="Chat-Historie")
    user_tier: str = Field("free", description="User-Tier (free/basic/premium)")

class ChatResponse(BaseModel):
    """Chat-Antwort"""
    response: str
    tokens_used: Optional[int] = None

class AnalyzeNebenkostenRequest(BaseModel):
    """Nebenkosten-Analyse-Anfrage"""
    extracted_data: Dict[str, Any] = Field(..., description="Extrahierte PDF-Daten")
    user_context: Optional[Dict[str, Any]] = Field(None, description="User-Kontext")

class AnalyzeNebenkostenResponse(BaseModel):
    """Nebenkosten-Analyse-Antwort"""
    fehler: List[Dict[str, Any]]
    einsparpotenzial: List[Dict[str, Any]]
    rechtliche_hinweise: List[str]
    risiko_score: int
    zusammenfassung: str

class HealthResponse(BaseModel):
    """Health Status"""
    status: str
    openai_configured: bool
    model: str

# ============================================
# ENDPOINTS
# ============================================

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Prüft ob LLM-Service verfügbar ist"""
    llm_service = get_llm_service()
    
    return HealthResponse(
        status="available" if llm_service.is_available() else "unavailable",
        openai_configured=llm_service.is_available(),
        model=llm_service.model if llm_service.is_available() else "none"
    )

@router.post("/invoke", response_model=InvokeLLMResponse)
async def invoke_llm(request: InvokeLLMRequest):
    """
    Führt LLM-Anfrage aus (generisch)
    
    **Beispiel:**
    ```json
    {
      "prompt": "Erkläre mir das deutsche Mietrecht in 3 Sätzen",
      "system_prompt": "Du bist ein Rechtsexperte",
      "temperature": 0.7
    }
    ```
    """
    llm_service = get_llm_service()
    
    if not llm_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OpenAI API nicht konfiguriert. Setze OPENAI_API_KEY in .env"
        )
    
    try:
        result = await llm_service.invoke(
            prompt=request.prompt,
            system_prompt=request.system_prompt,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            json_mode=request.json_mode
        )
        
        return InvokeLLMResponse(**result)
        
    except Exception as e:
        logger.error(f"LLM Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LLM-Anfrage fehlgeschlagen: {str(e)}"
        )

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat-Assistent für Mietrechts-Fragen
    
    **Beispiel:**
    ```json
    {
      "message": "Was sind meine Rechte als Mieter?",
      "user_tier": "free"
    }
    ```
    """
    llm_service = get_llm_service()
    
    if not llm_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OpenAI API nicht konfiguriert"
        )
    
    try:
        response_text = await llm_service.chat_assistant(
            user_message=request.message,
            conversation_history=request.conversation_history,
            user_tier=request.user_tier
        )
        
        return ChatResponse(
            response=response_text,
            tokens_used=None  # TODO: Track tokens
        )
        
    except Exception as e:
        logger.error(f"Chat Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat-Anfrage fehlgeschlagen: {str(e)}"
        )

@router.post("/analyze-nebenkosten", response_model=AnalyzeNebenkostenResponse)
async def analyze_nebenkosten(request: AnalyzeNebenkostenRequest):
    """
    Analysiert Nebenkostenabrechnung mit KI
    
    **Beispiel:**
    ```json
    {
      "extracted_data": {
        "titel": "Nebenkostenabrechnung 2023",
        "gesamtkosten": 1500.50,
        "positionen": [...]
      },
      "user_context": {
        "wohnflaeche": 65,
        "personen": 2
      }
    }
    ```
    """
    llm_service = get_llm_service()
    
    if not llm_service.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OpenAI API nicht konfiguriert"
        )
    
    try:
        result = await llm_service.analyze_nebenkosten(
            extracted_data=request.extracted_data,
            user_context=request.user_context
        )
        
        return AnalyzeNebenkostenResponse(**result)
        
    except Exception as e:
        logger.error(f"Analysis Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analyse fehlgeschlagen: {str(e)}"
        )
