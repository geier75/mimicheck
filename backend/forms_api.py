"""
Forms API - Universal Antrags-Assistent Endpoints
Extrahiert, befüllt und verarbeitet beliebige Formulare.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import os
import uuid
import logging
from pathlib import Path
import tempfile

from services.pdf_extractor import PDFExtractor
from services.pdf_filler import PDFFiller
from services.field_normalizer import FieldNormalizer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/forms", tags=["forms"])

# Pydantic Models
class FormField(BaseModel):
    id: str
    label: str
    type: str = "string"
    required: bool = False
    value: Optional[Any] = None
    confidence: Optional[float] = None

class FormSchema(BaseModel):
    form_id: str
    title: str
    fields: List[FormField]
    source: Dict[str, Any]
    stats: Optional[Dict[str, Any]] = None

class FieldMapping(BaseModel):
    field_id: str
    label: Optional[str] = None
    value: Any
    confidence: Optional[float] = None

class FillRequest(BaseModel):
    mappings: List[FieldMapping]
    title: Optional[str] = None
    flatten: bool = True

class ExtractResponse(BaseModel):
    success: bool
    form_schema: FormSchema
    upload_id: str

class FillResponse(BaseModel):
    success: bool
    output_url: str
    method: str  # "acroform" | "simple"
    filled_count: int

# In-Memory Storage (später DB)
FORMS_STORAGE = {}
UPLOADS_DIR = Path("uploads/forms")
OUTPUTS_DIR = Path("outputs/forms")

# Verzeichnisse erstellen
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/extract", response_model=ExtractResponse)
async def extract_form(
    file: UploadFile = File(...),
    ocr_enabled: bool = True
):
    """
    Extrahiert FormSchema aus hochgeladenem PDF.
    
    - Erkennt AcroForm-Felder
    - Falls nicht: Text-Pattern-Matching
    - Optional: OCR für Scans
    
    Returns:
        FormSchema mit allen erkannten Feldern
    """
    try:
        # Datei validieren
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Nur PDF-Dateien erlaubt")
        
        # Speichern
        upload_id = str(uuid.uuid4())
        file_path = UPLOADS_DIR / f"{upload_id}_{file.filename}"
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        logger.info(f"Uploaded form: {file.filename} ({len(content)} bytes)")
        
        # Extrahieren
        extractor = PDFExtractor(ocr_enabled=ocr_enabled)
        form_schema = extractor.extract_form_schema(str(file_path), form_id=upload_id)
        
        # In Memory speichern
        FORMS_STORAGE[upload_id] = {
            "schema": form_schema,
            "file_path": str(file_path),
            "filename": file.filename
        }
        
        logger.info(f"Extracted {len(form_schema['fields'])} fields from {file.filename}")
        
        return ExtractResponse(
            success=True,
            form_schema=FormSchema(**form_schema),
            upload_id=upload_id
        )
        
    except Exception as e:
        logger.error(f"Form extraction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Extraktion fehlgeschlagen: {str(e)}")


@router.post("/fill/{upload_id}", response_model=FillResponse)
async def fill_form(
    upload_id: str,
    request: FillRequest
):
    """
    Befüllt extrahiertes Formular mit Daten.
    
    Args:
        upload_id: ID aus /extract Endpoint
        request: Mappings (field_id → value)
        
    Returns:
        Download-URL für befülltes PDF
    """
    try:
        # Formular abrufen
        if upload_id not in FORMS_STORAGE:
            raise HTTPException(status_code=404, detail="Formular nicht gefunden")
        
        form_data = FORMS_STORAGE[upload_id]
        src_path = form_data["file_path"]
        
        # Ausgabedatei
        output_filename = f"filled_{upload_id}.pdf"
        output_path = OUTPUTS_DIR / output_filename
        
        # Mappings normalisieren
        normalized_mappings = []
        for mapping in request.mappings:
            # Feldtyp aus Schema holen
            field = next(
                (f for f in form_data["schema"]["fields"] if f["id"] == mapping.field_id),
                None
            )
            
            if field:
                field_type = field.get("type", "string")
                normalized_value = FieldNormalizer.normalize(mapping.value, field_type)
            else:
                normalized_value = str(mapping.value)
            
            normalized_mappings.append({
                "field_id": mapping.field_id,
                "label": mapping.label,
                "value": normalized_value
            })
        
        logger.info(f"Filling {len(normalized_mappings)} fields for {upload_id}")
        
        # Befüllen
        filler = PDFFiller()
        result = filler.fill_form(
            src_path,
            str(output_path),
            normalized_mappings,
            title=request.title
        )
        
        # Download-URL
        download_url = f"/outputs/forms/{output_filename}"
        
        return FillResponse(
            success=True,
            output_url=download_url,
            method=result["method"],
            filled_count=result["filled_count"]
        )
        
    except Exception as e:
        logger.error(f"Form filling failed: {e}")
        raise HTTPException(status_code=500, detail=f"Befüllen fehlgeschlagen: {str(e)}")


@router.post("/extract-and-fill", response_model=FillResponse)
async def extract_and_fill(
    file: UploadFile = File(...),
    mappings: str = Form(...),  # JSON string
    title: Optional[str] = Form(None),
    ocr_enabled: bool = Form(True)
):
    """
    Convenience: Extrahiert UND befüllt in einem Schritt.
    
    Nutze dies wenn du Felder bereits kennst (z.B. aus Profil).
    """
    try:
        import json
        
        # 1. Extrahieren
        extract_result = await extract_form(file, ocr_enabled)
        upload_id = extract_result.upload_id
        
        # 2. Mappings parsen
        mappings_list = json.loads(mappings)
        fill_request = FillRequest(
            mappings=[FieldMapping(**m) for m in mappings_list],
            title=title
        )
        
        # 3. Befüllen
        fill_result = await fill_form(upload_id, fill_request)
        
        return fill_result
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Ungültiges JSON in mappings")
    except Exception as e:
        logger.error(f"Extract-and-fill failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/schema/{upload_id}", response_model=FormSchema)
async def get_form_schema(upload_id: str):
    """
    Ruft gespeichertes FormSchema ab.
    """
    if upload_id not in FORMS_STORAGE:
        raise HTTPException(status_code=404, detail="Formular nicht gefunden")
    
    schema = FORMS_STORAGE[upload_id]["schema"]
    return FormSchema(**schema)


@router.delete("/form/{upload_id}")
async def delete_form(upload_id: str):
    """
    Löscht hochgeladenes Formular und generierte Outputs.
    """
    if upload_id not in FORMS_STORAGE:
        raise HTTPException(status_code=404, detail="Formular nicht gefunden")
    
    try:
        # Dateien löschen
        form_data = FORMS_STORAGE[upload_id]
        src_path = Path(form_data["file_path"])
        
        if src_path.exists():
            src_path.unlink()
        
        # Output löschen (falls vorhanden)
        output_path = OUTPUTS_DIR / f"filled_{upload_id}.pdf"
        if output_path.exists():
            output_path.unlink()
        
        # Aus Storage entfernen
        del FORMS_STORAGE[upload_id]
        
        logger.info(f"Deleted form {upload_id}")
        
        return {"success": True, "message": "Formular gelöscht"}
        
    except Exception as e:
        logger.error(f"Delete failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/normalize")
async def normalize_field(value: str, field_type: str = "string"):
    """
    Test-Endpoint: Normalisiert einzelnen Wert.
    
    Beispiel: /api/forms/normalize?value=DE89370400440532013000&field_type=iban
    """
    normalized = FieldNormalizer.normalize(value, field_type)
    is_valid = FieldNormalizer.validate(normalized, field_type) if normalized else False
    
    return {
        "original": value,
        "normalized": normalized,
        "field_type": field_type,
        "is_valid": is_valid
    }


# Health Check für Forms API
@router.get("/health")
async def forms_health():
    """Status der Forms API"""
    return {
        "status": "healthy",
        "forms_count": len(FORMS_STORAGE),
        "uploads_dir": str(UPLOADS_DIR),
        "outputs_dir": str(OUTPUTS_DIR)
    }
