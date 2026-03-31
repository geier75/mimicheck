"""
Field Normalizer Service
Normalisiert Feldwerte (IBAN, Datum, PLZ, Telefon).
"""
import re
from typing import Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class FieldNormalizer:
    """Normalisiert Feldwerte nach Typ"""
    
    @staticmethod
    def normalize(value: Any, field_type: str) -> Optional[str]:
        """
        Hauptmethode: Normalisiert Wert nach Typ.
        
        Args:
            value: Roher Wert
            field_type: Feldtyp (date, iban, plz, tel, email, string)
            
        Returns:
            Normalisierter Wert oder None bei Fehler
        """
        if value is None:
            return None
        
        value_str = str(value).strip()
        if not value_str:
            return None
        
        normalizers = {
            "date": FieldNormalizer.normalize_date,
            "iban": FieldNormalizer.normalize_iban,
            "plz": FieldNormalizer.normalize_plz,
            "tel": FieldNormalizer.normalize_tel,
            "email": FieldNormalizer.normalize_email,
            "number": FieldNormalizer.normalize_number,
            "string": lambda v: v.strip()
        }
        
        normalizer = normalizers.get(field_type, lambda v: v.strip())
        
        try:
            return normalizer(value_str)
        except Exception as e:
            logger.warning(f"Normalization failed for type '{field_type}': {e}")
            return value_str
    
    @staticmethod
    def normalize_date(value: str, output_format: str = "DD.MM.YYYY") -> str:
        """
        Normalisiert Datumsangaben.
        
        Unterstützt:
        - YYYY-MM-DD → DD.MM.YYYY
        - DD.MM.YYYY → DD.MM.YYYY
        - DD/MM/YYYY → DD.MM.YYYY
        
        Args:
            value: Rohdatum
            output_format: Zielformat (DD.MM.YYYY, YYYY-MM-DD)
            
        Returns:
            Formatiertes Datum
        """
        # Entferne alle non-digit außer Trennzeichen
        cleaned = re.sub(r'[^\d\-\./]', '', value)
        
        # Extrahiere Zahlen
        numbers = re.findall(r'\d+', cleaned)
        
        if len(numbers) < 3:
            return value  # Kann nicht parsen
        
        # Bestimme Format
        if len(numbers[0]) == 4:  # YYYY-MM-DD
            year, month, day = numbers[0], numbers[1], numbers[2]
        else:  # DD.MM.YYYY oder DD/MM/YYYY
            day, month, year = numbers[0], numbers[1], numbers[2]
        
        # Validierung
        try:
            # Python datetime zur Validierung
            dt = datetime(int(year), int(month), int(day))
            
            if output_format == "DD.MM.YYYY":
                return f"{int(day):02d}.{int(month):02d}.{year}"
            elif output_format == "YYYY-MM-DD":
                return f"{year}-{int(month):02d}-{int(day):02d}"
            else:
                return f"{int(day):02d}.{int(month):02d}.{year}"
                
        except ValueError as e:
            logger.warning(f"Invalid date values: {day}.{month}.{year}")
            return value
    
    @staticmethod
    def normalize_iban(value: str) -> str:
        """
        Normalisiert IBAN (mit Leerzeichen alle 4 Zeichen).
        
        DE89370400440532013000 → DE89 3704 0044 0532 0130 00
        """
        # Alle Leerzeichen entfernen
        iban = re.sub(r'\s', '', value).upper()
        
        # Validierung: DE-IBAN hat 22 Zeichen
        if iban.startswith('DE') and len(iban) != 22:
            logger.warning(f"Invalid DE-IBAN length: {len(iban)}")
        
        # Leerzeichen alle 4 Zeichen einfügen
        chunks = [iban[i:i+4] for i in range(0, len(iban), 4)]
        return ' '.join(chunks)
    
    @staticmethod
    def normalize_plz(value: str) -> str:
        """
        Normalisiert deutsche PLZ (5 Ziffern).
        
        12345 → 12345
        1234 → 01234
        """
        digits = re.sub(r'\D', '', value)
        
        if len(digits) > 5:
            logger.warning(f"PLZ too long: {digits}")
            digits = digits[:5]
        
        # Auf 5 Stellen auffüllen
        return digits.zfill(5)
    
    @staticmethod
    def normalize_tel(value: str) -> str:
        """
        Normalisiert Telefonnummer (deutsche Formate).
        
        +49 123 456789 → +49 123 456789
        0123/456789 → 0123 456789
        """
        # Entferne alles außer +, Zahlen und Leerzeichen
        cleaned = re.sub(r'[^\d\+\s]', '', value)
        
        # Mehrfache Leerzeichen durch einzelnes ersetzen
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        
        # Optional: Internationale Vorwahl normalisieren
        if cleaned.startswith('0049'):
            cleaned = '+49 ' + cleaned[4:]
        elif cleaned.startswith('49') and not cleaned.startswith('+'):
            cleaned = '+49 ' + cleaned[2:]
        
        return cleaned
    
    @staticmethod
    def normalize_email(value: str) -> str:
        """Normalisiert Email (lowercase, trim)"""
        return value.strip().lower()
    
    @staticmethod
    def normalize_number(value: str) -> str:
        """
        Normalisiert Zahlen.
        
        1.234,56 → 1234.56 (float)
        1,234.56 → 1234.56 (float)
        """
        # Entferne Tausendertrennzeichen
        cleaned = value.replace(' ', '').replace('.', '').replace(',', '.')
        
        try:
            # Versuche als Float zu parsen
            number = float(cleaned)
            
            # Gebe als String zurück (mit . als Dezimaltrenner)
            if number.is_integer():
                return str(int(number))
            else:
                return str(number)
                
        except ValueError:
            logger.warning(f"Could not parse number: {value}")
            return value
    
    @staticmethod
    def validate(value: str, field_type: str) -> bool:
        """
        Validiert ob Wert dem Typ entspricht.
        
        Returns:
            True wenn valid, False sonst
        """
        if not value or not value.strip():
            return False
        
        validators = {
            "email": lambda v: re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v),
            "iban": lambda v: re.match(r'^[A-Z]{2}\d{2}[\s\d]{10,}$', v),
            "plz": lambda v: re.match(r'^\d{5}$', v.replace(' ', '')),
            "tel": lambda v: re.match(r'^[\+\d\s\-\(\)]+$', v) and len(re.sub(r'\D', '', v)) >= 6,
            "date": lambda v: bool(re.match(r'^\d{1,2}[\./\-]\d{1,2}[\./\-]\d{2,4}$', v)),
        }
        
        validator = validators.get(field_type)
        
        if not validator:
            return True  # Kein Validator = immer valid
        
        try:
            return bool(validator(value.strip()))
        except:
            return False


# Convenience functions
def normalize_value(value: Any, field_type: str) -> Optional[str]:
    """Schnelle Normalisierung ohne Instanziierung"""
    return FieldNormalizer.normalize(value, field_type)

def validate_value(value: str, field_type: str) -> bool:
    """Schnelle Validierung ohne Instanziierung"""
    return FieldNormalizer.validate(value, field_type)
