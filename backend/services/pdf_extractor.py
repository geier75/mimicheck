"""
PDF Extractor Service
Extrahiert Text und Formularfelder aus PDFs (digital + OCR).
"""
import re
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path

logger = logging.getLogger(__name__)

class PDFExtractor:
    """Extrahiert FormSchema aus PDF-Dateien"""
    
    def __init__(self, ocr_enabled: bool = True, ocr_lang: str = "deu"):
        self.ocr_enabled = ocr_enabled
        self.ocr_lang = ocr_lang
        
    def extract_text(self, pdf_path: str) -> str:
        """
        Extrahiert Text aus PDF (digital oder OCR).
        
        Args:
            pdf_path: Pfad zur PDF-Datei
            
        Returns:
            Extrahierter Text
        """
        try:
            # Versuch 1: Digitales PDF mit pdfminer
            from pdfminer.high_level import extract_text
            text = extract_text(pdf_path)
            
            if text.strip():
                logger.info(f"Digital PDF text extracted: {len(text)} chars")
                return text
                
        except Exception as e:
            logger.warning(f"pdfminer extraction failed: {e}")
        
        # Versuch 2: OCR mit pytesseract + pdfplumber
        if self.ocr_enabled:
            try:
                return self._extract_with_ocr(pdf_path)
            except Exception as e:
                logger.error(f"OCR extraction failed: {e}")
                
        return ""
    
    def _extract_with_ocr(self, pdf_path: str) -> str:
        """OCR-Fallback für Scans"""
        try:
            import pytesseract
            import pdfplumber
            
            pages = []
            with pdfplumber.open(pdf_path) as pdf:
                for i, page in enumerate(pdf.pages):
                    logger.info(f"OCR processing page {i+1}/{len(pdf.pages)}")
                    img = page.to_image(resolution=300).original
                    text = pytesseract.image_to_string(img, lang=self.ocr_lang)
                    pages.append(text)
                    
            full_text = "\n\n".join(pages)
            logger.info(f"OCR completed: {len(full_text)} chars")
            return full_text
            
        except ImportError:
            logger.warning("pytesseract or pdfplumber not installed, OCR disabled")
            return ""
    
    def extract_acroform_fields(self, pdf_path: str) -> List[Dict[str, Any]]:
        """
        Extrahiert AcroForm-Felder aus PDF.
        
        Returns:
            Liste von Feldern mit id, label, type, required
        """
        fields = []
        
        try:
            from pdfrw import PdfReader
            
            pdf = PdfReader(pdf_path)
            
            for page in pdf.pages:
                if not page.Annots:
                    continue
                    
                for annot in page.Annots:
                    if not annot.T:  # Kein Feldname
                        continue
                        
                    field_name = annot.T[1:-1] if annot.T.startswith('(') else annot.T
                    field_type = self._get_field_type(annot)
                    field_value = annot.V if hasattr(annot, 'V') else None
                    
                    # Optional: Label aus TU (Tooltip/Alternative Description)
                    field_label = annot.TU[1:-1] if hasattr(annot, 'TU') and annot.TU else field_name
                    
                    fields.append({
                        "id": field_name,
                        "label": field_label,
                        "type": field_type,
                        "value": field_value,
                        "required": hasattr(annot, 'Ff') and (int(annot.Ff) & 2) != 0  # Bit 2 = Required
                    })
                    
            logger.info(f"Extracted {len(fields)} AcroForm fields")
            
        except ImportError:
            logger.warning("pdfrw not installed, AcroForm extraction disabled")
        except Exception as e:
            logger.error(f"AcroForm extraction failed: {e}")
            
        return fields
    
    def _get_field_type(self, annot) -> str:
        """Bestimmt Feldtyp aus AcroForm Annotation"""
        # FT = Field Type
        if not hasattr(annot, 'FT'):
            return "string"
            
        ft = annot.FT[1:] if annot.FT.startswith('/') else annot.FT
        
        type_map = {
            "Tx": "string",      # Text
            "Btn": "checkbox",   # Button/Checkbox
            "Ch": "select",      # Choice
            "Sig": "signature"   # Signature
        }
        
        return type_map.get(ft, "string")
    
    def guess_fields_from_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Heuristik: Erkennt Felder aus Text-Pattern (für nicht-AcroForm PDFs).
        
        Pattern: 
        - "Label: _______"
        - "Label [______]"
        - "Label ☐"
        """
        fields = []
        
        # Pattern 1: Label: ______ oder Label [____]
        pattern1 = re.compile(
            r'([A-ZÄÖÜa-zäöüß\s/()\-\.]+):\s*_{3,}|'
            r'([A-ZÄÖÜa-zäöüß\s/()\-\.]+)\s*\[.{3,}\]'
        )
        
        for match in pattern1.finditer(text):
            label = (match.group(1) or match.group(2) or '').strip()
            if len(label) < 2 or len(label) > 100:
                continue
                
            field_id = self._normalize_field_id(label)
            field_type = self._guess_field_type(label)
            
            fields.append({
                "id": field_id,
                "label": label,
                "type": field_type,
                "required": False,
                "confidence": 0.6
            })
        
        # Pattern 2: Checkbox-Felder  "☐ Label" oder "[ ] Label"
        pattern2 = re.compile(r'[☐\[\]]\s+([A-ZÄÖÜa-zäöüß\s/()\-\.]{3,50})')
        
        for match in pattern2.finditer(text):
            label = match.group(1).strip()
            field_id = self._normalize_field_id(label)
            
            fields.append({
                "id": field_id,
                "label": label,
                "type": "checkbox",
                "required": False,
                "confidence": 0.7
            })
        
        logger.info(f"Guessed {len(fields)} fields from text patterns")
        return fields
    
    def _normalize_field_id(self, label: str) -> str:
        """Normalisiert Label zu field_id: 'Vorname' -> 'vorname'"""
        # Sonderzeichen entfernen, Leerzeichen durch Underscore
        field_id = re.sub(r'[^\w\s]', '', label)
        field_id = field_id.lower().strip().replace(' ', '_')
        return field_id
    
    def _guess_field_type(self, label: str) -> str:
        """Rät Feldtyp aus Label-Text"""
        label_lower = label.lower()
        
        # Datum
        if any(word in label_lower for word in ['datum', 'geburt', 'date', 'von', 'bis']):
            return "date"
        
        # Telefon
        if any(word in label_lower for word in ['telefon', 'tel.', 'mobil', 'handy', 'phone']):
            return "tel"
        
        # Email
        if 'mail' in label_lower:
            return "email"
        
        # IBAN
        if 'iban' in label_lower or 'kontoverbindung' in label_lower:
            return "iban"
        
        # PLZ
        if 'plz' in label_lower or 'postleitzahl' in label_lower:
            return "plz"
        
        # Number
        if any(word in label_lower for word in ['anzahl', 'betrag', 'summe', 'höhe', 'zahl', 'nummer']):
            return "number"
        
        return "string"
    
    def extract_form_schema(self, pdf_path: str, form_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Hauptmethode: Extrahiert vollständiges FormSchema.
        
        Returns:
            {
                "form_id": str,
                "title": str,
                "fields": List[Dict],
                "source": {"file": str}
            }
        """
        path = Path(pdf_path)
        
        # 1. Text extrahieren
        text = self.extract_text(pdf_path)
        
        # 2. AcroForm-Felder (falls vorhanden)
        acro_fields = self.extract_acroform_fields(pdf_path)
        
        # 3. Text-basierte Felder (Fallback)
        text_fields = self.guess_fields_from_text(text) if not acro_fields else []
        
        # 4. Titel aus Filename oder erstem Text
        title = path.stem.replace('_', ' ').title()
        if text:
            first_lines = text.split('\n')[:5]
            for line in first_lines:
                if len(line) > 10 and len(line) < 100:
                    title = line.strip()
                    break
        
        # 5. Form-ID generieren
        if not form_id:
            form_id = f"auto/{abs(hash(pdf_path)) % 100000:05d}"
        
        return {
            "form_id": form_id,
            "title": title,
            "fields": acro_fields if acro_fields else text_fields,
            "source": {
                "file": path.name,
                "path": str(path.absolute()),
                "has_acroform": len(acro_fields) > 0
            },
            "stats": {
                "text_length": len(text),
                "field_count": len(acro_fields) + len(text_fields)
            }
        }


# Convenience function
def extract_form(pdf_path: str, ocr_enabled: bool = True) -> Dict[str, Any]:
    """Schnelle Extraktion ohne Instanziierung"""
    extractor = PDFExtractor(ocr_enabled=ocr_enabled)
    return extractor.extract_form_schema(pdf_path)
