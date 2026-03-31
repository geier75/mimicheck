"""
PDF Filler Service
Befüllt PDF-Formulare (AcroForm oder HTML-Template).
"""
import logging
from typing import Dict, List, Any, Optional
from pathlib import Path
import tempfile

logger = logging.getLogger(__name__)

class PDFFiller:
    """Befüllt PDF-Formulare mit Daten"""
    
    def __init__(self):
        pass
    
    def fill_acroform(
        self, 
        src_path: str, 
        dst_path: str, 
        mappings: List[Dict[str, Any]],
        flatten: bool = True
    ) -> str:
        """
        Befüllt AcroForm-PDF mit Werten.
        
        Args:
            src_path: Quell-PDF
            dst_path: Ziel-PDF
            mappings: Liste von {field_id, value}
            flatten: Felder schreibgeschützt machen
            
        Returns:
            Pfad zur befüllten Datei
        """
        try:
            from pdfrw import PdfReader, PdfWriter, PdfDict, PdfName
            
            # PDF laden
            pdf = PdfReader(src_path)
            
            # Felder sammeln
            fields = {}
            for page in pdf.pages:
                if not page.Annots:
                    continue
                for annot in page.Annots:
                    if not annot.T:
                        continue
                    field_name = annot.T[1:-1] if annot.T.startswith('(') else annot.T
                    fields[field_name] = annot
            
            logger.info(f"Found {len(fields)} fillable fields")
            
            # Mappings anwenden
            filled_count = 0
            for mapping in mappings:
                field_id = mapping.get("field_id")
                value = mapping.get("value")
                
                if not field_id or value is None:
                    continue
                
                if field_id in fields:
                    annot = fields[field_id]
                    
                    # Wert setzen
                    if isinstance(value, bool):
                        # Checkbox: /Yes oder /Off
                        annot.V = PdfName.Yes if value else PdfName.Off
                        annot.AS = PdfName.Yes if value else PdfName.Off
                    else:
                        # Text
                        annot.V = f'({str(value)})'
                    
                    # Appearance zurücksetzen (wichtig für Rendering)
                    annot.AP = None
                    
                    # Readonly setzen bei flatten
                    if flatten:
                        annot.Ff = 1  # ReadOnly flag
                    
                    filled_count += 1
                    logger.debug(f"Filled field '{field_id}' = '{value}'")
            
            logger.info(f"Filled {filled_count}/{len(mappings)} fields")
            
            # PDF speichern
            PdfWriter().write(dst_path, pdf)
            
            return dst_path
            
        except ImportError:
            logger.error("pdfrw not installed")
            raise RuntimeError("pdfrw library required for AcroForm filling")
        except Exception as e:
            logger.error(f"AcroForm filling failed: {e}")
            raise
    
    def fill_html_template(
        self,
        template_path: str,
        output_path: str,
        data: Dict[str, Any]
    ) -> str:
        """
        Befüllt HTML-Template und konvertiert zu PDF (für nicht-AcroForm PDFs).
        
        Args:
            template_path: Jinja2-HTML-Template
            output_path: Ziel-PDF
            data: Template-Variablen
            
        Returns:
            Pfad zur PDF-Datei
        """
        try:
            from jinja2 import Template
            import weasyprint
            
            # Template laden
            with open(template_path, 'r', encoding='utf-8') as f:
                template = Template(f.read())
            
            # Rendern
            html_content = template.render(**data)
            
            # HTML → PDF
            weasyprint.HTML(string=html_content).write_pdf(output_path)
            
            logger.info(f"Generated PDF from HTML template: {output_path}")
            return output_path
            
        except ImportError:
            logger.error("weasyprint or jinja2 not installed")
            raise RuntimeError("weasyprint and jinja2 required for HTML templates")
        except Exception as e:
            logger.error(f"HTML template filling failed: {e}")
            raise
    
    def create_simple_form_pdf(
        self,
        output_path: str,
        title: str,
        fields: Dict[str, Any]
    ) -> str:
        """
        Erstellt einfaches PDF mit befüllten Feldern (Fallback ohne Template).
        
        Args:
            output_path: Ziel-PDF
            title: Formular-Titel
            fields: Dict von {label: value}
            
        Returns:
            Pfad zur PDF-Datei
        """
        try:
            from weasyprint import HTML
            
            # Simple HTML generieren
            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{ 
                        font-family: Arial, sans-serif; 
                        margin: 40px;
                        color: #333;
                    }}
                    h1 {{ 
                        color: #2563eb; 
                        border-bottom: 2px solid #2563eb;
                        padding-bottom: 10px;
                    }}
                    .field {{ 
                        margin: 15px 0; 
                        padding: 10px;
                        border-left: 3px solid #e5e7eb;
                    }}
                    .label {{ 
                        font-weight: bold; 
                        color: #6b7280;
                        display: block;
                        margin-bottom: 5px;
                    }}
                    .value {{ 
                        color: #111827;
                        font-size: 14px;
                    }}
                    .footer {{
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        color: #9ca3af;
                        font-size: 12px;
                    }}
                </style>
            </head>
            <body>
                <h1>{title}</h1>
            """
            
            for label, value in fields.items():
                html += f"""
                <div class="field">
                    <span class="label">{label}</span>
                    <span class="value">{value if value is not None else '—'}</span>
                </div>
                """
            
            html += """
                <div class="footer">
                    Erstellt mit MiMiCheck — www.mimicheck.ai
                </div>
            </body>
            </html>
            """
            
            # HTML → PDF
            HTML(string=html).write_pdf(output_path)
            
            logger.info(f"Created simple form PDF: {output_path}")
            return output_path
            
        except ImportError:
            logger.error("weasyprint not installed")
            raise RuntimeError("weasyprint required for PDF generation")
        except Exception as e:
            logger.error(f"Simple PDF creation failed: {e}")
            raise
    
    def fill_form(
        self,
        src_pdf_path: str,
        output_path: str,
        mappings: List[Dict[str, Any]],
        title: Optional[str] = None,
        fallback_to_simple: bool = True
    ) -> Dict[str, Any]:
        """
        Intelligentes Befüllen: Versucht AcroForm, fällt zurück auf Simple PDF.
        
        Returns:
            {
                "output_path": str,
                "method": "acroform" | "simple",
                "filled_count": int
            }
        """
        try:
            # Versuch 1: AcroForm
            result_path = self.fill_acroform(src_pdf_path, output_path, mappings)
            
            return {
                "output_path": result_path,
                "method": "acroform",
                "filled_count": len([m for m in mappings if m.get("value") is not None])
            }
            
        except Exception as e:
            logger.warning(f"AcroForm filling failed: {e}")
            
            if not fallback_to_simple:
                raise
            
            # Versuch 2: Simple PDF
            logger.info("Falling back to simple PDF generation")
            
            fields_dict = {
                m.get("label", m.get("field_id")): m.get("value")
                for m in mappings
                if m.get("value") is not None
            }
            
            if not title:
                title = Path(src_pdf_path).stem.replace('_', ' ').title()
            
            result_path = self.create_simple_form_pdf(output_path, title, fields_dict)
            
            return {
                "output_path": result_path,
                "method": "simple",
                "filled_count": len(fields_dict)
            }


# Convenience function
def fill_pdf(
    src_path: str,
    dst_path: str,
    mappings: List[Dict[str, Any]],
    title: Optional[str] = None
) -> Dict[str, Any]:
    """Schnelles Befüllen ohne Instanziierung"""
    filler = PDFFiller()
    return filler.fill_form(src_path, dst_path, mappings, title=title)
