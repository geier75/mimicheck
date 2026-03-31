"""
PDF Extraction Service
Extrahiert ECHTE Daten aus Nebenkostenabrechnungen (kein Mock!)
"""
import logging
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False
    logging.warning("pdfplumber nicht installiert")

try:
    from pdfminer.high_level import extract_text as pdfminer_extract
    HAS_PDFMINER = True
except ImportError:
    HAS_PDFMINER = False
    logging.warning("pdfminer.six nicht installiert")

# OCR-Module nur bei Bedarf laden, weil einige macOS-Builds von numpy/pytesseract
# beim Import segfaulten. Wir merken uns den Fehler und versuchen es später nicht erneut.
HAS_OCR = False
_OCR_IMPORT_ERROR: Optional[Exception] = None

logger = logging.getLogger(__name__)

class PDFExtractionService:
    """Extrahiert echte Daten aus Nebenkostenabrechnung-PDFs"""
    
    def __init__(self):
        self.extraction_methods = []
        if HAS_PDFPLUMBER:
            self.extraction_methods.append(self._extract_with_pdfplumber)
        if HAS_PDFMINER:
            self.extraction_methods.append(self._extract_with_pdfminer)
    
    def extract_from_pdf(self, pdf_path: str, use_ocr: bool = False) -> Dict[str, Any]:
        """
        Extrahiert Daten aus PDF-Nebenkostenabrechnung
        
        Args:
            pdf_path: Pfad zur PDF-Datei
            use_ocr: OCR für Scans nutzen
            
        Returns:
            {
                "titel": str,
                "abrechnungszeitraum": str,
                "verwalter": str,
                "objekt_adresse": str,
                "gesamtkosten": float,
                "positionen": [
                    {"name": str, "betrag": float, "umlageschluessel": str}
                ],
                "extraction_method": str,
                "raw_text": str (optional)
            }
        """
        pdf_path = Path(pdf_path)
        
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF nicht gefunden: {pdf_path}")
        
        logger.info(f"📄 Extrahiere Daten aus: {pdf_path.name}")
        
        # Versuch 1: pdfplumber (beste Strukturierung)
        if HAS_PDFPLUMBER:
            try:
                result = self._extract_with_pdfplumber(pdf_path)
                if result.get("success"):
                    logger.info("✅ Extraktion mit pdfplumber erfolgreich")
                    return result["data"]
            except Exception as e:
                logger.warning(f"pdfplumber fehlgeschlagen: {e}")
        
        # Versuch 2: pdfminer (Fallback)
        if HAS_PDFMINER:
            try:
                result = self._extract_with_pdfminer(pdf_path)
                if result.get("success"):
                    logger.info("✅ Extraktion mit pdfminer erfolgreich")
                    return result["data"]
            except Exception as e:
                logger.warning(f"pdfminer fehlgeschlagen: {e}")
        
        # Versuch 3: OCR (für Scans)
        if use_ocr and self._ensure_ocr_available():
            try:
                result = self._extract_with_ocr(pdf_path)
                if result.get("success"):
                    logger.info("✅ Extraktion mit OCR erfolgreich")
                    return result["data"]
            except Exception as e:
                logger.warning(f"OCR fehlgeschlagen: {e}")
        
        # Fallback: Basis-Daten
        logger.warning("⚠️ Keine Extraktion erfolgreich - Basis-Daten")
        return self._get_fallback_data(pdf_path)
    
    def _extract_with_pdfplumber(self, pdf_path: Path) -> Dict[str, Any]:
        """Extrahiert mit pdfplumber (strukturiert)"""
        import pdfplumber
        
        with pdfplumber.open(pdf_path) as pdf:
            # Alle Seiten text
            full_text = "\n".join(page.extract_text() or "" for page in pdf.pages)
            
            # Tabellen extrahieren
            tables = []
            for page in pdf.pages:
                page_tables = page.extract_tables()
                if page_tables:
                    tables.extend(page_tables)
            
            # Daten parsen
            data = self._parse_text(full_text, tables)
            data["extraction_method"] = "pdfplumber"
            data["raw_text"] = full_text[:1000]  # Ersten 1000 Zeichen
            
            return {"success": True, "data": data}
    
    def _extract_with_pdfminer(self, pdf_path: Path) -> Dict[str, Any]:
        """Extrahiert mit pdfminer (Fallback)"""
        text = pdfminer_extract(str(pdf_path))
        
        data = self._parse_text(text, [])
        data["extraction_method"] = "pdfminer"
        data["raw_text"] = text[:1000]
        
        return {"success": True, "data": data}
    
    def _ensure_ocr_available(self) -> bool:
        """Lazy-Load OCR Dependencies to avoid crashes on import."""
        global HAS_OCR, _OCR_IMPORT_ERROR

        if HAS_OCR:
            return True
        if _OCR_IMPORT_ERROR:
            logger.warning("OCR deaktiviert: %s", _OCR_IMPORT_ERROR)
            return False

        try:
            import pytesseract  # type: ignore
            from PIL import Image  # type: ignore
        except Exception as exc:
            _OCR_IMPORT_ERROR = exc
            logger.warning("pytesseract/PIL nicht verfügbar - OCR deaktiviert: %s", exc)
            return False

        # Module global bereitstellen, damit _extract_with_ocr darauf zugreifen kann.
        globals()["pytesseract"] = pytesseract
        globals()["Image"] = Image
        HAS_OCR = True
        return True

    def _extract_with_ocr(self, pdf_path: Path) -> Dict[str, Any]:
        """Extrahiert mit OCR (für Scans)"""
        # TODO: PDF → Image → OCR
        # Für Sprint 1: Not implemented
        logger.warning("OCR noch nicht implementiert")
        return {"success": False}
    
    def _parse_text(self, text: str, tables: List[List[List[str]]]) -> Dict[str, Any]:
        """
        Parst extrahierten Text und extrahiert Nebenkosten-Daten
        """
        data = {
            "titel": self._extract_titel(text),
            "abrechnungszeitraum": self._extract_zeitraum(text),
            "verwalter": self._extract_verwalter(text),
            "objekt_adresse": self._extract_adresse(text),
            "gesamtkosten": self._extract_gesamtkosten(text),
            "positionen": self._extract_positionen(text, tables)
        }
        
        return data
    
    def _extract_titel(self, text: str) -> str:
        """Extrahiert Titel/Überschrift"""
        # Suche nach "Nebenkostenabrechnung", "Betriebskostenabrechnung" etc.
        patterns = [
            r"(Nebenkostenabrechnung.*\d{4})",
            r"(Betriebskostenabrechnung.*\d{4})",
            r"(Jahresabrechnung.*\d{4})",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        # Fallback: Erste Zeile
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        return lines[0] if lines else "Nebenkostenabrechnung"
    
    def _extract_zeitraum(self, text: str) -> str:
        """Extrahiert Abrechnungszeitraum"""
        # Pattern: "01.01.2023 - 31.12.2023" oder "2023"
        patterns = [
            r"(\d{2}\.\d{2}\.\d{4})\s*[-–bis]\s*(\d{2}\.\d{2}\.\d{4})",
            r"Abrechnungszeitraum[:\s]*(\d{2}\.\d{2}\.\d{4})\s*[-–bis]\s*(\d{2}\.\d{2}\.\d{4})",
            r"Zeitraum[:\s]*(\d{2}\.\d{2}\.\d{4})\s*[-–bis]\s*(\d{2}\.\d{2}\.\d{4})",
            r"(\d{4})",  # Nur Jahr
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if len(match.groups()) >= 2:
                    return f"{match.group(1)} - {match.group(2)}"
                return match.group(1)
        
        # Fallback: Aktuelles Jahr
        return str(datetime.now().year)
    
    def _extract_verwalter(self, text: str) -> str:
        """Extrahiert Verwalter/Hausverwaltung"""
        patterns = [
            r"Hausverwaltung[:\s]*([^\n]+)",
            r"Verwalter[:\s]*([^\n]+)",
            r"Verwaltung[:\s]*([^\n]+)",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return "Nicht erkannt"
    
    def _extract_adresse(self, text: str) -> str:
        """Extrahiert Objekt-Adresse"""
        # Pattern: Straße Nr, PLZ Ort
        pattern = r"([A-ZÄÖÜ][a-zäöüß\-]+(?:\s+[A-ZÄÖÜ][a-zäöüß\-]+)*\s+\d+[a-z]?),?\s+(\d{5})\s+([A-ZÄÖÜ][a-zäöüß\-]+(?:\s+[A-ZÄÖÜ][a-zäöüß\-]+)*)"
        
        match = re.search(pattern, text)
        if match:
            return f"{match.group(1)}, {match.group(2)} {match.group(3)}"
        
        return "Nicht erkannt"
    
    def _extract_gesamtkosten(self, text: str) -> float:
        """Extrahiert Gesamtkosten"""
        patterns = [
            r"Gesamtbetrag[:\s]*([\d\.]+,\d{2})\s*€",
            r"Gesamtkosten[:\s]*([\d\.]+,\d{2})\s*€",
            r"Summe[:\s]*([\d\.]+,\d{2})\s*€",
            r"Nachzahlung[:\s]*([\d\.]+,\d{2})\s*€",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                betrag_str = match.group(1).replace(".", "").replace(",", ".")
                return float(betrag_str)
        
        return 0.0
    
    def _extract_positionen(self, text: str, tables: List[List[List[str]]]) -> List[Dict[str, Any]]:
        """Extrahiert einzelne Kostenpositionen"""
        positionen = []
        
        # Aus Tabellen extrahieren (wenn vorhanden)
        if tables:
            for table in tables:
                for row in table[1:]:  # Skip header
                    if len(row) >= 2:
                        name = str(row[0]).strip()
                        betrag_str = str(row[-1]).strip()  # Letzter Wert = Betrag
                        
                        # Parse Betrag
                        betrag = self._parse_betrag(betrag_str)
                        if betrag > 0:
                            positionen.append({
                                "name": name,
                                "betrag": betrag,
                                "umlageschluessel": row[1] if len(row) > 2 else "Nicht angegeben"
                            })
        
        # Aus Text extrahieren (Fallback)
        if not positionen:
            # Pattern: "Heizkosten 450,00 €"
            pattern = r"([A-ZÄÖÜ][a-zäöüß\-/]+(?:\s+[a-zäöüß\-/]+)*)\s+([\d\.]+,\d{2})\s*€"
            matches = re.findall(pattern, text)
            
            for name, betrag_str in matches:
                betrag = self._parse_betrag(betrag_str)
                if betrag > 10:  # Filter kleine Beträge
                    positionen.append({
                        "name": name.strip(),
                        "betrag": betrag,
                        "umlageschluessel": "Nicht angegeben"
                    })
        
        return positionen[:20]  # Max 20 Positionen
    
    def _parse_betrag(self, betrag_str: str) -> float:
        """Parst Betrag-String zu Float"""
        try:
            # "1.234,56" → 1234.56
            clean = betrag_str.replace(".", "").replace(",", ".").replace("€", "").strip()
            return float(clean)
        except ValueError:
            return 0.0
    
    def _get_fallback_data(self, pdf_path: Path) -> Dict[str, Any]:
        """Fallback-Daten wenn Extraktion fehlschlägt"""
        return {
            "titel": f"Abrechnung - {pdf_path.stem}",
            "abrechnungszeitraum": str(datetime.now().year),
            "verwalter": "Automatische Extraktion fehlgeschlagen",
            "objekt_adresse": "Bitte manuell prüfen",
            "gesamtkosten": 0.0,
            "positionen": [],
            "extraction_method": "fallback",
            "error": "Keine Extraktionsmethode erfolgreich"
        }

# Global Instance
_extraction_service = None

def get_extraction_service() -> PDFExtractionService:
    """Singleton PDF Extraction Service"""
    global _extraction_service
    if _extraction_service is None:
        _extraction_service = PDFExtractionService()
    return _extraction_service
