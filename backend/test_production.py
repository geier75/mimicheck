#!/usr/bin/env python3
"""
Production Test Script
Testet ob alle Services ohne Mocks funktionieren
"""
import os
import sys
import asyncio
import logging
from pathlib import Path
import importlib

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

def test_imports():
    """Test 1: Alle Dependencies importierbar?"""
    logger.info("🧪 Test 1: Dependencies prüfen...")
    
    required = {
        "fastapi": "FastAPI",
        "openai": "OpenAI",
        "pdfplumber": "PDF Extraktion",
        "pdfrw": "PDF Befüllung",
        "weasyprint": "HTML→PDF",
        "pdfminer": "PDF Mining (pdfminer.six)"
    }
    
    missing = []
    for module, description in required.items():
        try:
            importlib.import_module(module)
            logger.info(f"  ✅ {description} ({module})")
        except ImportError:
            alt_name = module.replace("-", "_")
            try:
                importlib.import_module(alt_name)
                logger.info(f"  ✅ {description} ({module})")
            except ImportError:
                logger.error(f"  ❌ {description} ({module}) FEHLT!")
                missing.append(module)
    
    if missing:
        logger.error(f"\n❌ Fehlende Dependencies: {', '.join(missing)}")
        logger.info("\nInstalliere mit: pip install " + " ".join(missing))
        return False
    
    logger.info("✅ Alle Dependencies vorhanden\n")
    return True

def test_openai_config():
    """Test 2: OpenAI API Key konfiguriert?"""
    logger.info("🧪 Test 2: OpenAI Konfiguration...")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        logger.error("  ❌ OPENAI_API_KEY nicht in .env gesetzt!")
        logger.info("  → Erstelle .env und füge hinzu: OPENAI_API_KEY=sk-...")
        return False
    
    if api_key.startswith("sk-"):
        logger.info(f"  ✅ API Key gefunden: {api_key[:8]}...{api_key[-4:]}")
        logger.info(f"  📝 Model: {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')}")
        return True
    else:
        logger.error(f"  ❌ Ungültiger API Key Format: {api_key}")
        return False

async def test_llm_service():
    """Test 3: LLM Service funktioniert?"""
    logger.info("\n🧪 Test 3: LLM Service testen...")
    
    try:
        from services.llm_service import get_llm_service
        
        llm = get_llm_service()
        
        if not llm.is_available():
            logger.error("  ❌ LLM Service nicht verfügbar")
            return False
        
        logger.info("  🤖 Sende Test-Anfrage an OpenAI...")
        
        response = await llm.invoke(
            prompt="Sage 'Hallo' in einem Wort.",
            temperature=0.3,
            max_tokens=10
        )
        
        if response and response.get("content"):
            logger.info(f"  ✅ Antwort erhalten: {response['content'][:50]}")
            logger.info(f"  📊 Tokens: {response['usage']['total_tokens']}")
            logger.info(f"  🎯 Model: {response['model']}")
            return True
        else:
            logger.error("  ❌ Keine Antwort erhalten")
            return False
            
    except Exception as e:
        logger.error(f"  ❌ LLM Test fehlgeschlagen: {e}")
        return False

def test_pdf_extraction():
    """Test 4: PDF Extraction Service"""
    logger.info("\n🧪 Test 4: PDF Extraction Service...")
    
    try:
        from services.pdf_extraction_service import get_extraction_service
        
        extractor = get_extraction_service()
        logger.info(f"  ✅ Extraction Service initialisiert")
        logger.info(f"  📋 Verfügbare Methoden: {len(extractor.extraction_methods)}")
        
        if len(extractor.extraction_methods) == 0:
            logger.warning("  ⚠️ Keine Extraktionsmethoden verfügbar - installiere pdfplumber/pdfminer")
            return False
        
        return True
        
    except Exception as e:
        logger.error(f"  ❌ Extraction Test fehlgeschlagen: {e}")
        return False

def test_forms_service():
    """Test 5: Forms API (PDF Filler)"""
    logger.info("\n🧪 Test 5: Forms API (PDF Befüllung)...")
    
    try:
        from services.pdf_filler import PDFFiller
        from services.field_normalizer import FieldNormalizer
        
        filler = PDFFiller()
        normalizer = FieldNormalizer()
        
        # Test Normalisierung
        test_iban = "DE89370400440532013000"
        normalized = normalizer.normalize("iban", test_iban)
        
        logger.info(f"  ✅ PDF Filler initialisiert")
        logger.info(f"  ✅ Field Normalizer test: {test_iban} → {normalized}")
        
        return True
        
    except Exception as e:
        logger.error(f"  ❌ Forms Test fehlgeschlagen: {e}")
        return False

async def run_all_tests():
    """Führt alle Tests aus"""
    logger.info("=" * 60)
    logger.info("🚀 PRODUCTION TEST SUITE")
    logger.info("=" * 60 + "\n")
    
    results = []
    
    # Test 1: Imports
    results.append(("Dependencies", test_imports()))
    
    # Test 2: OpenAI Config
    results.append(("OpenAI Config", test_openai_config()))
    
    # Test 3: LLM Service (async)
    results.append(("LLM Service", await test_llm_service()))
    
    # Test 4: PDF Extraction
    results.append(("PDF Extraction", test_pdf_extraction()))
    
    # Test 5: Forms Service
    results.append(("Forms API", test_forms_service()))
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("📊 ERGEBNISSE:")
    logger.info("=" * 60)
    
    for name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        logger.info(f"  {status}: {name}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    
    logger.info("\n" + "=" * 60)
    logger.info(f"🎯 {passed}/{total} Tests bestanden")
    logger.info("=" * 60 + "\n")
    
    if passed == total:
        logger.info("✅ ALLE TESTS BESTANDEN - Production-Ready!")
        logger.info("\nStarte Backend mit:")
        logger.info("  python -m uvicorn main_enhanced:app --reload --host 127.0.0.1 --port 8000")
        return 0
    else:
        logger.error("❌ EINIGE TESTS FEHLGESCHLAGEN")
        logger.info("\nSiehe PRODUCTION-SETUP.md für Hilfe")
        return 1

if __name__ == "__main__":
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Run tests
    exit_code = asyncio.run(run_all_tests())
    sys.exit(exit_code)
