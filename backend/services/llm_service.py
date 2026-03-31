"""
LLM Service - OpenAI Integration
Echte KI-Integration ohne Mocks
"""
import os
import logging
from typing import Dict, List, Optional, Any
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class LLMService:
    """OpenAI Service für KI-Anfragen"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "4096"))
        self.temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))
        
        if not self.api_key:
            logger.warning("⚠️ OPENAI_API_KEY nicht gesetzt - LLM-Service nicht verfügbar")
            self.client = None
        else:
            self.client = OpenAI(api_key=self.api_key)
            logger.info(f"✅ OpenAI Client initialisiert (Model: {self.model})")
    
    def is_available(self) -> bool:
        """Prüft ob LLM-Service verfügbar ist"""
        return self.client is not None
    
    async def invoke(
        self, 
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        json_mode: bool = False
    ) -> Dict[str, Any]:
        """
        Führt LLM-Anfrage aus
        
        Args:
            prompt: User-Prompt
            system_prompt: Optional System-Anweisung
            temperature: Kreativität (0-1)
            max_tokens: Max Antwortlänge
            json_mode: JSON-Antwort erzwingen
            
        Returns:
            {
                "content": "Antwort-Text",
                "usage": {"prompt_tokens": 100, "completion_tokens": 50, "total_tokens": 150},
                "model": "gpt-4o-mini",
                "finish_reason": "stop"
            }
        """
        if not self.is_available():
            raise ValueError("OpenAI API Key nicht konfiguriert. Setze OPENAI_API_KEY in .env")
        
        # Messages aufbauen
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        # Parameters
        params = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature or self.temperature,
            "max_tokens": max_tokens or self.max_tokens
        }
        
        if json_mode:
            params["response_format"] = {"type": "json_object"}
        
        try:
            logger.info(f"🤖 LLM Request: {len(prompt)} chars, model={self.model}")
            
            response = self.client.chat.completions.create(**params)
            
            result = {
                "content": response.choices[0].message.content,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                },
                "model": response.model,
                "finish_reason": response.choices[0].finish_reason
            }
            
            logger.info(f"✅ LLM Response: {response.usage.total_tokens} tokens")
            return result
            
        except Exception as e:
            logger.error(f"❌ LLM Error: {e}")
            raise
    
    async def analyze_nebenkosten(
        self, 
        extracted_data: Dict[str, Any],
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analysiert Nebenkostenabrechnung mit LLM
        
        Args:
            extracted_data: Extrahierte PDF-Daten
            user_context: User-Profil (Wohnfläche, Personen, etc.)
            
        Returns:
            {
                "fehler": [...],
                "einsparpotenzial": [...],
                "rechtliche_hinweise": [...],
                "risiko_score": 0-100
            }
        """
        system_prompt = """Du bist ein Experte für deutsches Mietrecht und Nebenkostenabrechnungen.
        
Analysiere die Abrechnung und identifiziere:
1. **Formale Fehler** (Fristen, Pflichtangaben)
2. **Inhaltliche Fehler** (unzulässige Positionen, falsche Umlagen)
3. **Einsparpotenzial** (überhöhte Kosten)
4. **Rechtliche Handlungsoptionen**

Antworte strukturiert in JSON-Format."""

        user_prompt = f"""**NEBENKOSTENABRECHNUNG ANALYSE**

**Daten:**
{extracted_data}

**User-Kontext:**
{user_context or 'Keine Angaben'}

**Aufgabe:**
Analysiere die Abrechnung und gib folgendes JSON zurück:
```json
{{
  "fehler": [
    {{"typ": "formal|inhaltlich", "titel": "...", "beschreibung": "...", "schweregrad": "hoch|mittel|niedrig"}}
  ],
  "einsparpotenzial": [
    {{"position": "...", "betrag": 123.45, "grund": "..."}}
  ],
  "rechtliche_hinweise": ["...", "..."],
  "risiko_score": 75,
  "zusammenfassung": "..."
}}
```"""

        try:
            response = await self.invoke(
                prompt=user_prompt,
                system_prompt=system_prompt,
                json_mode=True,
                temperature=0.3  # Niedriger für präzise Analyse
            )
            
            import json
            result = json.loads(response["content"])
            return result
            
        except json.JSONDecodeError:
            # Fallback wenn JSON-Parsing fehlschlägt
            return {
                "fehler": [],
                "einsparpotenzial": [],
                "rechtliche_hinweise": [response["content"]],
                "risiko_score": 50,
                "zusammenfassung": "Analyse konnte nicht vollständig strukturiert werden."
            }
    
    async def chat_assistant(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        user_tier: str = "free"
    ) -> str:
        """
        Chat-Assistent für Mietrechts-Fragen
        
        Args:
            user_message: User-Nachricht
            conversation_history: Bisheriger Chat [{role, content}, ...]
            user_tier: free|basic|premium
            
        Returns:
            Antwort-Text
        """
        system_prompt = f"""Du bist ein freundlicher Experte für deutsches Mietrecht und Nebenkostenabrechnungen.

**Nutzer-Tier:** {user_tier}

**Antwort-Stil:**
- Freundlich und verständlich
- Konkrete, umsetzbare Tipps
- Bei rechtlichen Fragen: Hinweis auf Rechtsanwalt
- Strukturiert mit Aufzählungen
- Deutsch verwenden

**Einschränkungen:**
- KEINE medizinischen Ratschläge
- KEINE finanzielle Beratung außerhalb Mietrecht
- Bei Unsicherheit: Auf Experten verweisen"""

        # Messages aufbauen
        messages = [{"role": "system", "content": system_prompt}]
        
        if conversation_history:
            messages.extend(conversation_history[-10:])  # Letzte 10 Messages
        
        messages.append({"role": "user", "content": user_message})
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"❌ Chat Error: {e}")
            raise

# Global Instance
_llm_service = None

def get_llm_service() -> LLMService:
    """Singleton LLM Service"""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
